---
type: Normalized Note
title: pydantic-ai-harness Normalized Summary
description: Agent operation signals extracted from pydantic-ai-harness for this wiki.
resource: https://github.com/pydantic/pydantic-ai-harness
tags: [layer/l2-normalized, source/github, topic/agent-capability]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L2
status: draft
change_policy: curated
source_type: github_repo
captured_at: "2026-06-19T00:00:00+09:00"
source_version: accessed-2026-06-19
derived_from:
  - /01_sources/open-source/github/pydantic__pydantic-ai-harness/2026-06-19/source-card.md
supports:
  - /03_concepts/agent-capability.md
  - /05_agent/runbooks/update-note.md
aliases: [harness normalized summary]
confidence: medium
verification:
  last_checked: "2026-06-19"
  method: source-card-normalization
---

# Confirmed Facts

- See [/01_sources/open-source/github/pydantic__pydantic-ai-harness/2026-06-19/source-card.md](/01_sources/open-source/github/pydantic__pydantic-ai-harness/2026-06-19/source-card.md).

# Normalized Signals

## Capability

Agent behavior should be split into composable capability documents rather than hidden in a single prompt.

## Context Management

Agent read order should be explicit. Start from indexes, narrow to source cards, then read derived notes.

## Tool Use

Tool side effects should be visible through runbooks, allowed edit scope, and verification checks.

## Verification Loop

Every update should end with a small checklist: schema, links, source trace, and log entry.

## Persistence

Keep source snapshots, normalized summaries, concept notes, and logs in separate layers.

# Open Questions

- Capture a concrete commit SHA for the repository source card.
- Add file-by-file extraction after a repository clone or GitHub source review.
