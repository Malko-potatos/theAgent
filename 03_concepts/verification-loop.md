---
type: Concept Note
title: Verification Loop
description: Agent나 사람이 note를 갱신한 뒤 schema, links, source trace, log를 확인하는 반복 절차.
resource: ""
tags: [layer/l3-concept, topic/verification-loop]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L3
status: draft
change_policy: curated
source_type: concept
captured_at: "2026-06-19T00:00:00+09:00"
source_version: initial
derived_from:
  - /00_meta/validation.md
  - /02_normalized/open-source/pydantic__pydantic-ai-harness/summary.md
supports:
  - /05_agent/runbooks/update-note.md
aliases: [verification, update check]
confidence: medium
verification:
  last_checked: "2026-06-19"
  method: citation-check
---

# Definition

Verification loop는 update 이후 YAML, links, source trace, layer policy, log entry를 확인하는 닫힌 절차다.

# Why It Matters

Source와 derived knowledge가 섞이면 wiki가 빠르게 불신 상태가 된다. Verification loop는 변경을 작게 만들고 trace를 남긴다.

# Confirmed Facts

- [/00_meta/validation.md](/00_meta/validation.md)는 vault update 후 확인해야 할 checklist를 정의한다.

# Interpretation

Agent는 작업 완료 전 `06_quality`와 root `log.md`를 확인하고, 필요하면 quality note를 append한다.

# Related Notes

- [agent-capability.md](agent-capability.md)
- [context-management.md](context-management.md)

# Source Links

- [/00_meta/validation.md](/00_meta/validation.md)
- [/02_normalized/open-source/pydantic__pydantic-ai-harness/summary.md](/02_normalized/open-source/pydantic__pydantic-ai-harness/summary.md)

# Open Questions

- 자동 link checker와 YAML checker를 어떤 스크립트로 둘지 정한다.
