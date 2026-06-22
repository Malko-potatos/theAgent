---
type: Change Log
title: Vault Change Log
description: Append-only log for structural and knowledge updates.
resource: ""
tags: [log/root, wiki/change-log]
timestamp: "2026-06-19T00:00:00+09:00"
layer: Root
status: draft
change_policy: append-only
source_type: log
captured_at: "2026-06-19T00:00:00+09:00"
source_version: initial
derived_from: []
supports: []
aliases: [vault log]
confidence: high
verification:
  last_checked: "2026-06-19"
  method: manual
---

# Vault Change Log

## 2026-06-19

- Initialized Markdown-first LLM wiki structure.
- Added source, normalized, concept, synthesis, agent, quality, and MOC layers.
- Added initial OKF and pydantic-ai-harness source cards.
- Added templates for source cards, concept notes, synthesis notes, and agent runbooks.
- Added local Codex harness contract, policy, operating model, checklists, task/report templates, and run/input/work/output folder guides.
- Merged legacy `Agent.md` guidance into canonical `AGENTS.md`; preserved the original charter under `docs/harness/research-charter.md` and removed the duplicate root file.
- Added Layer 1 source cards for `openai/codex`, `NousResearch/hermes-agent`, `XiaomiMiMo/MiMo-Code`, and `MoonshotAI/kimi-cli`.
- Added CodeGraph/Graphify-assisted layer-analysis automation with script, templates, work folders, and harness guide.
- Installed CodeGraph, cloned four open-source agent repositories under `work/external-repos/`, and generated L01 intent-intake analysis workspaces with CodeGraph discovery outputs.
- Added `P00-agent-loop-orchestrator` as a first-class observation axis for time-ordered agent-loop analysis.
