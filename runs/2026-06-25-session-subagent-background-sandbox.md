---
type: Run Note
title: Session, Subagent, Background Shell, And Sandbox Research
status: completed
date: 2026-06-25
---

# Session, Subagent, Background Shell, And Sandbox Research

## Goal

Research how open-source coding agents handle:

- multiple session execution,
- subagents,
- background shell or long-running tasks,
- sandbox and permission management.

## Boundaries

- L05 tool harness.
- L06 approval and permission.
- L08 trajectory and persistence.
- L10 resilience and recovery.
- L11 extensibility.
- L12 human-facing surface.

## Context Read

Repo-local context:

- `AGENTS.md`
- `docs/harness/code-analysis-automation.md`
- `docs/research/layers/README.md`
- `docs/research/layers/L05-tool-harness.md`
- `docs/research/layers/P00-agent-loop-orchestrator.md`
- `docs/research/layers/L08-trajectory.md`
- `docs/design/P00-target-loop-contract.md`
- `docs/design/L08-trajectory-kernel-contract.md`
- `templates/layer-analysis.md`

External/local source context:

- `work/external-repos/openai__codex`
- `work/external-repos/moonshotai__kimi-cli`
- `work/external-repos/xiaomimimo__mimo-code`

Live public context:

- OpenHands README and Software Agent SDK README/source on GitHub.
- Cline README, SDK architecture, and Kanban README on GitHub.

## Changed Files

- Added
  `docs/research/layers/2026-06-25-session-subagent-background-sandbox.md`.
- Added `runs/2026-06-25-session-subagent-background-sandbox.md`.

Pre-existing changes were observed and intentionally left untouched:

- `docs/research/layers/README.md`
- `docs/research/layers/L05-tool-harness.md`

## Key Findings

- Multiple sessions need a manager that owns ids, lifecycle, execution capacity,
  persistence, event subscription, and attach/detach semantics.
- Subagents are safest when represented as child sessions with parent/fork/tool
  call metadata rather than invisible recursive tool calls.
- Background shell commands need durable task ids, output cursors, heartbeat,
  timeout, stop semantics, and replayable lifecycle events.
- Permission prompts, worktree isolation, and OS/container sandboxing are
  different facts and should be represented separately.
- The first local prototype should use fake provider and fake shell tasks before
  adding real process execution.

## Verification

Performed verification:

- Check required heading/frontmatter by reading the created files.
- Run `git status --short`.

Result:

- Created files have frontmatter and required headings.
- `git status --short` shows this run's two new files plus pre-existing changes
  to `docs/research/layers/README.md` and
  `docs/research/layers/L05-tool-harness.md`.

No code or automation behavior was changed, so no runtime test was required for
this pass.

## Next Step

Turn the research note into a small design contract for:

- `SessionRuntimeManager`,
- `SubagentSpawn`,
- `BackgroundTask`,
- `ToolExecutionGate`,
- deterministic replay fixtures for background task and subagent lifecycles.
