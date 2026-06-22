---
type: Source Card
title: pydantic/pydantic-ai-harness
description: Pydantic AI agent를 capability 단위로 확장하는 first-party capability library.
resource: https://github.com/pydantic/pydantic-ai-harness
tags: [layer/l1-source, source/github, topic/agent-capability, topic/context-management, topic/verification-loop]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L1
status: reviewed
change_policy: immutable
source_type: github_repo
captured_at: "2026-06-19T00:00:00+09:00"
source_version: accessed-2026-06-19
derived_from: []
supports:
  - /03_concepts/agent-capability.md
  - /03_concepts/context-management.md
  - /03_concepts/verification-loop.md
aliases: [Pydantic AI Harness]
confidence: source
verification:
  last_checked: "2026-06-19"
  method: repository-source-review
---

# Source Scope

- Repository: https://github.com/pydantic/pydantic-ai-harness
- Accessed: 2026-06-19
- Files to review in future capture:
  - `README.md`
  - `AGENTS.md`
  - package source under `pydantic_ai_harness/`

# Confirmed Facts

- The repository presents a capability library for Pydantic AI agents.
- For this vault, it is used as a design reference for capability separation, context management, skills, tool use, verification loop, and persistence.

# Agent Operation Signals

- Capability: group tools, instructions, lifecycle behavior, and settings into composable units.
- Context management: keep read order and compression rules explicit.
- Skills: expose repeatable operating procedures as agent-facing documents.
- Tool use: record allowed side effects and verification expectations.
- Verification loop: require checks after updates.
- Persistence: keep source cards, derived notes, and logs separated.

# Derived Notes

- [/03_concepts/agent-capability.md](/03_concepts/agent-capability.md)
- [/03_concepts/context-management.md](/03_concepts/context-management.md)
- [/03_concepts/verification-loop.md](/03_concepts/verification-loop.md)
- [/05_agent/runbooks/update-note.md](/05_agent/runbooks/update-note.md)

# Citations

[1] [pydantic/pydantic-ai-harness](https://github.com/pydantic/pydantic-ai-harness)
