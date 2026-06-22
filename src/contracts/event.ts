import type { StepResult } from "./step.ts";
import type { PermissionRequest, ToolCallRequest, ToolObservation } from "./tool.ts";
import type { TurnInput, TurnOutcome } from "./turn.ts";

export type RuntimeEvent =
  | { type: "TurnStarted"; turnId: string; at: string; input: TurnInput }
  | { type: "StepStarted"; turnId: string; stepId: string; stepIndex: number; at: string }
  | { type: "ModelStepCompleted"; turnId: string; stepId: string; at: string; result: StepResult }
  | { type: "ToolCallRequested"; turnId: string; stepId: string; at: string; call: ToolCallRequest }
  | { type: "PermissionRequested"; turnId: string; stepId: string; at: string; request: PermissionRequest }
  | { type: "ToolCompleted"; turnId: string; stepId: string; at: string; observation: ToolObservation }
  | { type: "ContextOverflow"; turnId: string; stepId: string; at: string; reason: string }
  | { type: "RetryRequested"; turnId: string; stepId: string; at: string; reason: string; retryCount: number }
  | { type: "TurnCompleted"; turnId: string; at: string; outcome: TurnOutcome }
  | { type: "TurnInterrupted"; turnId: string; at: string; outcome: TurnOutcome }
  | { type: "TurnFailed"; turnId: string; at: string; outcome: TurnOutcome };

export type RuntimeEventSink = {
  append(event: RuntimeEvent): void;
};
