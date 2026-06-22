---
type: Run Log
title: Code Analysis Automation Setup
description: Execution record for adding CodeGraph/Graphify-assisted 12-layer analysis automation.
tags: [run/code-analysis-automation, harness/state, research/layers]
status: executor-verified
change_policy: append-only
---

# Code Analysis Automation Setup

## Objective

Add repeatable automation for 12-layer coding-agent analysis using CodeGraph and Graphify as discovery tools.

## Files Added

- `scripts/analyze-layer.sh`
- `scripts/README.md`
- `docs/harness/code-analysis-automation.md`
- `templates/layer-analysis.md`
- `templates/repo-analysis-run.md`
- `docs/research/layers/README.md`
- `work/external-repos/README.md`
- `work/analysis/README.md`
- `.graphifyignore`

## Files Updated

- `AGENTS.md`
- `README.md`
- `index.md`
- `log.md`

## Tool Availability

- `graphify`: installed at `/Users/potablepotato/.local/bin/graphify`
- `codegraph`: not found on PATH during setup

## Verification Evidence

- Shell syntax: `bash -n scripts/analyze-layer.sh`
- Help output: `scripts/analyze-layer.sh --help`
- Dry run: `scripts/analyze-layer.sh . L01 --skip-codegraph --skip-graphify`
- P00 dry run: `scripts/analyze-layer.sh . P00 --skip-codegraph --skip-graphify`
- YAML frontmatter: `frontmatter ok`
- Internal links: `internal links ok`
- Sub-agent review: completed; P1/P2/P3 findings triaged and applied.

## Design Decision

The automation script does not clone repositories, install tools, or modify external services. It creates intermediate outputs under `work/analysis/` and run logs under `runs/`. Graph outputs are discovery aids only; final evidence must cite actual source files, symbols, source cards, or official upstream URLs.

## Pending Review

Sub-agent self-critical review completed. Applied fixes for symlink escape prevention, source index side-effect documentation, real candidate file generation, fuller run logs, L01-L12 definitions/default queries, richer templates, and tool-version capture.

## P00 Addition

Added `P00-agent-loop-orchestrator` as a first-class observation axis for time-ordered agent-loop analysis. This axis is supported by `scripts/analyze-layer.sh`, [docs/harness/code-analysis-automation.md](/docs/harness/code-analysis-automation.md), [templates/layer-analysis.md](/templates/layer-analysis.md), and [docs/research/layers/P00-agent-loop-orchestrator.md](/docs/research/layers/P00-agent-loop-orchestrator.md).
