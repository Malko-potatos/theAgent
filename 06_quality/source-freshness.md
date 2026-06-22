---
type: Quality Log
title: Source Freshness
description: Append-only log for source recency and snapshot refresh decisions.
resource: ""
tags: [quality/source-freshness]
timestamp: "2026-06-19T00:00:00+09:00"
layer: Quality
status: draft
change_policy: append-only
source_type: log
captured_at: "2026-06-19T00:00:00+09:00"
source_version: initial
derived_from:
  - /01_sources/index.md
supports: []
aliases: [source freshness]
confidence: high
verification:
  last_checked: "2026-06-19"
  method: manual
---

# Source Freshness

## 2026-06-19

- OKF and pydantic-ai-harness source cards use access-date source versions.
- Future refresh should capture exact repository commit SHA for pydantic-ai-harness.
