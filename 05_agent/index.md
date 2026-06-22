---
type: Index
title: Agent Index
description: Agent-facing read order, update rules, and runbook entrypoint.
resource: ""
tags: [index/agent, layer/l5-agent]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L5
status: reviewed
change_policy: curated
source_type: index
captured_at: "2026-06-19T00:00:00+09:00"
source_version: initial
derived_from:
  - /00_meta/schema.md
  - /00_meta/validation.md
  - /03_concepts/context-management.md
supports: []
aliases: [agent entrypoint]
confidence: high
verification:
  last_checked: "2026-06-19"
  method: manual
---

# Agent Index

## Read Order

1. [/AGENTS.md](/AGENTS.md)
2. [/index.md](/index.md)
3. [/00_meta/index.md](/00_meta/index.md)
4. [/90_moc/MOC-LLM-Wiki.md](/90_moc/MOC-LLM-Wiki.md)
5. Relevant Layer 1 source cards under [/01_sources/index.md](/01_sources/index.md)
6. Relevant normalized notes under [/02_normalized/index.md](/02_normalized/index.md)
7. Relevant concept notes under [/03_concepts/index.md](/03_concepts/index.md)
8. Relevant synthesis notes under [/04_synthesis/index.md](/04_synthesis/index.md)
9. Quality checks under [/06_quality/index.md](/06_quality/index.md)

## Layer Policy

- Layer 1: do not overwrite. Add a new dated snapshot if the source changes.
- Layer 2: edit only when source card links are present.
- Layer 3: edit only with `derived_from` and source links.
- Layer 4: separate confirmed facts from interpretation.
- Layer 5: keep runbooks short, operational, and verifiable.

## Runbooks

- [runbooks/update-note.md](runbooks/update-note.md)
- [runbooks/source-ingest.md](runbooks/source-ingest.md)
