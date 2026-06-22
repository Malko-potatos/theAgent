---
type: Source Card
title: NousResearch/hermes-agent
description: Hermes Agent, a self-improving AI agent with learning loop, skills, memory, messaging gateway, subagents, and multiple terminal backends.
resource: https://github.com/nousresearch/hermes-agent
tags: [layer/l1-source, source/github, topic/agent-runtime, topic/skills, topic/context-management, topic/persistence, topic/multi-agent]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L1
status: reviewed
change_policy: immutable
source_type: github_repo
captured_at: "2026-06-19T00:00:00+09:00"
source_version: accessed-2026-06-19
derived_from: []
supports: []
aliases: [Hermes Agent]
confidence: source
verification:
  last_checked: "2026-06-19"
  method: repository-source-review
---

# Source Scope

- Repository: https://github.com/nousresearch/hermes-agent
- Accessed: 2026-06-19
- Files to review in future capture:
  - `README.md`
  - `AGENTS.md`
  - `hermes/`
  - `hermes_state.py`
  - `toolsets.py`
  - `trajectory_compressor.py`
  - `mcp_serve.py`
  - `mini_swe_runner.py`

# Confirmed Facts

- The repository describes Hermes Agent as a self-improving AI agent built by Nous Research.
- The README says Hermes has a built-in learning loop, creates skills from experience, improves skills during use, persists knowledge, searches past conversations, and models the user across sessions.
- The README describes a terminal interface, messaging gateway integrations, cross-session recall, scheduled automations, isolated subagents, multiple terminal backends, and trajectory generation/compression for research.
- The repository is licensed under MIT.

# Agent Operation Signals

- Skills and memory: study how experience becomes reusable skills and persisted knowledge.
- Context management: inspect session search, summarization, memory, and trajectory compression.
- Multi-agent execution: inspect how isolated subagents are spawned and tracked.
- Tool/runtime portability: compare local, Docker, SSH, Singularity, Modal, and Daytona backend assumptions.
- Research lane: treat self-improvement as an offline/evaluation topic before adopting runtime mutation.

# Derived Notes

- Add a normalized summary under `/02_normalized/open-source/nousresearch__hermes-agent/` after code-level review.
- Add a project research note under `/docs/research/hermes-agent/` when the comparison matrix is filled.

# Citations

[1] [NousResearch/hermes-agent](https://github.com/nousresearch/hermes-agent)
