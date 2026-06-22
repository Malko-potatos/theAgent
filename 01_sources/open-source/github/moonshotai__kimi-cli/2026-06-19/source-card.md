---
type: Source Card
title: MoonshotAI/kimi-cli
description: Kimi CLI, a terminal AI agent for software development tasks, shell operations, IDE integration through ACP, and MCP tool management.
resource: https://github.com/MoonshotAI/kimi-cli
tags: [layer/l1-source, source/github, topic/agent-runtime, topic/tool-use, topic/mcp, topic/acp, topic/ide-harness]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L1
status: reviewed
change_policy: immutable
source_type: github_repo
captured_at: "2026-06-19T00:00:00+09:00"
source_version: accessed-2026-06-19
derived_from: []
supports: []
aliases: [Kimi CLI, Kimi Code CLI]
confidence: source
verification:
  last_checked: "2026-06-19"
  method: repository-source-review
---

# Source Scope

- Repository: https://github.com/MoonshotAI/kimi-cli
- Accessed: 2026-06-19
- Files to review in future capture:
  - `README.md`
  - `AGENTS.md`
  - `src/kimi_cli/`
  - `sdks/kimi-sdk/`
  - `.agents/skills/`
  - `docs/`
  - `tests/`
  - `tests_e2e/`

# Confirmed Facts

- The README says Kimi CLI is evolving into Kimi Code CLI and that existing configuration and sessions are migrated by installing Kimi Code CLI.
- The README describes Kimi CLI as a terminal AI agent for software development tasks and terminal operations.
- The README says it can read and edit code, execute shell commands, search and fetch web pages, and autonomously plan and adjust actions during execution.
- The README documents shell command mode, VS Code extension integration, ACP support, Zsh integration, and MCP server management.
- The repository is licensed under Apache-2.0.

# Agent Operation Signals

- Terminal shell boundary: study how shell command mode differs from agent tool execution.
- IDE interoperability: inspect ACP support and agent server behavior.
- MCP governance: inspect `kimi mcp` management and ad-hoc MCP config.
- Skills: inspect `.agents/skills/` as local reusable rules.
- Migration/state: inspect how sessions and configuration migrate toward Kimi Code CLI.

# Derived Notes

- Add a normalized summary under `/02_normalized/open-source/moonshotai__kimi-cli/` after code-level review.
- Add a project research note under `/docs/research/kimi-cli/` when the comparison matrix is filled.

# Citations

[1] [MoonshotAI/kimi-cli](https://github.com/MoonshotAI/kimi-cli)
