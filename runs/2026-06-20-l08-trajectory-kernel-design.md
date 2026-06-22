---
type: Run Log
title: L08 Trajectory Kernel Design
description: Handoff note for the L08 trajectory kernel design contract.
tags: [run/l08, design, trajectory, projection]
status: complete
change_policy: append-only
derived_from:
  - docs/design/L08-trajectory-kernel-contract.md
---

# 2026-06-20 L08 trajectory kernel design

## Goal

Write a design document that reframes L08 trajectory as a research-grade evidence kernel instead of a minimum product or storage-first implementation.

## Changed Files

- `docs/design/L08-trajectory-kernel-contract.md`
- `docs/design/README.md`

## Verification

- Confirmed frontmatter, required heading, and `derived_from` references in `docs/design/L08-trajectory-kernel-contract.md`.
- Confirmed `docs/design/README.md` links to the new L08 design document.

## Next Step

Turn the design acceptance criteria into deterministic fixtures for replay, fork, compaction, resume, and SQLite projection rebuild.
