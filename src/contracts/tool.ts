export type ToolRisk = "read" | "write" | "network" | "shell" | "external";

export type ToolCallRequest = {
  id: string;
  name: string;
  input: Record<string, unknown>;
  risk: ToolRisk;
  requiresApproval: boolean;
};

export type ToolObservation = {
  callId: string;
  name: string;
  ok: boolean;
  output?: unknown;
  error?: string;
};

export type PermissionRequest = {
  id: string;
  reason: string;
  call: ToolCallRequest;
};

export type ToolExecutor = {
  execute(call: ToolCallRequest): Promise<ToolObservation>;
};
