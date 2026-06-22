import type { LoopDecision } from "../contracts/decision.ts";
import type { StepResult } from "../contracts/step.ts";

export function classifyStep(result: StepResult): LoopDecision {
  if (result.kind === "final") {
    return { kind: "final", message: result.message };
  }

  if (result.kind === "overflow") {
    return { kind: "overflow", reason: result.reason };
  }

  if (result.kind === "retry") {
    return { kind: "retry", reason: result.reason };
  }

  if (result.kind === "failed") {
    return { kind: "failed", reason: result.reason };
  }

  if (result.call.requiresApproval) {
    return {
      kind: "approval",
      request: {
        id: `perm_${result.call.id}`,
        reason: `Tool '${result.call.name}' requires approval for ${result.call.risk} access.`,
        call: result.call
      }
    };
  }

  return { kind: "continue" };
}
