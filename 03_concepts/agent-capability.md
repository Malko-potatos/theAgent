---
type: Concept Note
title: Agent Capability
description: Agent가 수행할 수 있는 도구, 절차, guardrail, memory, verification 능력을 분리해 조립하는 단위.
resource: ""
tags: [layer/l3-concept, topic/agent-capability]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L3
status: draft
change_policy: curated
source_type: concept
captured_at: "2026-06-19T00:00:00+09:00"
source_version: initial
derived_from:
  - /01_sources/open-source/github/pydantic__pydantic-ai-harness/2026-06-19/source-card.md
  - /02_normalized/open-source/pydantic__pydantic-ai-harness/summary.md
supports:
  - /05_agent/runbooks/update-note.md
aliases: [capability, agent capability]
confidence: medium
verification:
  last_checked: "2026-06-19"
  method: citation-check
---

# Definition

Agent capability는 agent가 수행할 수 있는 행동 단위를 도구, 지침, 읽기 순서, 권한, 검증 절차와 함께 묶은 knowledge unit이다.

# Why It Matters

Capability를 분리하면 source ingest, concept update, claim audit, runbook update 같은 작업을 서로 다른 절차와 검증 기준으로 운영할 수 있다.

# Confirmed Facts

- [/01_sources/open-source/github/pydantic__pydantic-ai-harness/2026-06-19/source-card.md](/01_sources/open-source/github/pydantic__pydantic-ai-harness/2026-06-19/source-card.md)는 capability separation을 agent 운영 참고점으로 기록한다.

# Interpretation

이 vault에서는 capability를 코드 플러그인이 아니라 agent-facing runbook과 index의 조합으로 먼저 표현한다.

# Related Notes

- [context-management.md](context-management.md)
- [verification-loop.md](verification-loop.md)

# Source Links

- [/02_normalized/open-source/pydantic__pydantic-ai-harness/summary.md](/02_normalized/open-source/pydantic__pydantic-ai-harness/summary.md)

# Open Questions

- Capability 문서를 별도 `05_agent/skills/` 파일로 분리할 기준을 정한다.
