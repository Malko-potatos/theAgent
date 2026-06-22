---
type: Source Card
title: XiaomiMiMo/MiMo-Code
description: MiMo Code, a terminal-native AI coding assistant focused on model-agent co-evolution, persistent memory, subagents, and structured workflows.
resource: https://github.com/XiaomiMiMo/MiMo-Code
tags: [layer/l1-source, source/github, topic/agent-runtime, topic/context-management, topic/persistence, topic/multi-agent, topic/verification-loop]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L1
status: reviewed
change_policy: immutable
source_type: github_repo
captured_at: "2026-06-19T00:00:00+09:00"
source_version: accessed-2026-06-19
derived_from: []
supports: []
aliases: [MiMo Code, MiMoCode]
confidence: source
verification:
  last_checked: "2026-06-19"
  method: repository-source-review
---

# Source Scope

- Repository: https://github.com/XiaomiMiMo/MiMo-Code
- Accessed: 2026-06-19
- Files to review in future capture:
  - `README.md`
  - `AGENTS.md`
  - `CLAUDE.md`
  - `.mimocode/`
  - `packages/`
  - `sdks/vscode/`
  - `docs/`

# Confirmed Facts

- The README describes MiMoCode as a terminal-native AI coding assistant.
- The README says it can read and write code, run commands, manage Git, and use persistent memory across sessions while continuously improving itself.
- The README documents multiple primary agents: `build`, `plan`, and `compose`.
- The README describes persistent memory with project memory, session checkpoint, scratch notes, and per-task progress logs.
- The README describes intelligent context management, task tracking, subagents, a goal/stop condition judged by an independent judge model, and compose mode for specs-driven development.
- The repository is licensed under MIT.

# Agent Operation Signals

- Context governance: study checkpoint, memory injection, task progress, and budgeted context reconstruction.
- Multi-agent lifecycle: inspect primary agents, subagents, and background execution.
- Verification loop: inspect the `/goal` independent judge model and compose-mode verification workflow.
- Local rules: compare `AGENTS.md`, `CLAUDE.md`, and `.mimocode/` as rule carriers.
- IDE boundary: compare `sdks/vscode/` with terminal-native runtime assumptions.

# Derived Notes

- Add a normalized summary under `/02_normalized/open-source/xiaomimimo__mimo-code/` after code-level review.
- Add a project research note under `/docs/research/mimo-code/` when the comparison matrix is filled.

# Citations

[1] [XiaomiMiMo/MiMo-Code](https://github.com/XiaomiMiMo/MiMo-Code)
