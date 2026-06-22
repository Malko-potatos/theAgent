---
type: Run Log
title: L08 Trajectory Kernel Implementation
description: Handoff note for the first accepted TrajectoryKernel implementation.
tags: [run/l08, trajectory-kernel, replay, verification]
status: complete
change_policy: append-only
derived_from:
  - docs/adr/0001-l08-trajectory-kernel-projection-boundary.md
  - src/trajectory/kernel.ts
---

# 2026-06-22 L08 trajectory kernel implementation

## Goal

Implement the first `TrajectoryKernel` after ADR 0001 accepted the `TrajectoryKernel` / `ProjectionBuilder` boundary.

## Changed Files

- `src/trajectory/kernel.ts`
- `src/trajectory/index.ts`
- `src/trajectory/README.md`
- `tests/trajectory-kernel.test.ts`

## Implemented Boundary

`InMemoryTrajectoryKernel` now owns:

- canonical append sequencing
- event id assignment when omitted
- previous event id and seq assignment
- previous hash assignment
- replay via `replayTrajectory`
- validation via `verifyTrajectoryEvents`
- JSONL fixture loading via `readTrajectoryKernelJsonl`

Projection remains outside the kernel:

- `buildTranscriptProjection`
- `buildContextProjection`
- `transcriptProjectionBuilder`
- `contextProjectionBuilder`

## Verification

- `npm test` passed: 23 tests.
- `npm run smoke` passed and produced `runs/run_cli_2026-06-22T00-47-13-467Z/event-log.jsonl`.

## Next Step

The next architecture step is to add a storage adapter boundary for persisted kernel writes, without moving transcript/context projection logic into the kernel.
