import type { ModelProvider, StepInput, StepResult } from "../contracts/step.ts";

export type FakeModelAction = StepResult | ((input: StepInput) => StepResult | Promise<StepResult>);

export function createFakeModel(actions: FakeModelAction[]): ModelProvider {
  let cursor = 0;

  return {
    async runStep(input: StepInput): Promise<StepResult> {
      const action = actions[cursor] ?? actions[actions.length - 1];
      cursor += 1;

      if (!action) {
        return { kind: "failed", reason: "Fake model has no scripted actions." };
      }

      if (typeof action === "function") {
        return action(input);
      }

      return action;
    }
  };
}
