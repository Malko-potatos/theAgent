---
type: Run Log
title: L08 Boundary Accepted
description: Handoff note for accepting ADR 0001 after replay/projection fixture evidence.
tags: [run/l08, adr, accepted, trajectory]
status: complete
change_policy: append-only
derived_from:
  - docs/adr/0001-l08-trajectory-kernel-projection-boundary.md
  - runs/2026-06-20-l08-resume-fixture.md
---

# 2026-06-20 L08 boundary accepted

## Goal

Update ADR 0001 from `proposed` to `accepted` after adding the resume-from-interrupted-turn fixture and replay/projection tests.

## Changed Files

- `docs/adr/0001-l08-trajectory-kernel-projection-boundary.md`

## Verification

- Confirmed ADR frontmatter now says `status: accepted`.
- Confirmed acceptance evidence references existing fixture, test, and run-note files.

## Next Step

Implement the first accepted `TrajectoryKernel` module around the existing replay reader and verifier, while keeping `ProjectionBuilder` implementations separate.
