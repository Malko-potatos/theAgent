import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import type { TrajectoryAppendInput, TrajectoryEvent } from "../src/contracts/index.ts";
import { JsonlTrajectoryStore } from "../src/harness/index.ts";
import {
  buildContextProjection,
  buildTranscriptProjection,
  createTrajectoryKernel,
  createTrajectoryKernelFromStorage,
  hashTrajectoryEvent,
  readTrajectoryJsonl,
  readTrajectoryKernelJsonl,
  TrajectoryReplayError
} from "../src/trajectory/index.ts";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "trajectory");

test("trajectory kernel loads fixture evidence and routes replay/validation through the accepted boundary", () => {
  const kernel = readTrajectoryKernelJsonl(join(fixtureDir, "resume-from-interrupted-turn.jsonl"));
  const replay = kernel.replay();
  const transcript = buildTranscriptProjection(replay);
  const context = buildContextProjection(replay);
  const checks = kernel.validate();

  assert.equal(replay.cursor?.eventId, "resume:e14");
  assert.equal(checks.every((check) => check.ok), true);
  assert.ok(transcript.messages.some((message) => message.content === "Resume requested from resume:e6."));
  assert.equal(context.records.find((record) => record.type === "tool_result")?.sourceEventId, "resume:e11");
});

test("trajectory kernel append owns event identity, sequence, and previous hash", () => {
  const kernel = createTrajectoryKernel({ runId: "run_kernel", sessionId: "session_kernel" });
  const inputs = readTrajectoryJsonl(join(fixtureDir, "normal-final.jsonl")).map(stripKernelOwnedFields);
  const [first, second, third, fourth] = inputs.map((input) => kernel.append({
    ...input,
    runId: "run_kernel",
    sessionId: "session_kernel"
  }));
  const replay = kernel.replay();

  assert.equal(first.id, "run_kernel:event:1");
  assert.equal(second.seq, 2);
  assert.equal(second.previousEventId, first.id);
  assert.equal(second.previousSeq, first.seq);
  assert.equal(second.previousHash, hashTrajectoryEvent(first));
  assert.equal(fourth.kind, "TurnCompleted");
  assert.equal(replay.events.length, 4);
  assert.equal(kernel.validate().every((check) => check.ok), true);
  assert.equal(third.previousEventId, second.id);
});

test("trajectory kernel rejects mismatched identity and broken initial ledgers", () => {
  const kernel = createTrajectoryKernel({ runId: "run_kernel", sessionId: "session_kernel" });
  const [first] = readTrajectoryJsonl(join(fixtureDir, "normal-final.jsonl")).map(stripKernelOwnedFields);

  assert.throws(() => kernel.append(first), TrajectoryReplayError);

  const broken = readTrajectoryJsonl(join(fixtureDir, "normal-final.jsonl"));
  broken[2] = { ...broken[2], previousEventId: "wrong" };

  assert.throws(() => readTrajectoryKernelJsonlFromEventsForTest(broken), TrajectoryReplayError);
});

test("trajectory kernel persists canonical appends through a storage adapter", () => {
  const runDirectory = mkdtempSync(join(tmpdir(), "the-agent-kernel-storage-"));
  const storage = new JsonlTrajectoryStore({ runId: "run_kernel_persisted", runDirectory });
  const kernel = createTrajectoryKernelFromStorage({
    runId: "run_kernel_persisted",
    sessionId: "session_kernel_persisted",
    storage
  });
  const inputs = readTrajectoryJsonl(join(fixtureDir, "normal-final.jsonl")).map(stripKernelOwnedFields);

  for (const input of inputs) {
    kernel.append({
      ...input,
      runId: "run_kernel_persisted",
      sessionId: "session_kernel_persisted"
    });
  }

  const reopenedStorage = new JsonlTrajectoryStore({ runId: "run_kernel_persisted", runDirectory });
  const reopenedKernel = createTrajectoryKernelFromStorage({
    runId: "run_kernel_persisted",
    sessionId: "session_kernel_persisted",
    storage: reopenedStorage
  });
  const eventLog = readFileSync(storage.eventLogPath, "utf8").trim().split(/\r?\n/u);
  const contextLog = readFileSync(storage.contextLogPath, "utf8").trim().split(/\r?\n/u);

  assert.equal(kernel.validate().every((check) => check.ok), true);
  assert.equal(reopenedKernel.replay().cursor?.seq, 4);
  assert.equal(reopenedKernel.validate().every((check) => check.ok), true);
  assert.equal(existsSync(storage.eventLogPath), true);
  assert.equal(existsSync(storage.contextLogPath), true);
  assert.equal(eventLog.length, 4);
  assert.equal(JSON.parse(eventLog.at(-1) ?? "{}").id, "run_kernel_persisted:event:4");
  assert.ok(contextLog.some((line) => JSON.parse(line).message?.content === "done"));
});

function stripKernelOwnedFields(event: TrajectoryEvent): TrajectoryAppendInput {
  const {
    id: _id,
    seq: _seq,
    previousEventId: _previousEventId,
    previousSeq: _previousSeq,
    previousHash: _previousHash,
    ...input
  } = event;

  return input;
}

function readTrajectoryKernelJsonlFromEventsForTest(events: TrajectoryEvent[]) {
  const first = events[0];
  return createTrajectoryKernel({
    runId: first.runId,
    sessionId: first.sessionId,
    events
  });
}
