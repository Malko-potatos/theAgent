---
type: Index
title: theAgent LLM Wiki
description: Open-source coding agent knowledge vault for source cards, normalized notes, concepts, synthesis, and agent-facing runbooks.
resource: ""
tags: [index/root, wiki/entrypoint]
timestamp: "2026-06-19T00:00:00+09:00"
layer: Root
status: draft
change_policy: curated
source_type: index
captured_at: "2026-06-19T00:00:00+09:00"
source_version: initial
derived_from: []
supports: []
aliases: [LLM Wiki, theAgent vault]
confidence: high
verification:
  last_checked: "2026-06-19"
  method: initial-structure-check
---

# theAgent LLM Wiki

이 vault는 coding agent system의 source, knowledge, note, index, bundle을 안정적으로 축적하기 위한 Markdown-first knowledge base다.

## Read First

- [AGENTS.md](AGENTS.md): 이 repo에서 Codex가 항상 따르는 최상위 실행 계약.
- [docs/harness/research-charter.md](docs/harness/research-charter.md): 기존 연구 목적과 세부 비교 프레임.
- [00_meta/index.md](00_meta/index.md): schema, tags, links, validation 규칙.
- [docs/harness/operating-model.md](docs/harness/operating-model.md): 로컬 에이전트 작업 흐름.
- [docs/harness/code-analysis-automation.md](docs/harness/code-analysis-automation.md): P00 관찰 축과 12계층 코드 분석 자동화.
- [90_moc/MOC-LLM-Wiki.md](90_moc/MOC-LLM-Wiki.md): 사람을 위한 전체 지도.
- [05_agent/index.md](05_agent/index.md): agent가 읽는 우선순위와 갱신 절차.

## Knowledge Layers

- [01_sources/index.md](01_sources/index.md): Layer 1. 수정하지 않는 source cards와 source blobs.
- [02_normalized/index.md](02_normalized/index.md): Layer 2. source별 정규화와 요약.
- [03_concepts/index.md](03_concepts/index.md): Layer 3. 여러 source를 잇는 개념 wiki.
- [04_synthesis/index.md](04_synthesis/index.md): Layer 4. 비교, 판단, research briefs.
- [05_agent/index.md](05_agent/index.md): Layer 5. agent-facing index와 runbooks.
- [06_quality/index.md](06_quality/index.md): 검증, 링크 점검, source freshness.

## Local Harness Folders

- [inputs/README.md](inputs/README.md): 원본 입력.
- [work/README.md](work/README.md): 중간 작업.
- [outputs/README.md](outputs/README.md): 최종 산출물.
- [runs/README.md](runs/README.md): 실행 로그와 recovery note.
- [templates/task-brief.md](templates/task-brief.md): 반복 작업 정의 템플릿.
- [templates/final-report.md](templates/final-report.md): 완료 보고 템플릿.
- [scripts/analyze-layer.sh](scripts/analyze-layer.sh): 레이어 분석 workspace 생성 스크립트.

## Operating Rule

Layer 1은 append-only로 다룬다. Layer 2 이상에서만 정규화, 해석, 비교, 운영 절차를 갱신한다.
