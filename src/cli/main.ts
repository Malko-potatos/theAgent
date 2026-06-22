import { createFakeModel, createFakeToolExecutor, JsonlTrajectoryStore } from "../harness/index.ts";
import { runTurn } from "../runtime/index.ts";
import { verifyTrajectoryEvents, verifyTurnReport } from "../verification/index.ts";

const input = process.argv.slice(2).join(" ") || "hello";
const runId = `run_cli_${new Date().toISOString().replace(/[:.]/gu, "-")}`;
const events = new JsonlTrajectoryStore({ runId });

const model = createFakeModel([
  {
    kind: "tool_call",
    call: {
      id: "call_echo_1",
      name: "echo",
      input: { text: input },
      risk: "read",
      requiresApproval: false
    }
  },
  {
    kind: "final",
    message: `Completed fake turn for: ${input}`
  }
]);

const tools = createFakeToolExecutor({
  echo: (call) => ({ echoed: call.input.text })
});

const report = await runTurn(
  { content: input },
  { model, tools, events, getEvents: () => events.all() },
  { turnId: "turn_cli_smoke" }
);
const evidence = verifyTurnReport(report);
const trajectoryEvidence = verifyTrajectoryEvents(events.trajectoryEvents());

console.log(JSON.stringify({
  report,
  evidence,
  trajectoryEvidence,
  trajectory: {
    runId,
    eventLogPath: events.eventLogPath,
    contextLogPath: events.contextLogPath
  }
}, null, 2));

if (!evidence.ok || !trajectoryEvidence.ok) {
  process.exitCode = 1;
}
