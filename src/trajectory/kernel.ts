import type {
  ReplayCursor,
  ReplayResult,
  TrajectoryAppendInput,
  TrajectoryEvent,
  TrajectoryInvariantName,
  TrajectoryInvariantResult,
  TrajectoryKernel,
  TrajectoryStorageAdapter
} from "../contracts/trajectory.ts";
import { verifyTrajectoryEvents } from "../verification/index.ts";
import { hashTrajectoryEvent, readTrajectoryJsonl, replayTrajectory, TrajectoryReplayError } from "./replay-reader.ts";

export type InMemoryTrajectoryKernelOptions = {
  runId: string;
  sessionId?: string;
  events?: TrajectoryEvent[];
  storage?: TrajectoryStorageAdapter;
};

export class InMemoryTrajectoryKernel implements TrajectoryKernel {
  readonly runId: string;
  readonly sessionId: string;
  private events: TrajectoryEvent[];
  private storage?: TrajectoryStorageAdapter;

  constructor(options: InMemoryTrajectoryKernelOptions) {
    if (options.events !== undefined && options.storage !== undefined) {
      throw new TrajectoryReplayError("Use either initial events or a trajectory storage adapter, not both.");
    }

    const initialEvents = options.events ?? options.storage?.readEvents() ?? [];
    const firstEvent = initialEvents.at(0);

    this.runId = options.runId;
    this.sessionId = options.sessionId ?? firstEvent?.sessionId ?? options.runId;
    this.events = [...initialEvents];
    this.storage = options.storage;

    if (this.events.length > 0) {
      const replay = replayTrajectory(this.events);
      if (replay.runId !== this.runId || replay.sessionId !== this.sessionId) {
        throw new TrajectoryReplayError("Initial events do not match kernel run/session identity.");
      }
    }
  }

  append(input: TrajectoryAppendInput): TrajectoryEvent {
    if (input.runId !== this.runId || input.sessionId !== this.sessionId) {
      throw new TrajectoryReplayError(`Cannot append event for ${input.runId}/${input.sessionId} to ${this.runId}/${this.sessionId}.`);
    }

    const previous = this.events.at(-1);
    const seq = previous ? previous.seq + 1 : 1;
    const {
      id,
      seq: _inputSeq,
      previousEventId: _inputPreviousEventId,
      previousSeq: _inputPreviousSeq,
      previousHash: _inputPreviousHash,
      ...eventInput
    } = input;
    const event: TrajectoryEvent = {
      ...eventInput,
      id: id ?? `${this.runId}:event:${seq}`,
      seq,
      ...(previous ? { previousEventId: previous.id, previousSeq: previous.seq, previousHash: hashTrajectoryEvent(previous) } : {})
    };

    const nextEvents = [...this.events, event];
    replayTrajectory(nextEvents);
    this.storage?.appendEvent(event);
    this.events = nextEvents;
    return event;
  }

  replay(cursor?: ReplayCursor): ReplayResult {
    return replayTrajectory(this.events, cursor);
  }

  validate(events: TrajectoryEvent[] = this.events): TrajectoryInvariantResult[] {
    return verifyTrajectoryEvents(events).checks.map((check) => ({
      name: check.name as TrajectoryInvariantName,
      ok: check.ok,
      detail: check.detail
    }));
  }
}

export function createTrajectoryKernel(options: InMemoryTrajectoryKernelOptions): InMemoryTrajectoryKernel {
  return new InMemoryTrajectoryKernel(options);
}

export function createTrajectoryKernelFromStorage(options: {
  runId: string;
  sessionId?: string;
  storage: TrajectoryStorageAdapter;
}): InMemoryTrajectoryKernel {
  return new InMemoryTrajectoryKernel(options);
}

export function createTrajectoryKernelFromEvents(events: TrajectoryEvent[]): InMemoryTrajectoryKernel {
  const first = events.at(0);
  if (!first) {
    throw new TrajectoryReplayError("Cannot create a trajectory kernel from empty events.");
  }

  return new InMemoryTrajectoryKernel({
    runId: first.runId,
    sessionId: first.sessionId,
    events
  });
}

export function readTrajectoryKernelJsonl(path: string): InMemoryTrajectoryKernel {
  return createTrajectoryKernelFromEvents(readTrajectoryJsonl(path));
}
