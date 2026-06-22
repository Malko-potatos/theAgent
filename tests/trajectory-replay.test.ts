import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  buildContextProjection,
  buildTranscriptProjection,
  readTrajectoryJsonl,
  replayTrajectory,
  TrajectoryReplayError
} from "../src/trajectory/index.ts";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "trajectory");

test("replay reader rebuilds transcript and context from a final-only fixture", () => {
  const replay = replayTrajectory(readTrajectoryJsonl(join(fixtureDir, "normal-final.jsonl")));
  const transcript = buildTranscriptProjection(replay);
  const context = buildContextProjection(replay);

  assert.equal(replay.cursor?.eventId, "normal:e4");
  assert.deepEqual(transcript.messages, [
    { role: "user", content: "say done" },
    { role: "assistant", content: "done" }
  ]);
  assert.deepEqual(
    context.records.map((record) => record.type),
    ["message", "message", "step_result"]
  );
  assert.equal(context.records[0]?.sourceEventId, "normal:e1");
  assert.equal(context.records[1]?.sourceEventId, "normal:e3");
});

test("replay reader rebuilds tool call/result evidence into both projections", () => {
  const replay = replayTrajectory(readTrajectoryJsonl(join(fixtureDir, "tool-call-result.jsonl")));
  const transcript = buildTranscriptProjection(replay);
  const context = buildContextProjection(replay);

  assert.deepEqual(
    transcript.messages.map((message) => message.role),
    ["user", "assistant", "tool", "assistant"]
  );
  assert.equal(transcript.messages[1]?.content, "Tool call requested: echo(call_echo)");
  assert.equal(transcript.messages[2]?.toolCallId, "call_echo");
  assert.deepEqual(
    context.records.map((record) => record.type),
    ["message", "tool_call", "step_result", "tool_result", "message", "step_result"]
  );
  assert.equal(context.records.find((record) => record.type === "tool_call")?.sourceEventId, "tool:e3");
  assert.equal(context.records.find((record) => record.type === "tool_result")?.sourceEventId, "tool:e5");
});

test("replay cursor can rebuild a partial trajectory prefix", () => {
  const events = readTrajectoryJsonl(join(fixtureDir, "tool-call-result.jsonl"));
  const fullReplay = replayTrajectory(events);
  const partialReplay = replayTrajectory(events, {
    runId: "run_tool",
    sessionId: "session_tool",
    eventId: "tool:e5",
    seq: 5
  });
  const partialContext = buildContextProjection(partialReplay);

  assert.equal(fullReplay.events.length, 8);
  assert.equal(partialReplay.events.length, 5);
  assert.equal(partialReplay.cursor?.eventId, "tool:e5");
  assert.deepEqual(
    partialContext.records.map((record) => record.type),
    ["message", "tool_call", "step_result", "tool_result"]
  );
});

test("permission pause fixture replays without fabricating a tool result", () => {
  const replay = replayTrajectory(readTrajectoryJsonl(join(fixtureDir, "permission-pause.jsonl")));
  const transcript = buildTranscriptProjection(replay);
  const context = buildContextProjection(replay);

  assert.ok(transcript.messages.some((message) => message.content === "Permission requested: write_file requires approval"));
  assert.equal(context.records.some((record) => record.type === "tool_result"), false);
  assert.equal(context.records.some((record) => record.type === "tool_call"), true);
});

test("resume fixture replays interrupted prefix and continuation projections", () => {
  const events = readTrajectoryJsonl(join(fixtureDir, "resume-from-interrupted-turn.jsonl"));
  const interruptedReplay = replayTrajectory(events, {
    runId: "run_resume",
    sessionId: "session_resume",
    eventId: "resume:e6",
    seq: 6
  });
  const fullReplay = replayTrajectory(events);
  const interruptedContext = buildContextProjection(interruptedReplay);
  const fullTranscript = buildTranscriptProjection(fullReplay);
  const fullContext = buildContextProjection(fullReplay);

  assert.deepEqual(
    interruptedContext.records.map((record) => record.type),
    ["message", "tool_call", "step_result"]
  );
  assert.ok(fullTranscript.messages.some((message) => message.content === "Resume requested from resume:e6."));
  assert.ok(fullTranscript.messages.some((message) => message.content === "Permission allow for call_write."));
  assert.ok(fullTranscript.messages.some((message) => message.content === "Tool execution started: write_file(call_write)."));
  assert.deepEqual(
    fullContext.records.map((record) => record.type),
    ["message", "tool_call", "step_result", "message", "tool_result", "message", "step_result"]
  );
  assert.equal(fullContext.records.find((record) => record.type === "tool_result")?.sourceEventId, "resume:e11");
  assert.equal(fullReplay.cursor?.eventId, "resume:e14");
});

test("fork and compaction events are replayed as explicit projection evidence", () => {
  const forkReplay = replayTrajectory(readTrajectoryJsonl(join(fixtureDir, "fork-created.jsonl")));
  const compactionReplay = replayTrajectory(readTrajectoryJsonl(join(fixtureDir, "compaction-completed.jsonl")));
  const forkTranscript = buildTranscriptProjection(forkReplay);
  const compactionContext = buildContextProjection(compactionReplay);

  assert.equal(forkTranscript.messages[0]?.content, "Fork created from parent:e9.");
  assert.equal(
    compactionContext.records.find((record) => record.sourceEventId === "compaction:e3")?.type,
    "message"
  );
  assert.equal(
    compactionContext.records.find((record) => record.sourceEventId === "compaction:e3" && record.type === "message")?.message.content,
    "Earlier work was summarized without splitting tool-call/result pairs."
  );
});

test("replay reader rejects broken trajectory chains before projection", () => {
  const events = readTrajectoryJsonl(join(fixtureDir, "normal-final.jsonl"));
  const broken = events.map((event) => ({ ...event }));
  broken[2] = { ...broken[2], previousEventId: "normal:wrong" };

  assert.throws(() => replayTrajectory(broken), TrajectoryReplayError);
});
