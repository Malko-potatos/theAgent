---
type: Source Card
title: wquguru/harness-books
description: Two books on harness engineering, focused on constraints, query loops, context governance, permissions, recovery, verification, and team institutions.
resource: https://github.com/wquguru/harness-books
tags: [layer/l1-source, source/github, topic/harness, topic/context-management, topic/verification-loop, topic/permission-gate]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L1
status: reviewed
change_policy: immutable
source_type: github_repo
captured_at: "2026-06-19T00:00:00+09:00"
source_version: accessed-2026-06-19
derived_from: []
supports:
  - /docs/harness/strategy.md
  - /docs/harness/operating-model.md
  - /docs/harness/policy.md
  - /docs/harness/checklists.md
aliases: [Harness Books]
confidence: source
verification:
  last_checked: "2026-06-19"
  method: web-source-review
---

# Source Scope

- Repository: https://github.com/wquguru/harness-books
- Accessed: 2026-06-19
- Reviewed:
  - `README.md`
  - `AGENTS.md`
  - `.codex/skills/harness-book-best-practice/SKILL.md`
  - Book 1 Chapter 9
  - Book 2 Chapters 3, 4, 5, 6, 7, and 8

# Confirmed Facts

- The repository contains two books on harness engineering and the design philosophies behind Claude Code and Codex.
- The README frames prompts, tools, permissions, state, recovery, verification, and institutions as parts of one control structure.
- Book 1 Chapter 9 states that models are unstable components, prompt is part of the control plane, query loop is the heartbeat, tools need managed execution, context is working memory, recovery is a main path, verification should be independent, and team institutions matter.
- Book 2 distinguishes Claude Code's runtime discipline from Codex's structured control layer across thread, rollout, state, tools, policy, skills, hooks, and verification.

# Local Harness Signals

- Put the top-level execution contract in `AGENTS.md`.
- Keep source, input, work, output, and logs in separate folders.
- Make approval rules explicit before tool action.
- Keep verification evidence separate from implementation claims.
- Use templates and checklists to turn personal habits into reusable team rules.

# Derived Notes

- [/02_normalized/open-source/wquguru__harness-books/summary.md](/02_normalized/open-source/wquguru__harness-books/summary.md)
- [/docs/harness/strategy.md](/docs/harness/strategy.md)
- [/docs/harness/operating-model.md](/docs/harness/operating-model.md)
- [/docs/harness/policy.md](/docs/harness/policy.md)
- [/docs/harness/checklists.md](/docs/harness/checklists.md)

# Citations

[1] [wquguru/harness-books](https://github.com/wquguru/harness-books)
