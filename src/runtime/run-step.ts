import type { ModelProvider, StepInput, StepResult } from "../contracts/step.ts";

export async function runStep(input: StepInput, model: ModelProvider): Promise<StepResult> {
  return model.runStep(input);
}
