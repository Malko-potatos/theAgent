import type { RuntimeEvent } from "../contracts/event.ts";
import type {
  ContextProjectionRecord,
  ContextRecord,
  ProjectionBuilder,
  ReplayResult,
  TrajectoryEvent,
  TranscriptProjectionRecord
} from "../contracts/trajectory.ts";
import type { AgentMessage } from "../contracts/turn.ts";
import { isRuntimeEventPayload } from "./replay-reader.ts";

export type ProjectionBuildOptions = {
  builtAt?: string;
  projectionId?: string;
};

type ContextBaseForBuild = {
  schemaVersion: 1;
  runId: string;
  sessionId: string;
  turnId?: string;
  at: string;
  sourceEventId: string;
  sourceEventSeq: number;
};

export const transcriptProjectionBuilder: ProjectionBuilder<TranscriptProjectionRecord> = {
  projectionKind: "transcript",
  build: (replay) => buildTranscriptProjection(replay)
};

export const contextProjectionBuilder: ProjectionBuilder<ContextProjectionRecord> = {
  projectionKind: "context",
  build: (replay) => buildContextProjection(replay)
};

export function buildTranscriptProjection(
  replay: ReplayResult,
  options: ProjectionBuildOptions = {}
): TranscriptProjectionRecord {
  return {
    schemaVersion: 1,
    projectionId: options.projectionId ?? `${replay.runId}:projection:transcript:${lastSeq(replay)}`,
    projectionKind: "transcript",
    runId: replay.runId,
    sessionId: replay.sessionId,
    sourceEventIds: replay.events.map((event) => event.id),
    builtAt: options.builtAt ?? lastTimestamp(replay),
    messages: replay.events.flatMap((event) => transcriptMessagesForEvent(event))
  };
}

export function buildContextProjection(
  replay: ReplayResult,
  options: ProjectionBuildOptions = {}
): ContextProjectionRecord {
  const records: ContextRecord[] = [];

  for (const event of replay.events) {
    for (const record of contextRecordsForEvent(event, records.length + 1)) {
      records.push(record);
    }
  }

  return {
    schemaVersion: 1,
    projectionId: options.projectionId ?? `${replay.runId}:projection:context:${lastSeq(replay)}`,
    projectionKind: "context",
    runId: replay.runId,
    sessionId: replay.sessionId,
    sourceEventIds: replay.events.map((event) => event.id),
    builtAt: options.builtAt ?? lastTimestamp(replay),
    records
  };
}

function transcriptMessagesForEvent(event: TrajectoryEvent): AgentMessage[] {
  if (isRuntimeEventPayload(event.payload)) {
    return transcriptMessagesForRuntimeEvent(event.payload);
  }

  if (event.kind === "ForkCreated") {
    return [{ role: "system", content: `Fork created from ${stringField(event.payload, "parentEventId") ?? "unknown event"}.` }];
  }

  if (event.kind === "CompactionCompleted") {
    return [{ role: "system", content: `Compaction summary: ${stringField(event.payload, "summary") ?? ""}`.trim() }];
  }

  if (event.kind === "ResumeRequested") {
    return [{
      role: "system",
      content: `Resume requested from ${stringField(event.payload, "fromEventId") ?? "unknown event"}.`
    }];
  }

  if (event.kind === "PermissionResolved") {
    return [{
      role: "system",
      content: `Permission ${stringField(event.payload, "decision") ?? "resolved"} for ${stringField(event.payload, "callId") ?? "unknown call"}.`
    }];
  }

  if (event.kind === "ToolExecutionStarted") {
    return [{
      role: "system",
      content: `Tool execution started: ${stringField(event.payload, "toolName") ?? "unknown tool"}(${stringField(event.payload, "toolCallId") ?? "unknown call"}).`
    }];
  }

  return [];
}

function transcriptMessagesForRuntimeEvent(event: RuntimeEvent): AgentMessage[] {
  if (event.type === "TurnStarted") {
    return [{ role: "user", content: event.input.content }];
  }

  if (event.type === "ModelStepCompleted" && event.result.kind === "final") {
    return [{ role: "assistant", content: event.result.message }];
  }

  if (event.type === "ModelStepCompleted" && event.result.kind === "tool_call") {
    return [{
      role: "assistant",
      content: `Tool call requested: ${event.result.call.name}(${event.result.call.id})`
    }];
  }

  if (event.type === "PermissionRequested") {
    return [{ role: "system", content: `Permission requested: ${event.request.reason}` }];
  }

  if (event.type === "ToolCompleted") {
    return [{
      role: "tool",
      toolCallId: event.observation.callId,
      content: JSON.stringify(event.observation.output ?? event.observation.error ?? null)
    }];
  }

  if (event.type === "TurnInterrupted") {
    return [{ role: "system", content: `Turn interrupted: ${event.outcome.kind}` }];
  }

  if (event.type === "TurnFailed") {
    return [{ role: "system", content: `Turn failed: ${event.outcome.reason}` }];
  }

  return [];
}

function contextRecordsForEvent(event: TrajectoryEvent, firstSeq: number): ContextRecord[] {
  const base = {
    schemaVersion: 1 as const,
    runId: event.runId,
    sessionId: event.sessionId,
    turnId: event.turnId,
    at: event.at,
    sourceEventId: event.id,
    sourceEventSeq: event.seq
  };

  if (isRuntimeEventPayload(event.payload)) {
    return contextRecordsForRuntimeEvent(event, event.payload, firstSeq, base);
  }

  if (event.kind === "CompactionCompleted") {
    return [{
      ...base,
      id: `${event.id}:context:${firstSeq}`,
      seq: firstSeq,
      type: "message",
      message: { role: "system", content: stringField(event.payload, "summary") ?? "" }
    }];
  }

  return [];
}

function contextRecordsForRuntimeEvent(
  event: TrajectoryEvent,
  payload: RuntimeEvent,
  firstSeq: number,
  base: ContextBaseForBuild
): ContextRecord[] {
  if (payload.type === "TurnStarted") {
    return [{
      ...base,
      id: `${event.id}:context:${firstSeq}`,
      seq: firstSeq,
      type: "message",
      message: { role: "user", content: payload.input.content }
    }];
  }

  if (payload.type === "ModelStepCompleted") {
    if (payload.result.kind === "final") {
      return [
        {
          ...base,
          id: `${event.id}:context:${firstSeq}`,
          seq: firstSeq,
          type: "message",
          message: { role: "assistant", content: payload.result.message }
        },
        {
          ...base,
          id: `${event.id}:context:${firstSeq + 1}`,
          seq: firstSeq + 1,
          type: "step_result",
          stepId: payload.stepId,
          result: payload.result
        }
      ];
    }

    if (payload.result.kind === "tool_call") {
      return [
        {
          ...base,
          id: `${event.id}:context:${firstSeq}`,
          seq: firstSeq,
          type: "tool_call",
          stepId: payload.stepId,
          call: payload.result.call
        },
        {
          ...base,
          id: `${event.id}:context:${firstSeq + 1}`,
          seq: firstSeq + 1,
          type: "step_result",
          stepId: payload.stepId,
          result: payload.result
        }
      ];
    }

    return [{
      ...base,
      id: `${event.id}:context:${firstSeq}`,
      seq: firstSeq,
      type: "step_result",
      stepId: payload.stepId,
      result: payload.result
    }];
  }

  if (payload.type === "ToolCompleted") {
    return [{
      ...base,
      id: `${event.id}:context:${firstSeq}`,
      seq: firstSeq,
      type: "tool_result",
      stepId: payload.stepId,
      observation: payload.observation
    }];
  }

  return [];
}

function lastSeq(replay: ReplayResult): number {
  return replay.events.at(-1)?.seq ?? 0;
}

function lastTimestamp(replay: ReplayResult): string {
  return replay.events.at(-1)?.at ?? new Date(0).toISOString();
}

function stringField(payload: TrajectoryEvent["payload"], field: string): string | undefined {
  const value = payload[field];
  return typeof value === "string" ? value : undefined;
}
