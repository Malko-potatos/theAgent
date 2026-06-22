import type { ModelProvider } from "../contracts/step.ts";
import type { ToolExecutor } from "../contracts/tool.ts";
import type { TurnInput, TurnReport, TurnState } from "../contracts/turn.ts";
import type { RuntimeEvent, RuntimeEventSink } from "../contracts/event.ts";
import { agentLoop } from "./agent-loop.ts";

export type RunTurnConfig = {
  turnId?: string;
  maxSteps?: number;
  maxRetries?: number;
  now?: () => string;
};

export type RunTurnDependencies = {
  model: ModelProvider;
  tools: ToolExecutor;
  events: RuntimeEventSink;
  getEvents: () => RuntimeEvent[];
};

export async function runTurn(
  input: TurnInput,
  deps: RunTurnDependencies,
  config: RunTurnConfig = {}
): Promise<TurnReport> {
  const now = config.now ?? (() => new Date().toISOString());
  const turnId = config.turnId ?? `turn_${Date.now()}`;
  const state: TurnState = {
    turnId,
    input,
    messages: [{ role: "user", content: input.content }],
    stepIndex: 0,
    retryCount: 0,
    maxSteps: config.maxSteps ?? 8,
    maxRetries: config.maxRetries ?? 1
  };

  deps.events.append({
    type: "TurnStarted",
    turnId,
    at: now(),
    input
  });

  return agentLoop(state, {
    model: deps.model,
    tools: deps.tools,
    events: deps.events,
    getEvents: deps.getEvents,
    now
  });
}
