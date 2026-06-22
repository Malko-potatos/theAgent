import type { RuntimeEvent } from "./event.ts";
import type { PermissionRequest } from "./tool.ts";

export type TurnInput = {
  content: string;
  receivedAt?: string;
};

export type AgentMessage = {
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  toolCallId?: string;
};

export type TurnState = {
  turnId: string;
  input: TurnInput;
  messages: AgentMessage[];
  stepIndex: number;
  retryCount: number;
  maxSteps: number;
  maxRetries: number;
};

export type TurnOutcome =
  | { kind: "final"; message: string }
  | { kind: "waiting_for_approval"; request: PermissionRequest }
  | { kind: "overflow"; reason: string }
  | { kind: "failed"; reason: string };

export type TurnReport = {
  turnId: string;
  outcome: TurnOutcome;
  events: RuntimeEvent[];
};
