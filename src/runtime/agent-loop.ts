import type { ModelProvider, StepResult } from "../contracts/step.ts";
import type { ToolExecutor } from "../contracts/tool.ts";
import type { TurnOutcome, TurnReport, TurnState } from "../contracts/turn.ts";
import type { RuntimeEvent, RuntimeEventSink } from "../contracts/event.ts";
import { buildContext } from "./build-context.ts";
import { classifyStep } from "./classify-step.ts";
import { runStep } from "./run-step.ts";

export type AgentLoopDependencies = {
  model: ModelProvider;
  tools: ToolExecutor;
  events: RuntimeEventSink;
  getEvents: () => RuntimeEvent[];
  now?: () => string;
};

export async function agentLoop(state: TurnState, deps: AgentLoopDependencies): Promise<TurnReport> {
  const now = deps.now ?? (() => new Date().toISOString());

  while (state.stepIndex < state.maxSteps) {
    const stepId = `${state.turnId}_step_${state.stepIndex + 1}`;

    deps.events.append({
      type: "StepStarted",
      turnId: state.turnId,
      stepId,
      stepIndex: state.stepIndex,
      at: now()
    });

    const stepInput = {
      turnId: state.turnId,
      stepId,
      stepIndex: state.stepIndex,
      context: buildContext(state)
    };
    const result = await runStep(stepInput, deps.model);

    deps.events.append({
      type: "ModelStepCompleted",
      turnId: state.turnId,
      stepId,
      at: now(),
      result
    });

    const decision = classifyStep(result);

    if (decision.kind === "final") {
      const outcome: TurnOutcome = { kind: "final", message: decision.message };
      deps.events.append({ type: "TurnCompleted", turnId: state.turnId, at: now(), outcome });
      return { turnId: state.turnId, outcome, events: deps.getEvents() };
    }

    if (decision.kind === "approval") {
      if (result.kind === "tool_call") {
        deps.events.append({
          type: "ToolCallRequested",
          turnId: state.turnId,
          stepId,
          at: now(),
          call: result.call
        });
      }

      const outcome: TurnOutcome = { kind: "waiting_for_approval", request: decision.request };
      deps.events.append({
        type: "PermissionRequested",
        turnId: state.turnId,
        stepId,
        at: now(),
        request: decision.request
      });
      deps.events.append({ type: "TurnInterrupted", turnId: state.turnId, at: now(), outcome });
      return { turnId: state.turnId, outcome, events: deps.getEvents() };
    }

    if (decision.kind === "overflow") {
      const outcome: TurnOutcome = { kind: "overflow", reason: decision.reason };
      deps.events.append({
        type: "ContextOverflow",
        turnId: state.turnId,
        stepId,
        at: now(),
        reason: decision.reason
      });
      deps.events.append({ type: "TurnInterrupted", turnId: state.turnId, at: now(), outcome });
      return { turnId: state.turnId, outcome, events: deps.getEvents() };
    }

    if (decision.kind === "retry") {
      state.retryCount += 1;
      deps.events.append({
        type: "RetryRequested",
        turnId: state.turnId,
        stepId,
        at: now(),
        reason: decision.reason,
        retryCount: state.retryCount
      });

      if (state.retryCount > state.maxRetries) {
        return failTurn(state, deps, `Retry limit exceeded: ${decision.reason}`, now);
      }

      state.stepIndex += 1;
      continue;
    }

    if (decision.kind === "failed") {
      return failTurn(state, deps, decision.reason, now);
    }

    if (result.kind === "tool_call") {
      deps.events.append({
        type: "ToolCallRequested",
        turnId: state.turnId,
        stepId,
        at: now(),
        call: result.call
      });

      const observation = await deps.tools.execute(result.call);
      deps.events.append({
        type: "ToolCompleted",
        turnId: state.turnId,
        stepId,
        at: now(),
        observation
      });

      state.messages.push({
        role: "tool",
        toolCallId: observation.callId,
        content: JSON.stringify(observation.output ?? observation.error ?? null)
      });
      state.stepIndex += 1;
      continue;
    }

    return failTurn(state, deps, `Unhandled step result: ${describeResult(result)}`, now);
  }

  return failTurn(state, deps, `Step limit exceeded: ${state.maxSteps}`, now);
}

function failTurn(
  state: TurnState,
  deps: AgentLoopDependencies,
  reason: string,
  now: () => string
): TurnReport {
  const outcome: TurnOutcome = { kind: "failed", reason };
  deps.events.append({ type: "TurnFailed", turnId: state.turnId, at: now(), outcome });
  return { turnId: state.turnId, outcome, events: deps.getEvents() };
}

function describeResult(result: StepResult): string {
  return result.kind;
}
