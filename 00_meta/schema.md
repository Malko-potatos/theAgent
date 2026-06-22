---
type: Standard
title: Frontmatter Schema
description: YAML frontmatter standard for source, note, synthesis, and agent-facing files.
resource: ""
tags: [standard/schema, wiki/frontmatter]
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
aliases: [frontmatter standard]
confidence: medium
verification:
  last_checked: "2026-06-19"
  method: manual
---

# Frontmatter Schema

모든 신뢰 레이어 Markdown 문서는 YAML frontmatter를 가진다. 파일 경로는 문서 identity이며, `title`은 사람이 읽기 좋은 이름이다.

## Required Fields

```yaml
---
type: Source Card | Normalized Note | Concept Note | Synthesis Note | Agent Runbook | Index | Standard | Quality Log
title: Human-readable title
description: One-line summary
resource: Canonical URL or empty string
tags: [layer/l1-source]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L1 | L2 | L3 | L4 | L5 | Meta | Root | Quality
status: draft | reviewed | verified | deprecated
change_policy: immutable | append-only | curated | generated
source_type: github_repo | web_page | paper | concept | synthesis | runbook | index | schema | log
captured_at: "2026-06-19T00:00:00+09:00"
source_version: commit-sha | url-snapshot-date | doi-version | initial | unknown
derived_from: []
supports: []
aliases: []
confidence: source | high | medium | low
verification:
  last_checked: "2026-06-19"
  method: manual
---
```

## Field Meaning

- `type`: 문서의 운영 유형.
- `layer`: 지식 레이어.
- `change_policy`: 수정 가능성. Layer 1은 `immutable` 또는 `append-only`.
- `source_version`: source snapshot을 식별하는 값.
- `derived_from`: 이 문서가 의존하는 source 또는 note 경로.
- `supports`: 이 문서가 근거를 제공하는 상위 note 경로.
- `confidence`: source 자체인지, 해석인지 구분하는 신뢰 힌트.
