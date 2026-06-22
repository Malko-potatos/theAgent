---
type: Run Log
title: P00 Across Four Repos
description: Execution record for the P00 agent-loop-orchestrator pilot across four coding-agent repositories.
tags: [run/p00, research/layers, topic/agent-loop]
status: executor-verified
change_policy: append-only
---

# P00 Across Four Repos

## Objective

Start the coding-agent architecture analysis with P00 `agent-loop-orchestrator`, an observation axis for finding the time-ordered runtime loop before analyzing L01-L12 one by one.

## Repositories

- `openai/codex` at `70a6aa2634adedaabf66a66f11c16e869c1c7d1e`
- `NousResearch/hermes-agent` at `28d887ca18fdb52e352f5d9b61c9edf455e92a50`
- `XiaomiMiMo/MiMo-Code` at `3edb90454a7d0f02844463c7b409595edfafba46`
- `MoonshotAI/kimi-cli` at `eca4334a42dc8c680be0602de41368e7d9f53fc7`

## Automation Runs

- `scripts/analyze-layer.sh openai/codex P00 --source-path work/external-repos/openai__codex --skip-graphify`
- `scripts/analyze-layer.sh NousResearch/hermes-agent P00 --source-path work/external-repos/nousresearch__hermes-agent --skip-graphify`
- `scripts/analyze-layer.sh XiaomiMiMo/MiMo-Code P00 --source-path work/external-repos/xiaomimimo__mimo-code --skip-graphify`
- `scripts/analyze-layer.sh MoonshotAI/kimi-cli P00 --source-path work/external-repos/moonshotai__kimi-cli --skip-graphify`

## Primary Outputs

- `docs/research/layers/P00-agent-loop-orchestrator.md`
- `work/analysis/openai__codex/P00-agent-loop-orchestrator/`
- `work/analysis/nousresearch__hermes-agent/P00-agent-loop-orchestrator/`
- `work/analysis/xiaomimimo__mimo-code/P00-agent-loop-orchestrator/`
- `work/analysis/moonshotai__kimi-cli/P00-agent-loop-orchestrator/`

## Confirmed Core Loop Candidates

- openai/codex: `codex-rs/core/src/session/turn.rs::run_turn`.
- NousResearch/hermes-agent: `agent/conversation_loop.py::run_conversation`.
- XiaomiMiMo/MiMo-Code: `packages/opencode/src/session/prompt.ts` run loop plus `packages/opencode/src/session/processor.ts`.
- MoonshotAI/kimi-cli: `src/kimi_cli/soul/kimisoul.py::_agent_loop` plus `_step`.

## Evidence Rule Applied

CodeGraph, Graphify, and ripgrep outputs were used only for candidate discovery. The final P00 matrix cites source cards and direct source-file line ranges.

## Handoff

- Next recommended analysis: L01 `intent-intake`, using the P00 entrypoints to avoid starting from random CLI files.
- Secondary next analysis: L08 `trajectory`, because P00 exposed each repo's turn/session event boundary.
- Open mapping gap: for openai/codex and MiMo-Code, trace surface API routes to the core loop in more detail.
