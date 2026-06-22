import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { RuntimeEvent } from "../contracts/event.ts";
import type {
  ContextRecord,
  TrajectoryAppendInput,
  TrajectoryEvent,
  TrajectoryStorageAdapter,
  TrajectoryStore
} from "../contracts/trajectory.ts";
import { createTrajectoryKernelFromStorage, replayTrajectory, TrajectoryReplayError } from "../trajectory/index.ts";

export type JsonlTrajectoryStoreOptions = {
  runId: string;
  rootDir?: string;
  runDirectory?: string;
};

export class JsonlTrajectoryStore implements TrajectoryStore, TrajectoryStorageAdapter {
  readonly runId: string;
  readonly runDirectory: string;
  readonly eventLogPath: string;
  readonly contextLogPath: string;

  private events: TrajectoryEvent[];
  private contexts: ContextRecord[];
  private nextEventSeq: number;
  private nextContextSeq: number;

  constructor(options: JsonlTrajectoryStoreOptions) {
    this.runId = options.runId;
    this.runDirectory = options.runDirectory ?? join(options.rootDir ?? "runs", options.runId);
    this.eventLogPath = join(this.runDirectory, "event-log.jsonl");
    this.contextLogPath = join(this.runDirectory, "context-log.jsonl");

    mkdirSync(this.runDirectory, { recursive: true });

    this.events = readJsonl<TrajectoryEvent>(this.eventLogPath);
    this.contexts = readJsonl<ContextRecord>(this.contextLogPath);
    if (this.events.length > 0) {
      const replay = replayTrajectory(this.events);
      if (replay.runId !== this.runId) {
        throw new TrajectoryReplayError(`Stored trajectory belongs to run ${replay.runId}, expected ${this.runId}.`);
      }
    }
    this.nextEventSeq = nextSeq(this.events);
    this.nextContextSeq = nextSeq(this.contexts);
  }

  append(event: RuntimeEvent): void {
    const kernel = createTrajectoryKernelFromStorage({ runId: this.runId, storage: this });
    kernel.append(runtimeEventToTrajectoryAppendInput(event, this.runId));
  }

  readEvents(): TrajectoryEvent[] {
    return this.trajectoryEvents();
  }

  appendEvent(event: TrajectoryEvent): void {
    this.assertAppendable(event);
    this.events.push(event);
    this.nextEventSeq = event.seq + 1;
    appendJsonl(this.eventLogPath, event);

    for (const record of deriveContextRecords(event, this.nextContextSeq)) {
      this.contexts.push(record);
      this.nextContextSeq = record.seq + 1;
      appendJsonl(this.contextLogPath, record);
    }
  }

  all(): RuntimeEvent[] {
    return this.runtimeEvents();
  }

  runtimeEvents(): RuntimeEvent[] {
    return this.events.map((event) => event.payload as RuntimeEvent);
  }

  trajectoryEvents(): TrajectoryEvent[] {
    return [...this.events];
  }

  contextRecords(): ContextRecord[] {
    return [...this.contexts];
  }

  private assertAppendable(event: TrajectoryEvent): void {
    if (event.runId !== this.runId) {
      throw new TrajectoryReplayError(`Cannot append event for run ${event.runId} to ${this.runId}.`);
    }

    if (event.seq !== this.nextEventSeq) {
      throw new TrajectoryReplayError(`Cannot append event ${event.id} with seq ${event.seq}; expected ${this.nextEventSeq}.`);
    }

    const previousEvent = this.events.at(-1);
    if (!previousEvent) {
      if (event.previousEventId !== undefined || event.previousSeq !== undefined || event.previousHash !== undefined) {
        throw new TrajectoryReplayError(`First event ${event.id} must not point to previous evidence.`);
      }
      return;
    }

    if (event.previousEventId !== previousEvent.id || event.previousSeq !== previousEvent.seq) {
      throw new TrajectoryReplayError(`Event ${event.id} does not point to the stored previous event.`);
    }

    if (event.previousHash !== hashEvent(previousEvent)) {
      throw new TrajectoryReplayError(`Event ${event.id} has an invalid previousHash for stored previous event.`);
    }
  }
}

function readJsonl<T>(path: string): T[] {
  if (!existsSync(path)) {
    return [];
  }

  const content = readFileSync(path, "utf8").trim();
  if (content.length === 0) {
    return [];
  }

  return content.split(/\r?\n/u).map((line) => JSON.parse(line) as T);
}

function appendJsonl(path: string, value: unknown): void {
  appendFileSync(path, `${JSON.stringify(value)}\n`, "utf8");
}

function runtimeEventToTrajectoryAppendInput(event: RuntimeEvent, runId: string): TrajectoryAppendInput {
  return {
    schemaVersion: 1,
    runId,
    sessionId: runId,
    turnId: event.turnId,
    stepId: "stepId" in event ? event.stepId : undefined,
    at: event.at,
    actor: actorForRuntimeEvent(event),
    kind: event.type,
    visibility: "internal",
    type: event.type,
    payload: event
  };
}

function nextSeq(records: { seq: number }[]): number {
  if (records.length === 0) {
    return 1;
  }

  return Math.max(...records.map((record) => record.seq)) + 1;
}

function deriveContextRecords(event: TrajectoryEvent, firstSeq: number): ContextRecord[] {
  const payload = event.payload as RuntimeEvent;
  const base = {
    schemaVersion: 1 as const,
    runId: event.runId,
    sessionId: event.sessionId,
    turnId: event.turnId,
    at: event.at,
    sourceEventId: event.id,
    sourceEventSeq: event.seq
  };

  if (payload.type === "TurnStarted") {
    return [
      {
        ...base,
        id: `${event.id}:context:${firstSeq}`,
        seq: firstSeq,
        type: "message",
        message: { role: "user", content: payload.input.content }
      }
    ];
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

    return [
      {
        ...base,
        id: `${event.id}:context:${firstSeq}`,
        seq: firstSeq,
        type: "step_result",
        stepId: payload.stepId,
        result: payload.result
      }
    ];
  }

  if (payload.type === "ToolCompleted") {
    return [
      {
        ...base,
        id: `${event.id}:context:${firstSeq}`,
        seq: firstSeq,
        type: "tool_result",
        stepId: payload.stepId,
        observation: payload.observation
      }
    ];
  }

  return [];
}

function actorForRuntimeEvent(event: RuntimeEvent): TrajectoryEvent["actor"] {
  if (event.type === "TurnStarted") {
    return "human";
  }

  if (event.type === "ModelStepCompleted") {
    return "model";
  }

  if (event.type === "ToolCompleted") {
    return "tool";
  }

  return "runtime";
}

function hashEvent(event: TrajectoryEvent): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(event)).digest("hex")}`;
}
