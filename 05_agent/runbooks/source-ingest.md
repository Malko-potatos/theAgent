---
type: Agent Runbook
title: Source Ingest Runbook
description: How to add a new source card without mixing source and derived knowledge.
resource: ""
tags: [layer/l5-agent, agent/runbook, source/ingest]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L5
status: reviewed
change_policy: curated
source_type: runbook
captured_at: "2026-06-19T00:00:00+09:00"
source_version: initial
derived_from:
  - /00_meta/schema.md
  - /00_meta/templates/source-card-open-source.md
  - /00_meta/templates/source-card-web.md
  - /00_meta/templates/source-card-paper.md
supports: []
aliases: [source ingest]
confidence: high
verification:
  last_checked: "2026-06-19"
  method: dry-run
---

# When To Use

Use this when adding open-source code, a web page, or a PDF/paper source to Layer 1.

# Read Order

1. Read [/01_sources/index.md](/01_sources/index.md).
2. Choose the matching template under [/00_meta/templates/](/00_meta/templates/).
3. Capture source metadata before summarizing.
4. Add a source card under a dated folder.

# Path Rules

- GitHub: `/01_sources/open-source/github/<owner>__<repo>/<yyyy-mm-dd>/source-card.md`
- Web: `/01_sources/web/<site-or-slug>/<yyyy-mm-dd>/source-card.md`
- Paper: `/01_sources/papers/<year>-<author>-<short-title>/source-card.md`

# Required Verification

- `resource` points to the canonical source.
- `source_version` is a commit, tag, version, DOI, published date, or access date.
- The source card only records source facts and design signals.
- Any interpretation is moved to Layer 2 or higher.
