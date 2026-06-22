---
type: Run Log
title: L08 Code Contract
description: Handoff note for fixing the L08 trajectory contract in TypeScript types and fixtures.
tags: [run/l08, code-contract, trajectory, fixtures]
status: complete
change_policy: append-only
derived_from:
  - docs/adr/0001-l08-trajectory-kernel-projection-boundary.md
  - docs/design/L08-trajectory-kernel-contract.md
---

# 2026-06-20 L08 code contract

## Goal

Fix the L08 trajectory contract in code without expanding into full `TrajectoryKernel` or `ProjectionBuilder` implementations.

## Changed Files

- `src/contracts/trajectory.ts`
- `src/contracts/index.ts`
- `src/contracts/README.md`
- `src/harness/jsonl-trajectory-store.ts`
- `src/verification/verify-turn-report.ts`
- `tests/trajectory-contract.test.ts`
- `tests/fixtures/trajectory/normal-final.jsonl`
- `tests/fixtures/trajectory/tool-call-result.jsonl`
- `tests/fixtures/trajectory/permission-pause.jsonl`
- `tests/fixtures/trajectory/fork-created.jsonl`
- `tests/fixtures/trajectory/compaction-completed.jsonl`
- `package.json`

## Contract Fixed

- Expanded `TrajectoryEvent` envelope with event identity, session id, actor, kind, visibility, refs, optional redaction, previous event id, and optional previous hash.
- Added interface-level `TrajectoryKernel` and `ProjectionBuilder` boundaries without implementing the full modules.
- Added replay/projection support types such as `ReplayCursor`, `ReplayResult`, and projection record unions.
- Added deterministic fixture ledgers for normal final, tool pair, permission pause, fork, and compaction examples.
- Extended trajectory verification checks for event ids, seq, previous event chain, hash when present, envelope/payload match, terminal turn state, and tool pairing.

## Verification

- `npm test` passed: 12 tests.
- `npm run smoke` passed and produced `runs/run_cli_2026-06-20T07-41-58-717Z/event-log.jsonl` with the expanded envelope.

## Next Step

Implement a replay reader that reads these fixtures and produces explicit transcript/context projection outputs. Do not implement storage indexing or SQLite before the replay/projection boundary is proven.
