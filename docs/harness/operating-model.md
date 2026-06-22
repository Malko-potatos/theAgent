---
type: Harness Operating Model
title: Operating Model
description: Query loop, context refresh, execution, verification, recovery, and final reporting flow.
tags: [harness/operating-model, query-loop, recovery]
status: draft
change_policy: curated
---

# Operating Model

## 1. Query Loop

Each Codex turn follows a bounded loop:

1. Receive the user request.
2. Inspect local state before changing files.
3. Refresh only the context needed for this task.
4. Plan if the task spans multiple files or risk boundaries.
5. Execute in small edits.
6. Verify with evidence.
7. Report outcome and unresolved risk.

The loop is allowed to continue after tool failures, but it must not hide failures. If a failure changes the plan, record the reason in the final report or a `runs/` handoff note.

## 2. Context Refresh

Default read order:

1. [AGENTS.md](/AGENTS.md)
2. [docs/harness/research-charter.md](/docs/harness/research-charter.md)
3. [index.md](/index.md)
4. Relevant files under [docs/harness/](/docs/harness/)
5. Relevant source cards or wiki notes
6. Relevant `runs/` handoff notes

Do not load every note by default. Search first, then read the smallest set that can answer the task.

## 3. Task Intake

For non-trivial work, identify:

- Objective.
- Files or folders likely affected.
- Source/input materials.
- Output destination.
- Approval-sensitive actions.
- Verification evidence needed.

Use [templates/task-brief.md](/templates/task-brief.md) when a task needs handoff or repeated execution.

## 4. Execution

Execution rules:

- Prefer small, reviewable edits.
- Preserve existing user changes.
- Use `work/` for drafts and scratch artifacts.
- Use `outputs/` only for final user-facing deliverables.
- Use `runs/` for durable execution notes and recovery.
- Use `src/` for product code.
- Use `docs/design/` for current design contracts and `docs/adr/` for durable decisions.
- Keep source records and derived interpretations separate.

Default artifact promotion:

```text
inputs / 01_sources -> work -> docs or src -> runs -> outputs
```

Large release binaries and generated build folders should not be promoted to `outputs/` directly. Use `outputs/releases/` for release notes, manifests, checksums, and verification summaries.

## 5. Verification

Verification asks a different question than execution: not "was something written?", but "what evidence says the result is acceptable?"

Minimum evidence examples:

- Markdown docs: frontmatter parses, internal links resolve, required sections exist.
- Policy docs: approval boundaries and prohibited actions are not contradictory.
- Templates: placeholders are clear and reusable.
- Code: tests, lint, typecheck, dry run, or a clear explanation that no test exists.

High-risk changes need an independent review phase. If no independent reviewer is available, label the result as executor-verified and state residual risk.

## 6. Recovery

Recovery is part of the main path, not an exception.

Create a `runs/YYYY-MM-DD-<slug>.md` note when:

- The task is long enough that context may compact.
- A tool or command fails in a way that changes the plan.
- The user interrupts.
- Verification is incomplete.
- External source review affects decisions.

The recovery note should contain objective, current state, files changed, evidence, blockers, and next step.

## 7. Final Report

Final reports should be short and audit-friendly:

- Changed files.
- Key principles or decisions.
- Verification performed.
- Remaining risks or missing checks.
- Next action only if it directly follows from the work.

Use [templates/final-report.md](/templates/final-report.md) for larger work.
