import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { RuntimeEvent } from "../contracts/event.ts";
import type { ReplayCursor, ReplayResult, TrajectoryEvent } from "../contracts/trajectory.ts";

export class TrajectoryReplayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrajectoryReplayError";
  }
}

export function readTrajectoryJsonl(path: string): TrajectoryEvent[] {
  return parseTrajectoryJsonl(readFileSync(path, "utf8"));
}

export function parseTrajectoryJsonl(content: string): TrajectoryEvent[] {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return [];
  }

  return trimmed.split(/\r?\n/u).map((line) => JSON.parse(line) as TrajectoryEvent);
}

export function replayTrajectory(events: TrajectoryEvent[], cursor?: ReplayCursor): ReplayResult {
  assertReplayable(events);

  const selectedEvents = cursor ? events.slice(0, findCursorIndex(events, cursor) + 1) : events;
  const lastEvent = selectedEvents.at(-1);
  if (!lastEvent) {
    throw new TrajectoryReplayError("Cannot replay an empty trajectory.");
  }

  return {
    runId: lastEvent.runId,
    sessionId: lastEvent.sessionId,
    events: selectedEvents,
    cursor: {
      runId: lastEvent.runId,
      sessionId: lastEvent.sessionId,
      eventId: lastEvent.id,
      seq: lastEvent.seq,
      eventHash: hashTrajectoryEvent(lastEvent)
    }
  };
}

export function isRuntimeEventPayload(payload: TrajectoryEvent["payload"]): payload is RuntimeEvent {
  if (!("type" in payload) || typeof payload.type !== "string") {
    return false;
  }

  return runtimeEventTypes.has(payload.type as RuntimeEvent["type"]);
}

export function hashTrajectoryEvent(event: TrajectoryEvent): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(event)).digest("hex")}`;
}

function assertReplayable(events: TrajectoryEvent[]): void {
  if (events.length === 0) {
    throw new TrajectoryReplayError("Cannot replay an empty trajectory.");
  }

  const [firstEvent] = events;
  const ids = new Set<string>();

  events.forEach((event, index) => {
    if (ids.has(event.id)) {
      throw new TrajectoryReplayError(`Duplicate trajectory event id: ${event.id}`);
    }
    ids.add(event.id);

    if (event.runId !== firstEvent.runId) {
      throw new TrajectoryReplayError(`Event ${event.id} belongs to run ${event.runId}, expected ${firstEvent.runId}.`);
    }

    if (event.sessionId !== firstEvent.sessionId) {
      throw new TrajectoryReplayError(
        `Event ${event.id} belongs to session ${event.sessionId}, expected ${firstEvent.sessionId}.`
      );
    }

    if (event.seq !== index + 1) {
      throw new TrajectoryReplayError(`Event ${event.id} has seq ${event.seq}, expected ${index + 1}.`);
    }

    if (index === 0) {
      if (event.previousEventId !== undefined || event.previousSeq !== undefined) {
        throw new TrajectoryReplayError(`First event ${event.id} must not point to a previous event.`);
      }
      return;
    }

    const previous = events[index - 1];
    if (event.previousEventId !== previous?.id || event.previousSeq !== previous?.seq) {
      throw new TrajectoryReplayError(`Event ${event.id} does not point to the previous event.`);
    }

    if (event.previousHash !== undefined && event.previousHash !== hashTrajectoryEvent(previous)) {
      throw new TrajectoryReplayError(`Event ${event.id} has an invalid previousHash.`);
    }
  });
}

function findCursorIndex(events: TrajectoryEvent[], cursor: ReplayCursor): number {
  const index = events.findIndex((event) =>
    event.runId === cursor.runId &&
    event.sessionId === cursor.sessionId &&
    event.id === cursor.eventId &&
    event.seq === cursor.seq
  );

  if (index === -1) {
    throw new TrajectoryReplayError(`Replay cursor not found: ${cursor.eventId}`);
  }

  if (cursor.eventHash !== undefined && cursor.eventHash !== hashTrajectoryEvent(events[index])) {
    throw new TrajectoryReplayError(`Replay cursor hash mismatch: ${cursor.eventId}`);
  }

  return index;
}

const runtimeEventTypes = new Set<RuntimeEvent["type"]>([
  "TurnStarted",
  "StepStarted",
  "ModelStepCompleted",
  "ToolCallRequested",
  "PermissionRequested",
  "ToolCompleted",
  "ContextOverflow",
  "RetryRequested",
  "TurnCompleted",
  "TurnInterrupted",
  "TurnFailed"
]);
