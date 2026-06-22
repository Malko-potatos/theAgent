---
type: Standard
title: Link Rules
description: File-path identity, citation, and backlink rules for this vault.
resource: ""
tags: [standard/links, wiki/identity]
timestamp: "2026-06-19T00:00:00+09:00"
layer: Meta
status: draft
change_policy: curated
source_type: schema
captured_at: "2026-06-19T00:00:00+09:00"
source_version: initial
derived_from:
  - /01_sources/web/google-cloud-okf-introduction/2026-06-19/source-card.md
supports: []
aliases: [link standard]
confidence: medium
verification:
  last_checked: "2026-06-19"
  method: manual
---

# Link Rules

## Identity

파일 경로가 문서 identity다. 같은 개념을 여러 파일로 만들지 않는다. 이름이 바뀌면 Obsidian의 link update 기능으로 연결을 갱신한다.

## Internal Links

본문의 공식 링크는 Markdown path link를 우선한다.

```markdown
[/03_concepts/context-management.md](/03_concepts/context-management.md)
```

Obsidian wikilink는 탐색 편의가 필요할 때만 보조로 쓴다.

## Source Links

Layer 2 이상에서 원본 사실을 말할 때는 다음 중 하나를 링크한다.

- Layer 1 source card
- Layer 2 normalized note
- 외부 canonical URL

## Claim Discipline

- `확인된 사실`: source 또는 normalized note에서 확인한 내용만 쓴다.
- `해석`: 이 vault의 판단임을 명시한다.
- `열린 질문`: 아직 검증되지 않은 가설을 둔다.
