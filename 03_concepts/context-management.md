---
type: Concept Note
title: Context Management
description: Agent와 사람이 필요한 지식만 단계적으로 읽도록 index, source, note, synthesis를 정렬하는 운영 원칙.
resource: ""
tags: [layer/l3-concept, topic/context-management]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L3
status: draft
change_policy: curated
source_type: concept
captured_at: "2026-06-19T00:00:00+09:00"
source_version: initial
derived_from:
  - /02_normalized/open-source/pydantic__pydantic-ai-harness/summary.md
supports:
  - /05_agent/index.md
aliases: [context, read order]
confidence: medium
verification:
  last_checked: "2026-06-19"
  method: citation-check
---

# Definition

Context management는 agent가 전체 vault를 한 번에 읽지 않고, index에서 시작해 필요한 source와 note만 선택하도록 하는 운영 원칙이다.

# Why It Matters

LLM/agent는 context 예산과 drift 위험이 있다. 읽기 우선순위를 정하면 근거 추적과 갱신 안정성이 높아진다.

# Confirmed Facts

- 이 vault의 source card와 normalized note는 pydantic-ai-harness를 context management 참고 source로 기록한다.

# Interpretation

읽기 순서는 `index -> MOC -> source card -> normalized note -> concept -> synthesis -> quality`를 기본으로 한다.

# Related Notes

- [agent-capability.md](agent-capability.md)
- [verification-loop.md](verification-loop.md)

# Source Links

- [/02_normalized/open-source/pydantic__pydantic-ai-harness/summary.md](/02_normalized/open-source/pydantic__pydantic-ai-harness/summary.md)

# Open Questions

- Agent가 자동으로 읽을 최대 note 수와 fallback search 규칙을 정한다.
