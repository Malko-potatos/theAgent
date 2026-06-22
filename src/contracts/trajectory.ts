import type { RuntimeEvent, RuntimeEventSink } from "./event.ts";
import type { StepResult } from "./step.ts";
import type { ToolCallRequest, ToolObservation } from "./tool.ts";
import type { AgentMessage } from "./turn.ts";

export type TrajectoryActor = "human" | "runtime" | "model" | "tool" | "harness" | "verifier";

export type TrajectoryVisibility = "public" | "internal" | "sensitive" | "redacted";

export type TrajectoryRef =
  | { kind: "event"; eventId: string }
  | { kind: "event_range"; fromEventId: string; toEventId: string }
  | { kind: "projection"; projectionId: string }
  | { kind: "file"; path: string; line?: number }
  | { kind: "blob"; blobId: string };

export type RedactionPolicy = {
  reason: string;
  fields?: string[];
  replacement?: "omit" | "mask" | "hash";
};

export type TrajectoryEventKind =
  | RuntimeEvent["type"]
  | "HumanInputReceived"
  | "HarnessContextProvided"
  | "ExternalSourceAttached"
  | "ContextViewRequested"
  | "ContextViewBuilt"
  | "ContextBudgetExceeded"
  | "CheckpointCreated"
  | "CompactionRequested"
  | "CompactionCompleted"
  | "ModelRequestBuilt"
  | "ModelStreamStarted"
  | "ModelStreamDelta"
  | "ModelResponseCompleted"
  | "ModelError"
  | "ToolCallValidated"
  | "PermissionResolved"
  | "ToolExecutionStarted"
  | "ToolFailed"
  | "ResumeRequested"
  | "ReplayStarted"
  | "ReplayCompleted"
  | "ForkCreated"
  | "RollbackRecorded"
  | "VerificationStarted"
  | "InvariantChecked"
  | "VerificationCompleted";

export type TrajectoryEvent = {
  schemaVersion: 1;
  id: string;
  runId: string;
  sessionId: string;
  turnId?: string;
  stepId?: string;
  seq: number;
  parentEventId?: string;
  previousEventId?: string;
  previousSeq?: number;
  previousHash?: string;
  at: string;
  actor: TrajectoryActor;
  kind: TrajectoryEventKind;
  visibility: TrajectoryVisibility;
  refs?: TrajectoryRef[];
  redaction?: RedactionPolicy;
  /**
   * First-slice compatibility field. New code should prefer `kind`.
   */
  type: TrajectoryEventKind;
  payload: RuntimeEvent | Record<string, unknown>;
};

export type ContextRecord =
  | ContextMessageRecord
  | ContextToolCallRecord
  | ContextToolResultRecord
  | ContextStepResultRecord;

export type ContextRecordBase = {
  schemaVersion: 1;
  id?: string;
  runId: string;
  sessionId?: string;
  turnId?: string;
  seq: number;
  at: string;
  sourceEventId?: string;
  sourceEventSeq: number;
};

export type ContextMessageRecord = ContextRecordBase & {
  type: "message";
  message: AgentMessage;
};

export type ContextToolCallRecord = ContextRecordBase & {
  type: "tool_call";
  stepId: string;
  call: ToolCallRequest;
};

export type ContextToolResultRecord = ContextRecordBase & {
  type: "tool_result";
  stepId: string;
  observation: ToolObservation;
};

export type ContextStepResultRecord = ContextRecordBase & {
  type: "step_result";
  stepId: string;
  result: StepResult;
};

export type TrajectoryStore = RuntimeEventSink & {
  readonly runId: string;
  trajectoryEvents(): TrajectoryEvent[];
  contextRecords(): ContextRecord[];
  runtimeEvents(): RuntimeEvent[];
};

export type TrajectoryStorageAdapter = {
  readonly runId: string;
  readEvents(): TrajectoryEvent[];
  appendEvent(event: TrajectoryEvent): void;
};

export type ReplayCursor = {
  runId: string;
  sessionId: string;
  eventId: string;
  seq: number;
  eventHash?: string;
};

export type ReplayResult = {
  runId: string;
  sessionId: string;
  events: TrajectoryEvent[];
  cursor?: ReplayCursor;
};

export type ProjectionKind = "context" | "transcript" | "verification" | "search_index" | "export";

export type ProjectionRecordBase = {
  schemaVersion: 1;
  projectionId: string;
  projectionKind: ProjectionKind;
  runId: string;
  sessionId: string;
  sourceEventIds: string[];
  builtAt: string;
};

export type TranscriptProjectionRecord = ProjectionRecordBase & {
  projectionKind: "transcript";
  messages: AgentMessage[];
};

export type ContextProjectionRecord = ProjectionRecordBase & {
  projectionKind: "context";
  records: ContextRecord[];
};

export type VerificationProjectionRecord = ProjectionRecordBase & {
  projectionKind: "verification";
  checks: TrajectoryInvariantResult[];
};

export type SearchIndexProjectionRecord = ProjectionRecordBase & {
  projectionKind: "search_index";
  entries: {
    sourceEventId: string;
    text: string;
    tags?: string[];
  }[];
};

export type ExportProjectionRecord = ProjectionRecordBase & {
  projectionKind: "export";
  redactedEvents: TrajectoryEvent[];
};

export type ProjectionRecord =
  | TranscriptProjectionRecord
  | ContextProjectionRecord
  | VerificationProjectionRecord
  | SearchIndexProjectionRecord
  | ExportProjectionRecord;

export type TrajectoryInvariantName =
  | "event_ids_are_unique"
  | "event_sequence_is_contiguous"
  | "previous_event_chain_is_valid"
  | "previous_hash_chain_is_valid_when_present"
  | "envelope_matches_payload"
  | "each_started_turn_has_one_terminal_event"
  | "tool_calls_are_resolved";

export type TrajectoryInvariantResult = {
  name: TrajectoryInvariantName;
  ok: boolean;
  detail: string;
  sourceEventIds?: string[];
};

export type TrajectoryAppendInput = Omit<TrajectoryEvent, "id" | "seq" | "previousEventId" | "previousSeq"> & {
  id?: string;
  seq?: number;
  previousEventId?: string;
  previousSeq?: number;
};

export type TrajectoryKernel = {
  append(input: TrajectoryAppendInput): TrajectoryEvent;
  replay(cursor?: ReplayCursor): ReplayResult;
  validate(events: TrajectoryEvent[]): TrajectoryInvariantResult[];
};

export type ProjectionBuilder<TProjection extends ProjectionRecord = ProjectionRecord> = {
  readonly projectionKind: TProjection["projectionKind"];
  build(replay: ReplayResult): TProjection;
};
