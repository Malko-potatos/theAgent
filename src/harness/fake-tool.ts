import type { ToolCallRequest, ToolExecutor, ToolObservation } from "../contracts/tool.ts";

export type FakeToolHandler = (call: ToolCallRequest) => unknown | Promise<unknown>;

export function createFakeToolExecutor(handlers: Record<string, FakeToolHandler> = {}): ToolExecutor {
  return {
    async execute(call: ToolCallRequest): Promise<ToolObservation> {
      const handler = handlers[call.name] ?? ((request) => request.input);

      try {
        return {
          callId: call.id,
          name: call.name,
          ok: true,
          output: await handler(call)
        };
      } catch (error) {
        return {
          callId: call.id,
          name: call.name,
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  };
}
