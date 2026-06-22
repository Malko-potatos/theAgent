---
type: Run Log
title: L08 Boundary ADR
description: Handoff note for ADR 0001 on the TrajectoryKernel and ProjectionBuilder boundary.
tags: [run/l08, adr, trajectory, projection]
status: complete
change_policy: append-only
derived_from:
  - docs/adr/0001-l08-trajectory-kernel-projection-boundary.md
---

# 2026-06-20 L08 boundary ADR

## Goal

Record the decision about when to split `TrajectoryKernel` and `ProjectionBuilder` using this repo's ADR convention.

## Existing ADR Convention Checked

- `AGENTS.md` is canonical and requires `docs/adr/NNNN-<slug>.md`.
- `docs/adr/README.md` previously suggested `YYYY-MM-DD-<decision-slug>.md`, so it was aligned to `NNNN-<decision-slug>.md`.

## Changed Files

- `docs/adr/0001-l08-trajectory-kernel-projection-boundary.md`
- `docs/adr/README.md`

## Verification

- Confirmed ADR frontmatter and heading.
- Confirmed referenced design/research/run-note files exist.

## Next Step

Create the deterministic replay/projection fixtures listed in ADR 0001 before accepting the module split.
