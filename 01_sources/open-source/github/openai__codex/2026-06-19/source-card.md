---
type: Source Card
title: openai/codex
description: OpenAI Codex CLI, a local terminal coding agent and reference implementation for Codex-style harness architecture.
resource: https://github.com/openai/codex
tags: [layer/l1-source, source/github, topic/agent-runtime, topic/tool-use, topic/permission-gate, topic/context-management, topic/persistence]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L1
status: reviewed
change_policy: immutable
source_type: github_repo
captured_at: "2026-06-19T00:00:00+09:00"
source_version: accessed-2026-06-19
derived_from: []
supports: []
aliases: [OpenAI Codex CLI, Codex CLI]
confidence: source
verification:
  last_checked: "2026-06-19"
  method: repository-source-review
---

# Source Scope

- Repository: https://github.com/openai/codex
- Accessed: 2026-06-19
- Files to review in future capture:
  - `README.md`
  - `AGENTS.md`
  - `codex-cli/`
  - `codex-rs/`
  - `sdk/`
  - `tools/`
  - `docs/`

# Confirmed Facts

- The repository describes Codex CLI as a coding agent from OpenAI that runs locally on the user's computer.
- The repository includes `codex-cli`, `codex-rs`, `sdk`, `tools`, and `docs` directories.
- The README documents installation through the installer script, npm package `@openai/codex`, Homebrew cask, and GitHub releases.
- The repository is licensed under Apache-2.0.

# Agent Operation Signals

- Runtime/harness separation: compare `codex-rs`, `codex-cli`, `sdk`, and `tools`.
- Local terminal harness: study how a terminal-first agent exposes approvals, filesystem changes, and command execution.
- Thread/state/persistence: inspect SDK and runtime modules for how Codex represents session continuity.
- Tool policy: inspect tool schemas and permission behavior before using this as an implementation model.

# Derived Notes

- Add a normalized summary under `/02_normalized/open-source/openai__codex/` after code-level review.
- Add a project research note under `/docs/research/openai-codex/` when the comparison matrix is filled.

# Citations

[1] [openai/codex](https://github.com/openai/codex)
