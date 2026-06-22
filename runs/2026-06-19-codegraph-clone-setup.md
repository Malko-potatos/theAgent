---
type: Run Log
title: CodeGraph Install And Repository Clone Setup
description: Execution record for installing CodeGraph, cloning target repositories, and generating L01 analysis workspaces.
tags: [run/codegraph, run/repo-clone, research/layers]
status: executor-verified
change_policy: append-only
---

# CodeGraph Install And Repository Clone Setup

## Objective

Install CodeGraph, clone the four current coding-agent reference repositories, and generate L01 `intent-intake` analysis workspaces.

## Installed Tools

- CodeGraph: `1.0.1`
- Graphify: `0.8.13` already available at `/Users/potablepotato/.local/bin/graphify`

## Cloned Repositories

| Repository | Local Path | Commit |
| --- | --- | --- |
| openai/codex | `work/external-repos/openai__codex` | `70a6aa2634adedaabf66a66f11c16e869c1c7d1e` |
| NousResearch/hermes-agent | `work/external-repos/nousresearch__hermes-agent` | `28d887ca18fdb52e352f5d9b61c9edf455e92a50` |
| XiaomiMiMo/MiMo-Code | `work/external-repos/xiaomimimo__mimo-code` | `3edb90454a7d0f02844463c7b409595edfafba46` |
| MoonshotAI/kimi-cli | `work/external-repos/moonshotai__kimi-cli` | `eca4334a42dc8c680be0602de41368e7d9f53fc7` |

## Commands

```bash
npm install -g @colbymchenry/codegraph
git clone --depth 1 https://github.com/openai/codex work/external-repos/openai__codex
git clone --depth 1 https://github.com/NousResearch/hermes-agent work/external-repos/nousresearch__hermes-agent
git clone --depth 1 https://github.com/XiaomiMiMo/MiMo-Code work/external-repos/xiaomimimo__mimo-code
git clone --depth 1 https://github.com/MoonshotAI/kimi-cli work/external-repos/moonshotai__kimi-cli
scripts/analyze-layer.sh openai/codex L01 --source-path work/external-repos/openai__codex --skip-graphify
scripts/analyze-layer.sh NousResearch/hermes-agent L01 --source-path work/external-repos/nousresearch__hermes-agent --skip-graphify
scripts/analyze-layer.sh XiaomiMiMo/MiMo-Code L01 --source-path work/external-repos/xiaomimimo__mimo-code --skip-graphify
scripts/analyze-layer.sh MoonshotAI/kimi-cli L01 --source-path work/external-repos/moonshotai__kimi-cli --skip-graphify
```

## Generated L01 Workspaces

- `work/analysis/openai__codex/L01-intent-intake/`
- `work/analysis/nousresearch__hermes-agent/L01-intent-intake/`
- `work/analysis/xiaomimimo__mimo-code/L01-intent-intake/`
- `work/analysis/moonshotai__kimi-cli/L01-intent-intake/`

## Notes

- Graphify was skipped for this run because `graphify-out/graph.json` was not built for the cloned repositories.
- CodeGraph created `.codegraph/` state inside each checkout under `work/external-repos/`.
- External checkouts are ignored in the parent repo via `.gitignore`; `work/external-repos/README.md` remains trackable.

## Verification Evidence

- CodeGraph version: `1.0.1`
- L01 workspaces exist for all four repositories.
- CodeGraph result files exist for all four repositories.
- Script syntax: `bash -n scripts/analyze-layer.sh`
- Repo-owned frontmatter check: `frontmatter ok (external repos excluded)`
- Repo-owned internal links check: `internal links ok (external repos excluded)`

## Validation Scope Note

Full Markdown validation across `work/external-repos/` is intentionally not used. Cloned upstream repositories include fixtures and documentation links outside this repo's governance.
