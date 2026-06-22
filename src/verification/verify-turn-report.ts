import { createHash } from "node:crypto";
import type { RuntimeEvent } from "../contracts/event.ts";
import type { TrajectoryEvent } from "../contracts/trajectory.ts";
import type { TurnReport } from "../contracts/turn.ts";
import type { VerificationCheck, VerificationEvidence } from "../contracts/verification.ts";

export function verifyTurnReport(report: TurnReport): VerificationEvidence {
  const checks: VerificationCheck[] = [
    check("has_turn_started", hasEvent(report.events, "TurnStarted"), "Turn report must begin from an explicit turn event."),
    check("has_one_terminal_event", hasOneTerminalEvent(report.events), "Each turn report must carry exactly one terminal event."),
    check(
      "tool_calls_are_resolved",
      toolCallsAreResolved(report.events),
      "Every tool call must complete or pause for permission."
    ),
    check(
      "outcome_has_required_detail",
      outcomeHasRequiredDetail(report),
      "Final, failed, overflow, and approval outcomes must carry their evidence detail."
    )
  ];

  return {
    ok: checks.every((item) => item.ok),
    checks
  };
}

export function verifyTrajectoryEvents(events: TrajectoryEvent[]): VerificationEvidence {
  const runtimeEvents = events
    .map((event) => event.payload)
    .filter(isRuntimeEventPayload);
  const checks: VerificationCheck[] = [
    check(
      "event_ids_are_unique",
      eventIdsAreUnique(events),
      "Trajectory event ids must be stable and unique within the ledger."
    ),
    check(
      "event_sequence_is_contiguous",
      eventSequenceIsContiguous(events),
      "Trajectory event seq values must start at 1 and have no gaps or duplicates."
    ),
    check(
      "previous_event_chain_is_valid",
      previousEventChainIsValid(events),
      "Each trajectory event after the first must point to the previous event id and seq."
    ),
    check(
      "previous_hash_chain_is_valid_when_present",
      previousHashChainIsValidWhenPresent(events),
      "When previousHash is present it must match the prior trajectory event."
    ),
    check(
      "envelope_matches_payload",
      envelopeMatchesPayload(events),
      "Trajectory envelope type, turnId, and timestamp must match the runtime event payload."
    ),
    check(
      "each_started_turn_has_one_terminal_event",
      eachStartedTurnHasOneTerminalEvent(runtimeEvents),
      "Every started turn must have exactly one terminal event."
    ),
    check(
      "tool_calls_are_resolved",
      toolCallsAreResolved(runtimeEvents),
      "Every tool call must complete or pause for permission, and every result must match a request."
    )
  ];

  return {
    ok: checks.every((item) => item.ok),
    checks
  };
}

function check(name: string, ok: boolean, detail: string): VerificationCheck {
  return { name, ok, detail };
}

function hasEvent(events: RuntimeEvent[], type: RuntimeEvent["type"]): boolean {
  return events.some((event) => event.type === type);
}

function hasOneTerminalEvent(events: RuntimeEvent[]): boolean {
  return events.filter(isTerminalEvent).length === 1;
}

function isTerminalEvent(event: RuntimeEvent): boolean {
  return event.type === "TurnCompleted" || event.type === "TurnInterrupted" || event.type === "TurnFailed";
}

function toolCallsAreResolved(events: RuntimeEvent[]): boolean {
  const requested = new Set(
    events
      .filter((event) => event.type === "ToolCallRequested")
      .map((event) => event.call.id)
  );

  const completed = new Set(
    events
      .filter((event) => event.type === "ToolCompleted")
      .map((event) => event.observation.callId)
  );
  const paused = new Set(
    events
      .filter((event) => event.type === "PermissionRequested")
      .map((event) => event.request.call.id)
  );

  return (
    [...requested].every((callId) => completed.has(callId) || paused.has(callId)) &&
    [...completed].every((callId) => requested.has(callId)) &&
    [...paused].every((callId) => requested.has(callId))
  );
}

function outcomeHasRequiredDetail(report: TurnReport): boolean {
  if (report.outcome.kind === "final") {
    return report.outcome.message.length > 0;
  }

  if (report.outcome.kind === "waiting_for_approval") {
    return report.outcome.request.reason.length > 0;
  }

  if (report.outcome.kind === "overflow") {
    return report.outcome.reason.length > 0;
  }

  return report.outcome.reason.length > 0;
}

function eventIdsAreUnique(events: TrajectoryEvent[]): boolean {
  const ids = events.map((event) => event.id);
  return ids.length > 0 && ids.every((id) => typeof id === "string" && id.length > 0) && new Set(ids).size === ids.length;
}

function eventSequenceIsContiguous(events: TrajectoryEvent[]): boolean {
  return events.every((event, index) => event.seq === index + 1);
}

function previousEventChainIsValid(events: TrajectoryEvent[]): boolean {
  return events.every((event, index) => {
    if (index === 0) {
      return event.previousEventId === undefined && event.previousSeq === undefined;
    }

    const previous = events[index - 1];
    return event.previousEventId === previous?.id && event.previousSeq === previous?.seq;
  });
}

function previousHashChainIsValidWhenPresent(events: TrajectoryEvent[]): boolean {
  return events.every((event, index) => {
    if (index === 0 || event.previousHash === undefined) {
      return true;
    }

    const previous = events[index - 1];
    return event.previousHash === hashEvent(previous);
  });
}

function envelopeMatchesPayload(events: TrajectoryEvent[]): boolean {
  return events.every((event) => {
    if (!isRuntimeEventPayload(event.payload)) {
      return event.type === event.kind;
    }

    return (
      event.type === event.payload.type &&
      event.kind === event.payload.type &&
      event.turnId === event.payload.turnId &&
      event.at === event.payload.at
    );
  });
}

function eachStartedTurnHasOneTerminalEvent(events: RuntimeEvent[]): boolean {
  const turnIds = new Set(
    events
      .filter((event) => event.type === "TurnStarted")
      .map((event) => event.turnId)
  );

  if (turnIds.size === 0) {
    return false;
  }

  return [...turnIds].every((turnId) =>
    events.filter((event) => event.turnId === turnId && isTerminalEvent(event)).length === 1
  );
}

function hashEvent(event: TrajectoryEvent): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(event)).digest("hex")}`;
}

function isRuntimeEventPayload(payload: TrajectoryEvent["payload"]): payload is RuntimeEvent {
  if (!("type" in payload) || typeof payload.type !== "string") {
    return false;
  }

  return runtimeEventTypes.has(payload.type as RuntimeEvent["type"]);
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
