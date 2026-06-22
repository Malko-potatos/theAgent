---
type: Standard
title: Validation Rules
description: Manual and agent-facing checklist for vault updates.
resource: ""
tags: [standard/validation, wiki/quality]
timestamp: "2026-06-19T00:00:00+09:00"
layer: Meta
status: draft
change_policy: curated
source_type: schema
captured_at: "2026-06-19T00:00:00+09:00"
source_version: initial
derived_from: []
supports: []
aliases: [validation checklist]
confidence: high
verification:
  last_checked: "2026-06-19"
  method: manual
---

# Validation Rules

## Before Updating

- 읽을 파일 범위를 `index.md`와 MOC에서 먼저 좁힌다.
- Layer 1을 수정해야 할 것처럼 보이면 새 dated snapshot을 만든다.
- 기존 path identity를 바꾸기 전에 backlinks를 확인한다.

## After Updating

- YAML frontmatter가 parse 가능한지 확인한다.
- `type`, `title`, `tags`, `layer`, `status`, `change_policy`, `derived_from` 필드를 확인한다.
- 내부 링크가 실제 파일을 가리키는지 확인한다.
- Layer 3 이상에서 source 없이 사실을 단정하지 않는다.
- root [log.md](/log.md) 또는 관련 folder log에 변경 이력을 남긴다.

## Layer 1 Guardrail

Layer 1 source card는 source snapshot의 record다. 정정이 필요하면 기존 파일을 덮어쓰지 말고 새 날짜 폴더를 만든다.
