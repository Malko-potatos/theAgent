import type { RuntimeContext } from "../contracts/step.ts";
import type { TurnState } from "../contracts/turn.ts";

export function buildContext(state: TurnState): RuntimeContext {
  return {
    messages: [...state.messages],
    tokenBudget: 4096
  };
}
