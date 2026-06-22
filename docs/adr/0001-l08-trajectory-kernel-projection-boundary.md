---
type: ADR
title: L08 Trajectory Kernel And Projection Boundary
status: accepted
date: 2026-06-20
tags: [adr, l08, trajectory, replay, projection, verification]
derived_from:
  - docs/design/L08-trajectory-kernel-contract.md
  - docs/research/layers/L08-trajectory.md
  - runs/2026-06-20-l08-trajectory-kernel-design.md
---

# 0001 L08 trajectory kernel and projection boundary

## Context

L08 research compared trajectory handling across openai/codex, NousResearch/hermes-agent, XiaomiMiMo/MiMo-Code, and MoonshotAI/kimi-cli.

The current design direction is to treat trajectory as a replayable evidence kernel rather than a transcript store or product-first chat history feature. The design separates canonical trajectory evidence from derived context, transcript, verification, search, and export projections.

During design discussion, the unresolved implementation question was whether to immediately introduce two explicit modules:

- `TrajectoryKernel`
- `ProjectionBuilder`

The repo should not split modules just because the names sound clean. It should split them when deterministic fixtures prove that append/replay/validation responsibilities are distinct from projection-building responsibilities.

## Decision

Accept the `TrajectoryKernel` / `ProjectionBuilder` split as the target implementation boundary for L08.

The split is accepted because replay/projection fixtures now validate that canonical ledger replay can remain separate from derived projection building. The accepted boundary is:

```text
TrajectoryKernel
  - canonical event append
  - event identity and chain validation
  - branch/fork metadata
  - replay cursor
  - storage encoding adapter

ProjectionBuilder
  - context projection
  - transcript projection
  - verification projection
  - search/index projection
  - export projection
```

The acceptance gate was:

1. Create deterministic trajectory fixtures for:
   - normal final turn
   - tool call/result pair
   - permission pause or denial
   - fork or compaction
   - resume from interrupted turn
   - transcript and context projection rebuild
2. Implement a replay reader that can validate the canonical ledger and produce enough state for projections.
3. Implement transcript and context projection builders against the replay output.
4. Confirm that replay/append/chain validation code remains separate from projection-building code.
5. Confirm that the event envelope and replay model did not require a material design reversal.

This decision does not accept SQLite as canonical storage. SQLite remains a projection/index candidate unless a later ADR changes that.

## Acceptance Evidence

The following fixtures and tests satisfied the acceptance gate:

- `tests/fixtures/trajectory/normal-final.jsonl`
- `tests/fixtures/trajectory/tool-call-result.jsonl`
- `tests/fixtures/trajectory/permission-pause.jsonl`
- `tests/fixtures/trajectory/fork-created.jsonl`
- `tests/fixtures/trajectory/compaction-completed.jsonl`
- `tests/fixtures/trajectory/resume-from-interrupted-turn.jsonl`
- `tests/trajectory-contract.test.ts`
- `tests/trajectory-replay.test.ts`

Verification evidence:

- `npm test` passed with 20 tests after the resume fixture was added.
- `npm run smoke` passed after the resume fixture was added.
- Run notes:
  - `runs/2026-06-20-l08-code-contract.md`
  - `runs/2026-06-20-l08-replay-projections.md`
  - `runs/2026-06-20-l08-resume-fixture.md`

## Alternatives Considered

### Accept the split immediately

This would move faster and make the code layout look clean earlier.

Rejected for now because the event envelope, replay cursor, branch semantics, and projection requirements are still being validated. Premature module boundaries could hide design mistakes.

### Keep one combined trajectory store

This is simpler for the first prototype and matches the current `JsonlTrajectoryStore` shape.

Rejected as the target direction because it mixes canonical evidence with derived context records. That makes replay, verifier independence, projection rebuild, and future SQLite indexing harder to reason about.

### Make SQLite the central boundary first

This would support query, resume UX, lineage browsing, and FTS early.

Rejected for this decision because storage/query concerns should not define the runtime evidence boundary. SQLite remains a likely projection/index layer unless a later ADR promotes it to canonical storage.

## Consequences

Positive:

- Keeps architecture research ahead of product-shaped implementation.
- Forces replay and projection evidence before finalizing module boundaries.
- Preserves the L08 principle that trajectory is canonical evidence and projections are derived.
- Leaves room to revise the event envelope before code structure hardens.

Negative:

- Adds one more gate before implementation can settle.
- Short-term code may remain less clean while fixtures expose the true boundary.
- The current JSONL prototype must be treated as exploratory evidence, not as final architecture.

## References

- `docs/design/L08-trajectory-kernel-contract.md`
- `docs/research/layers/L08-trajectory.md`
- `runs/2026-06-20-l08-trajectory-kernel-design.md`
- `runs/2026-06-19-l08-trajectory-vertical-slice.md`
