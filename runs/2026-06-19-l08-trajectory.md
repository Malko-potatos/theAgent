---
type: Run Log
title: L08 Trajectory Research
description: Handoff note for the first L08 trajectory analysis pass.
tags: [run/l08, research/layers, trajectory]
status: complete
change_policy: append-only
derived_from:
  - docs/research/layers/L08-trajectory.md
---

# 2026-06-19 L08 trajectory

## Scope

Started L08 `trajectory` research across four local repository snapshots:

- `work/external-repos/openai__codex`
- `work/external-repos/nousresearch__hermes-agent`
- `work/external-repos/xiaomimimo__mimo-code`
- `work/external-repos/moonshotai__kimi-cli`

## Confirmed Facts

- openai/codex uses rollout/thread concepts and reconstructs effective history from rollout items, compaction records, rollback markers, and tail replay.
- Hermes stores sessions/messages in SQLite with FTS and parent-session lineage; compression can redirect resume to a child session.
- MiMo-Code separates session/message/part tables and has sync events with aggregate sequence checks.
- Kimi CLI separates model context history (`context.jsonl`) from UI/client wire events (`wire.jsonl`).

## Codex Interpretation

For this repo, L08 should come before live model proxy work because model calls need a durable evidence surface. The first implementation should be append-only JSONL rather than SQLite:

- easier to diff and inspect
- works with the current fake runtime
- supports verifier evidence quickly
- can later be indexed or projected into SQLite

## Proposed Next Step

Implement a small L08 vertical slice:

1. `src/contracts/trajectory.ts`
2. append-only `JsonlTrajectoryStore`
3. `runs/<run-id>/event-log.jsonl`
4. verifier checks for event sequence and tool-call/result pairing

## Verification Performed

- Source files were read locally from `work/external-repos`.
- Findings were written to `docs/research/layers/L08-trajectory.md`.
- Layer index was updated to link the new L08 document.

