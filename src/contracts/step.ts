import type { ToolCallRequest } from "./tool.ts";
import type { AgentMessage } from "./turn.ts";

export type RuntimeContext = {
  messages: AgentMessage[];
  tokenBudget?: number;
};

export type StepInput = {
  turnId: string;
  stepId: string;
  stepIndex: number;
  context: RuntimeContext;
};

export type StepResult =
  | { kind: "final"; message: string }
  | { kind: "tool_call"; call: ToolCallRequest }
  | { kind: "overflow"; reason: string }
  | { kind: "retry"; reason: string }
  | { kind: "failed"; reason: string };

export type ModelProvider = {
  runStep(input: StepInput): Promise<StepResult>;
};
