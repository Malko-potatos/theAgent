---
type: Harness Guide
title: Artifact Management
description: Rules for managing source inputs, work files, design docs, code, evidence, final outputs, and release manifests.
tags: [harness/artifacts, outputs, evidence, project-structure]
status: draft
change_policy: curated
---

# Artifact Management

## Purpose

This repo separates project artifacts by role so Codex can keep source, work, code, evidence, and final human-facing outputs from drifting into one mixed folder.

The management rule is:

```text
inputs / 01_sources -> work -> docs or src -> runs -> outputs
```

## Artifact Classes

| Class | Folder | Role | Edit Rule |
| --- | --- | --- | --- |
| Source knowledge | `01_sources/` | Source cards and immutable captures for the wiki | Append new snapshots; do not silently overwrite |
| User input | `inputs/` | User-provided files and raw received material | Append-only by default |
| Intermediate work | `work/` | Scratch analysis, drafts, temporary transforms | Editable; not a deliverable |
| Product code | `src/` | Runtime, contracts, harness, verification, CLI code | Editable with tests or explicit verification |
| Design record | `docs/design/` | Current target design and implementation contracts | Curated; update when design intent changes |
| Architecture decision | `docs/adr/` | Durable decisions and alternatives | Append new ADRs; avoid rewriting old decisions except for metadata fixes |
| Research note | `docs/research/` | Evidence-backed analysis and comparison | Separate confirmed facts from interpretation |
| Execution evidence | `runs/` | Run logs, verification evidence, handoff and recovery notes | Append or update for the active run |
| Final output | `outputs/` | User-facing final briefs and reports | Final or reviewable only |
| Release manifest | `outputs/releases/` | Human-readable release notes, checksums, verification summaries | Track manifests; keep large binaries outside git unless explicitly approved |

## Promotion Flow

Use this flow when work becomes more durable:

1. Put raw input in `inputs/` or source cards in `01_sources/`.
2. Put exploratory analysis in `work/`.
3. Promote stable design to `docs/design/` or a decision to `docs/adr/`.
4. Put implementation under `src/`.
5. Record execution and verification under `runs/`.
6. Publish a human-facing summary under `outputs/`.

Do not skip directly from scratch work to `outputs/` unless the task is explicitly a final report and the source evidence is already clear.

## Outputs Rule

`outputs/` is not a general artifact bucket.

Allowed:

- final briefs
- final reports
- user-facing summaries
- release notes
- artifact manifests
- verification summaries

Not allowed:

- scratch notes
- unverified drafts
- raw source captures
- private live data
- build folders
- generated dependency folders
- large binaries without explicit approval

## Release Rule

Use `outputs/releases/<version>/` for release-facing metadata:

```text
outputs/releases/v0.1.0/
  release-notes.md
  artifact-manifest.md
  checksums.txt
  verification-summary.md
```

Large binaries, packaged apps, coverage folders, and build directories should normally stay in ignored local folders or an external release system. If the user asks to track a large release artifact, record the reason in the release manifest.

## Minimum Metadata

Markdown deliverables should include frontmatter that names type, status, change policy, and derivation.

```yaml
---
type: Final Output
title: Example Brief
status: final
change_policy: curated
derived_from:
  - docs/design/example.md
  - runs/2026-06-19-example.md
verified_by:
  - frontmatter validation
  - internal link validation
---
```

## Review Questions

Before closing a task, answer:

- Is this source, work, code, evidence, design, or final output?
- Is the file in the matching folder?
- Can a later Codex tell what was verified?
- Can a human read `outputs/` without seeing scratch material?
- Can a future implementation continue from `docs/design/`, `docs/adr/`, `src/`, and `runs/`?
