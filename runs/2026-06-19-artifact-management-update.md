---
type: Run Log
title: Artifact Management Update
description: Handoff note for folder and artifact management policy changes.
tags: [run/artifact-management, harness/outputs, project-structure]
status: complete
change_policy: append-only
date: 2026-06-19
---

# Artifact management update

## Objective

Reflect the project management rule that code, design, evidence, intermediate work, source inputs, and final outputs must be managed in separate locations.

## Applied Rule

```text
inputs / 01_sources -> work -> docs or src -> runs -> outputs
```

## Files Added

- `docs/harness/artifact-management.md`
- `docs/design/README.md`
- `docs/adr/README.md`
- `src/README.md`
- `src/contracts/README.md`
- `src/runtime/README.md`
- `src/harness/README.md`
- `src/verification/README.md`
- `src/cli/README.md`
- `outputs/releases/README.md`

## Files Updated

- `AGENTS.md`
- `docs/harness/policy.md`
- `docs/harness/operating-model.md`
- `templates/task-brief.md`
- `templates/final-report.md`
- `.gitignore`

## Verification

- Frontmatter validation: passed.
- Internal link validation: passed.
- Incomplete marker scan: passed.
