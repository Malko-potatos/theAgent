import type { PermissionRequest } from "./tool.ts";

export type LoopDecision =
  | { kind: "continue" }
  | { kind: "approval"; request: PermissionRequest }
  | { kind: "overflow"; reason: string }
  | { kind: "retry"; reason: string }
  | { kind: "final"; message: string }
  | { kind: "failed"; reason: string };
