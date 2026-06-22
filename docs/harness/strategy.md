---
type: Harness Strategy
title: Local Codex Harness Strategy
description: Design principles adapted from harness-books for this local agent folder.
tags: [harness/strategy, control-plane, local-governance]
status: draft
change_policy: curated
---

# Local Codex Harness Strategy

## Confirmed From harness-books

The `wquguru/harness-books` README frames harness engineering as the structure that keeps a code-writing model bounded, continuous, and accountable once it enters terminals, repositories, permission systems, and team workflows.

Book 1 Chapter 9 compresses the stance into several operating principles: models are unstable components, prompt belongs to the control plane, query loop is the heartbeat, tools are managed execution interfaces, context is working memory, recovery paths are main paths, verification must be independent, and team institutions matter more than personal tricks.

Book 2 compares Claude Code and Codex as two different placements of order. Claude Code leans toward runtime discipline: query loop, tool orchestration, interrupts, compaction, and recovery. Codex leans toward explicit control layers: instruction fragments, tool schemas, approval policy, thread, rollout, state, hooks, and managed skills.

## Local Interpretation

This folder is not building a full runtime. It is a local operating contract for Codex runs. Therefore the control layer must be expressed as files Codex can read every turn:

- `AGENTS.md` is the top-level control plane.
- `docs/harness/` holds policy and process details.
- `templates/` turns reusable habits into repeatable task definitions.
- `runs/` keeps state handoff and verification evidence.
- `inputs/`, `work/`, and `outputs/` prevent source, scratch, and final deliverables from collapsing into one pile.

The primary risk in this repo is institutional drift: rules becoming scattered, source and outputs mixing, and agents silently changing external systems. So this harness starts Codex-first: explicit policy, file boundaries, and structured handoff.

The secondary risk is runtime drift: long tasks losing continuity, verification becoming ceremonial, and recovery notes disappearing. So the harness borrows Claude Code-style discipline: small loops, interruption-aware recovery, and treating failure paths as ordinary.

## Design Principles Applied Here

1. Prompt as control plane: `AGENTS.md` defines behavioral protocol, not personality.
2. State as handoff: `runs/` records what happened, what changed, and how to resume.
3. Tools as governed action: network, browser, connectors, shell, and destructive commands have approval boundaries.
4. Context as governed memory: read root index first, then narrow to the relevant source, note, policy, or runbook.
5. Verification as separate responsibility: executor evidence is not enough for high-risk completion claims.
6. Team rules over personal habits: templates and checklists encode repeatable behavior.

## Claude Discipline And Codex Control Layer

This repo uses a hybrid:

- Claude Code-style runtime discipline for live work: inspect, execute in small steps, recover after interruption, avoid unclosed tool state.
- Codex-style structured control for durable governance: explicit folders, policies, templates, run logs, and approval rules.

The practical rule is simple: write down what must persist, handle locally what only matters during the current turn, and never let either category pretend to be the other.

## Sources

- https://github.com/wquguru/harness-books
- https://raw.githubusercontent.com/wquguru/harness-books/main/README.md
- https://raw.githubusercontent.com/wquguru/harness-books/main/AGENTS.md
- https://raw.githubusercontent.com/wquguru/harness-books/main/.codex/skills/harness-book-best-practice/SKILL.md
- https://raw.githubusercontent.com/wquguru/harness-books/main/book1-claude-code/locales/en/chapter-09-ten-principles.md
- https://raw.githubusercontent.com/wquguru/harness-books/main/book2-comparing/locales/en/chapter-03-loop-thread-and-rollout.md
- https://raw.githubusercontent.com/wquguru/harness-books/main/book2-comparing/locales/en/chapter-04-tools-sandbox-and-exec-policy.md
- https://raw.githubusercontent.com/wquguru/harness-books/main/book2-comparing/locales/en/chapter-05-skills-hooks-and-local-governance.md
- https://raw.githubusercontent.com/wquguru/harness-books/main/book2-comparing/locales/en/chapter-06-delegation-verification-and-state.md
- https://raw.githubusercontent.com/wquguru/harness-books/main/book2-comparing/locales/en/chapter-07-convergence-and-divergence.md
- https://raw.githubusercontent.com/wquguru/harness-books/main/book2-comparing/locales/en/chapter-08-how-to-choose-or-build.md
