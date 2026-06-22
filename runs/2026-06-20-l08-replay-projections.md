---
type: Run Log
title: L08 Replay Projections
description: Handoff note for replaying trajectory fixtures into transcript and context projections.
tags: [run/l08, replay, projection, trajectory]
status: complete
change_policy: append-only
derived_from:
  - docs/adr/0001-l08-trajectory-kernel-projection-boundary.md
  - docs/design/L08-trajectory-kernel-contract.md
  - tests/fixtures/trajectory/normal-final.jsonl
  - tests/fixtures/trajectory/tool-call-result.jsonl
  - tests/fixtures/trajectory/permission-pause.jsonl
  - tests/fixtures/trajectory/fork-created.jsonl
  - tests/fixtures/trajectory/compaction-completed.jsonl
---

# 2026-06-20 L08 replay projections

## Goal

Read trajectory fixture JSONL files with a replay reader and rebuild transcript/context projections from replayed evidence.

## Changed Files

- `src/trajectory/replay-reader.ts`
- `src/trajectory/projections.ts`
- `src/trajectory/index.ts`
- `src/trajectory/README.md`
- `src/index.ts`
- `src/README.md`
- `tests/trajectory-replay.test.ts`

## Implemented

- `readTrajectoryJsonl` and `parseTrajectoryJsonl` for fixture input.
- `replayTrajectory` for event-chain validation, optional replay cursor slicing, and replay cursor output.
- `buildTranscriptProjection` for human-readable message projection.
- `buildContextProjection` for model-context-oriented records.
- Projection builder objects for the existing `ProjectionBuilder` interface.

## Verification

- `npm test` passed: 18 tests.
- `npm run smoke` passed and produced `runs/run_cli_2026-06-20T07-47-43-759Z/event-log.jsonl`.

## Next Step

Decide whether to promote the replay reader and projection builders into the first accepted `TrajectoryKernel` / `ProjectionBuilder` implementation, or add one more fixture for resume-from-interrupted-turn before accepting the split.
