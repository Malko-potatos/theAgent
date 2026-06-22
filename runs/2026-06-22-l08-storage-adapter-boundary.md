---
type: Run Log
title: L08 Storage Adapter Boundary
description: Handoff note for persisted TrajectoryKernel writes through a storage adapter.
tags: [run/l08, trajectory-kernel, storage-adapter, verification]
status: complete
change_policy: append-only
derived_from:
  - docs/adr/0001-l08-trajectory-kernel-projection-boundary.md
  - runs/2026-06-22-l08-trajectory-kernel.md
---

# 2026-06-22 L08 storage adapter boundary

## Goal

Add the next L08 architecture step after the first accepted `TrajectoryKernel`: a storage adapter boundary for persisted kernel writes, without moving transcript or context projection logic into the kernel.

## Changed Files

- `src/contracts/trajectory.ts`
- `src/contracts/index.ts`
- `src/trajectory/kernel.ts`
- `src/trajectory/index.ts`
- `src/harness/jsonl-trajectory-store.ts`
- `tests/trajectory-kernel.test.ts`

## Implemented Boundary

- Added `TrajectoryStorageAdapter` as the persistence boundary for canonical `TrajectoryEvent` records.
- `InMemoryTrajectoryKernel` can now initialize from storage and append validated canonical events back through storage.
- `JsonlTrajectoryStore` now implements `TrajectoryStorageAdapter` in addition to the existing runtime event sink fixture.
- Runtime-event persistence through `JsonlTrajectoryStore.append` now routes through `createTrajectoryKernelFromStorage`, so canonical ids, seq, previous event links, and previous hashes remain kernel-owned.
- Projection remains outside the kernel. The JSONL store still derives context records as the current harness fixture behavior.

## Verification

- `npm test` passed: 24 tests.
- `npm run smoke` passed.
- Smoke evidence:
  - `runs/run_cli_2026-06-22T01-29-17-936Z/event-log.jsonl`
  - `runs/run_cli_2026-06-22T01-29-17-936Z/context-log.jsonl`

TypeScript static checking was not run because no local `tsc` executable or package lock / installed dependency set was present.

## Next Step

The next small architecture cleanup is to decide whether runtime-event-to-trajectory-event mapping belongs in a reusable L08 mapper instead of inside `JsonlTrajectoryStore`. After that, the next layer work can move to L06 permission policy or L01 intent intake.
