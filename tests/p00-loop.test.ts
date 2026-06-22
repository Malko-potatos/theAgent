import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { TrajectoryEvent } from "../src/contracts/index.ts";
import { createFakeModel, createFakeToolExecutor, InMemoryEventLog, JsonlTrajectoryStore } from "../src/harness/index.ts";
import { runTurn } from "../src/runtime/index.ts";
import { verifyTrajectoryEvents, verifyTurnReport } from "../src/verification/index.ts";

test("final-only fake model completes a turn", async () => {
  const events = new InMemoryEventLog();
  const report = await runTurn(
    { content: "say done" },
    {
      model: createFakeModel([{ kind: "final", message: "done" }]),
      tools: createFakeToolExecutor(),
      events,
      getEvents: () => events.all()
    },
    { turnId: "turn_final" }
  );

  const evidence = verifyTurnReport(report);

  assert.equal(report.outcome.kind, "final");
  assert.equal(evidence.ok, true);
  assert.deepEqual(report.events.map((event) => event.type), [
    "TurnStarted",
    "StepStarted",
    "ModelStepCompleted",
    "TurnCompleted"
  ]);
});

test("safe fake tool call executes and then reaches final", async () => {
  const events = new InMemoryEventLog();
  const report = await runTurn(
    { content: "echo hello" },
    {
      model: createFakeModel([
        {
          kind: "tool_call",
          call: {
            id: "call_echo",
            name: "echo",
            input: { text: "hello" },
            risk: "read",
            requiresApproval: false
          }
        },
        { kind: "final", message: "echo complete" }
      ]),
      tools: createFakeToolExecutor({
        echo: (call) => ({ echoed: call.input.text })
      }),
      events,
      getEvents: () => events.all()
    },
    { turnId: "turn_tool" }
  );

  const evidence = verifyTurnReport(report);

  assert.equal(report.outcome.kind, "final");
  assert.equal(evidence.ok, true);
  assert.ok(report.events.some((event) => event.type === "ToolCallRequested"));
  assert.ok(report.events.some((event) => event.type === "ToolCompleted"));
});

test("jsonl trajectory store persists replayable event and context logs", async () => {
  const runDirectory = mkdtempSync(join(tmpdir(), "the-agent-l08-"));
  const events = new JsonlTrajectoryStore({ runId: "run_l08_jsonl", runDirectory });
  const report = await runTurn(
    { content: "echo persisted hello" },
    {
      model: createFakeModel([
        {
          kind: "tool_call",
          call: {
            id: "call_persisted_echo",
            name: "echo",
            input: { text: "persisted hello" },
            risk: "read",
            requiresApproval: false
          }
        },
        { kind: "final", message: "persisted echo complete" }
      ]),
      tools: createFakeToolExecutor({
        echo: (call) => ({ echoed: call.input.text })
      }),
      events,
      getEvents: () => events.all()
    },
    { turnId: "turn_l08_jsonl" }
  );

  const reportEvidence = verifyTurnReport(report);
  const trajectoryEvidence = verifyTrajectoryEvents(events.trajectoryEvents());
  const eventLog = readFileSync(events.eventLogPath, "utf8").trim().split(/\r?\n/u);
  const contextLog = readFileSync(events.contextLogPath, "utf8").trim().split(/\r?\n/u);

  assert.equal(report.outcome.kind, "final");
  assert.equal(reportEvidence.ok, true);
  assert.equal(trajectoryEvidence.ok, true);
  assert.equal(existsSync(events.eventLogPath), true);
  assert.equal(existsSync(events.contextLogPath), true);
  assert.equal(JSON.parse(eventLog[0]).seq, 1);
  assert.equal(JSON.parse(eventLog.at(-1) ?? "{}").type, "TurnCompleted");
  assert.ok(contextLog.some((line) => JSON.parse(line).type === "tool_call"));
  assert.ok(contextLog.some((line) => JSON.parse(line).type === "tool_result"));
});

test("trajectory verifier rejects gapped seq and orphaned tool results", () => {
  const at = "2026-06-19T00:00:00.000Z";
  const events: TrajectoryEvent[] = [
    {
      schemaVersion: 1,
      runId: "run_bad",
      turnId: "turn_bad",
      seq: 1,
      at,
      type: "TurnStarted",
      payload: { type: "TurnStarted", turnId: "turn_bad", at, input: { content: "bad run" } }
    },
    {
      schemaVersion: 1,
      runId: "run_bad",
      turnId: "turn_bad",
      seq: 3,
      previousSeq: 1,
      at,
      type: "ToolCompleted",
      payload: {
        type: "ToolCompleted",
        turnId: "turn_bad",
        stepId: "turn_bad_step_1",
        at,
        observation: { callId: "missing_call", name: "echo", ok: true, output: "orphan" }
      }
    },
    {
      schemaVersion: 1,
      runId: "run_bad",
      turnId: "turn_bad",
      seq: 4,
      previousSeq: 3,
      at,
      type: "TurnCompleted",
      payload: {
        type: "TurnCompleted",
        turnId: "turn_bad",
        at,
        outcome: { kind: "final", message: "bad" }
      }
    }
  ];

  const evidence = verifyTrajectoryEvents(events);

  assert.equal(evidence.ok, false);
  assert.equal(evidence.checks.find((item) => item.name === "event_sequence_is_contiguous")?.ok, false);
  assert.equal(evidence.checks.find((item) => item.name === "tool_calls_are_resolved")?.ok, false);
});

test("approval-required fake tool call pauses before execution", async () => {
  const events = new InMemoryEventLog();
  const report = await runTurn(
    { content: "write file" },
    {
      model: createFakeModel([
        {
          kind: "tool_call",
          call: {
            id: "call_write",
            name: "write_file",
            input: { path: "outputs/example.txt" },
            risk: "write",
            requiresApproval: true
          }
        }
      ]),
      tools: createFakeToolExecutor({
        write_file: () => {
          throw new Error("This fake write should not execute before approval.");
        }
      }),
      events,
      getEvents: () => events.all()
    },
    { turnId: "turn_approval" }
  );

  const evidence = verifyTurnReport(report);

  assert.equal(report.outcome.kind, "waiting_for_approval");
  assert.equal(evidence.ok, true);
  assert.ok(report.events.some((event) => event.type === "PermissionRequested"));
  assert.equal(report.events.some((event) => event.type === "ToolCompleted"), false);
});

test("overflow returns an interrupted overflow outcome", async () => {
  const events = new InMemoryEventLog();
  const report = await runTurn(
    { content: "too much context" },
    {
      model: createFakeModel([{ kind: "overflow", reason: "context budget exceeded" }]),
      tools: createFakeToolExecutor(),
      events,
      getEvents: () => events.all()
    },
    { turnId: "turn_overflow" }
  );

  const evidence = verifyTurnReport(report);

  assert.equal(report.outcome.kind, "overflow");
  assert.equal(evidence.ok, true);
  assert.ok(report.events.some((event) => event.type === "ContextOverflow"));
  assert.ok(report.events.some((event) => event.type === "TurnInterrupted"));
});

test("retry can continue to a later successful step", async () => {
  const events = new InMemoryEventLog();
  const report = await runTurn(
    { content: "retry once" },
    {
      model: createFakeModel([
        { kind: "retry", reason: "temporary provider error" },
        { kind: "final", message: "retry recovered" }
      ]),
      tools: createFakeToolExecutor(),
      events,
      getEvents: () => events.all()
    },
    { turnId: "turn_retry", maxRetries: 1 }
  );

  const evidence = verifyTurnReport(report);

  assert.equal(report.outcome.kind, "final");
  assert.equal(evidence.ok, true);
  assert.ok(report.events.some((event) => event.type === "RetryRequested"));
  assert.equal(
    report.events.filter((event) => event.type === "StepStarted").length,
    2
  );
});

test("failed step returns failed outcome with evidence", async () => {
  const events = new InMemoryEventLog();
  const report = await runTurn(
    { content: "fail" },
    {
      model: createFakeModel([{ kind: "failed", reason: "model refused contract" }]),
      tools: createFakeToolExecutor(),
      events,
      getEvents: () => events.all()
    },
    { turnId: "turn_failed" }
  );

  const evidence = verifyTurnReport(report);

  assert.equal(report.outcome.kind, "failed");
  assert.equal(evidence.ok, true);
  assert.ok(report.events.some((event) => event.type === "TurnFailed"));
});
