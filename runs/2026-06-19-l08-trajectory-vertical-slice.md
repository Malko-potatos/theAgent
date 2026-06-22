---
type: Run Log
title: L08 Trajectory Vertical Slice
description: Handoff note for the first append-only JSONL trajectory implementation.
tags: [run/l08, implementation, trajectory, jsonl]
status: complete
change_policy: append-only
derived_from:
  - docs/research/layers/L08-trajectory.md
  - runs/2026-06-19-l08-trajectory.md
---

# 2026-06-19 L08 trajectory vertical slice

## Goal

Use the L08 research result to make the first better trajectory structure for the local fake runtime.

## Boundary

- L08 owns append-only trajectory and context evidence.
- Runtime still emits provider-neutral `RuntimeEvent` records through `RuntimeEventSink`.
- Filesystem persistence lives in `src/harness/`, not inside the core loop.
- Verification reads the stored trajectory events separately from the runtime's turn report.

## Changed Files

- `src/contracts/trajectory.ts`
- `src/harness/jsonl-trajectory-store.ts`
- `src/verification/verify-turn-report.ts`
- `tests/p00-loop.test.ts`
- `src/cli/main.ts`
- `src/contracts/index.ts`
- `src/harness/index.ts`
- `src/verification/index.ts`
- `src/contracts/README.md`
- `src/harness/README.md`
- `src/verification/README.md`

## Verification

- `npm test` passed: 8 tests, including JSONL trajectory persistence and negative verifier checks.
- `npm run smoke` passed and wrote:
  - `runs/run_cli_2026-06-19T05-42-11-817Z/event-log.jsonl`
  - `runs/run_cli_2026-06-19T05-42-11-817Z/context-log.jsonl`

## Next Step

Add a replay reader that reconstructs a visible transcript and a model-context view from `event-log.jsonl` and `context-log.jsonl`, then make the verifier compare reconstructed output with the turn report.
