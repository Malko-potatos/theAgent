---
type: Run Log
title: L08 Resume Fixture
description: Handoff note for adding a resume-from-interrupted-turn trajectory fixture.
tags: [run/l08, resume, trajectory, projection]
status: complete
change_policy: append-only
derived_from:
  - docs/adr/0001-l08-trajectory-kernel-projection-boundary.md
  - tests/fixtures/trajectory/resume-from-interrupted-turn.jsonl
---

# 2026-06-20 L08 resume fixture

## Goal

Add a deterministic fixture that proves replay/projection behavior across an interrupted approval turn and a resumed continuation turn.

## Modeling Choice

The fixture models resume as:

```text
turn_resume_waiting
  -> ToolCallRequested
  -> PermissionRequested
  -> TurnInterrupted(waiting_for_approval)

ResumeRequested
PermissionResolved

turn_resume_continue
  -> ToolExecutionStarted
  -> ToolCompleted
  -> ModelStepCompleted(final)
  -> TurnCompleted
```

This preserves the current invariant that each started turn has exactly one terminal event.

## Changed Files

- `tests/fixtures/trajectory/resume-from-interrupted-turn.jsonl`
- `tests/trajectory-contract.test.ts`
- `tests/trajectory-replay.test.ts`
- `src/trajectory/projections.ts`

## Verification

- `npm test` passed: 20 tests.
- `npm run smoke` passed and produced `runs/run_cli_2026-06-20T08-24-55-608Z/event-log.jsonl`.

## Next Step

This fixture completes the pre-acceptance evidence originally requested before promoting the `TrajectoryKernel` / `ProjectionBuilder` split. The next step is to update ADR 0001 from `proposed` to `accepted`, or document any remaining blocker before accepting it.
