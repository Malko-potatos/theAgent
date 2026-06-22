---
type: Normalized Note
title: harness-books Normalized Summary
description: Harness engineering principles normalized for the local Codex harness in this repo.
resource: https://github.com/wquguru/harness-books
tags: [layer/l2-normalized, source/github, topic/harness, topic/permission-gate, topic/verification-loop]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L2
status: reviewed
change_policy: curated
source_type: github_repo
captured_at: "2026-06-19T00:00:00+09:00"
source_version: accessed-2026-06-19
derived_from:
  - /01_sources/open-source/github/wquguru__harness-books/2026-06-19/source-card.md
supports:
  - /docs/harness/strategy.md
  - /docs/harness/policy.md
aliases: [harness-books summary]
confidence: medium
verification:
  last_checked: "2026-06-19"
  method: source-card-normalization
---

# Confirmed Facts

See [/01_sources/open-source/github/wquguru__harness-books/2026-06-19/source-card.md](/01_sources/open-source/github/wquguru__harness-books/2026-06-19/source-card.md).

# Normalized Principles

## Control Structure

Prompts, tools, permissions, state, recovery, verification, and local institutions must be designed together.

## Prompt As Control Plane

The root instruction file should define operating protocol, folder boundaries, approval rules, and reporting obligations.

## Continuity

Claude Code emphasizes query-loop continuity. Codex emphasizes thread, rollout, and state. This repo uses `runs/` as the durable state handoff layer.

## Context Governance

Read order should be explicit. Do not stuff every note into context. Use indexes and targeted source reading.

## Tool And Permission Policy

Dangerous execution should be governed by explicit approval rules before tool action begins.

## Verification And Recovery

Execution evidence and verification judgment must be separated. Recovery notes should optimize for continuation rather than recap.

## Team Rules

Checklists and templates are the local institution layer. They preserve repeatable practice beyond a single agent turn.

# Local Application

- Root `AGENTS.md` is the compact execution contract.
- `docs/harness/` holds expanded policy and operating model.
- `inputs/`, `work/`, `outputs/`, and `runs/` enforce artifact boundaries.
- `templates/` turns recurring task intake and reporting into reusable rules.
