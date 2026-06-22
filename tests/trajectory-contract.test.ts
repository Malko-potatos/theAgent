import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import type { TrajectoryEvent } from "../src/contracts/index.ts";
import { verifyTrajectoryEvents } from "../src/verification/index.ts";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "trajectory");

const fixtureNames = [
  "normal-final.jsonl",
  "tool-call-result.jsonl",
  "permission-pause.jsonl",
  "fork-created.jsonl",
  "compaction-completed.jsonl",
  "resume-from-interrupted-turn.jsonl"
];

test("trajectory fixtures satisfy the L08 envelope contract", () => {
  for (const fixtureName of fixtureNames) {
    const events = readFixture(fixtureName);
    const evidence = verifyTrajectoryEvents(events);

    assert.equal(
      evidence.ok,
      true,
      `${fixtureName} failed checks: ${evidence.checks.filter((check) => !check.ok).map((check) => check.name).join(", ")}`
    );
    assert.ok(events.every((event) => event.schemaVersion === 1));
    assert.ok(events.every((event) => event.id.length > 0));
    assert.ok(events.every((event) => event.runId.length > 0));
    assert.ok(events.every((event) => event.sessionId.length > 0));
    assert.ok(events.every((event) => event.kind === event.type));
    assert.ok(events.every((event) => event.visibility === "internal" || event.visibility === "public"));
  }
});

test("tool fixture fixes tool request/result pairing as contract evidence", () => {
  const events = readFixture("tool-call-result.jsonl");
  const toolRequest = events.find((event) => event.kind === "ToolCallRequested");
  const toolResult = events.find((event) => event.kind === "ToolCompleted");

  assert.equal(toolRequest?.payload.call.id, "call_echo");
  assert.equal(toolResult?.payload.observation.callId, "call_echo");
});

test("permission fixture pauses without a tool result", () => {
  const events = readFixture("permission-pause.jsonl");

  assert.ok(events.some((event) => event.kind === "PermissionRequested"));
  assert.ok(events.some((event) => event.kind === "TurnInterrupted"));
  assert.equal(events.some((event) => event.kind === "ToolCompleted"), false);
});

test("fork and compaction fixtures carry explicit source references", () => {
  const forkEvents = readFixture("fork-created.jsonl");
  const compactionEvents = readFixture("compaction-completed.jsonl");

  const fork = forkEvents.find((event) => event.kind === "ForkCreated");
  const compaction = compactionEvents.find((event) => event.kind === "CompactionCompleted");

  assert.deepEqual(fork?.refs, [{ kind: "event", eventId: "parent:e9" }]);
  assert.deepEqual(compaction?.refs, [
    { kind: "event_range", fromEventId: "history:e10", toEventId: "history:e42" }
  ]);
});

test("resume fixture records replay cursor and approval resolution before continuation", () => {
  const events = readFixture("resume-from-interrupted-turn.jsonl");
  const resume = events.find((event) => event.kind === "ResumeRequested");
  const permissionResolved = events.find((event) => event.kind === "PermissionResolved");
  const toolCompleted = events.find((event) => event.kind === "ToolCompleted");

  assert.deepEqual(resume?.refs, [{ kind: "event", eventId: "resume:e6" }]);
  assert.equal(resume?.payload.replayCursor.eventId, "resume:e6");
  assert.deepEqual(permissionResolved?.refs, [{ kind: "event", eventId: "resume:e5" }]);
  assert.equal(permissionResolved?.payload.decision, "allow");
  assert.equal(toolCompleted?.payload.observation.callId, "call_write");
});

function readFixture(name: string): TrajectoryEvent[] {
  return readFileSync(join(fixtureDir, name), "utf8")
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line) as TrajectoryEvent);
}
