---
type: Harness Guide
title: Code Analysis Automation
description: Standard workflow for using CodeGraph and Graphify before 12-layer coding-agent architecture analysis.
tags: [harness/automation, research/layers, codegraph, graphify]
status: draft
change_policy: curated
---

# Code Analysis Automation

This guide defines how to use CodeGraph and Graphify as discovery accelerators for the P00 observation-axis and 12-layer coding-agent analysis.

## Principle

Graph tools help find candidate files and relationships. They are not final evidence.

Final research notes must cite actual source files, symbols, source cards, or official upstream URLs.

## Folder Contract

- External checkouts: `work/external-repos/<owner>__<repo>/`
- Tool outputs: `work/analysis/<owner>__<repo>/<layer>/`
- Run logs: `runs/YYYY-MM-DD-<owner>__<repo>-<layer>.md`
- Final research notes: `docs/research/layers/<layer>.md`

Do not put graph outputs in `outputs/`. They are intermediate work.

## Recommended Tool Order

1. `rg`: cheap text scan that produces candidate file lists.
2. CodeGraph: code symbol graph, call edges, imports, callers, callees, impact.
3. Graphify: code plus docs, AGENTS files, markdown, PDFs, and semantic connections.
4. Manual source inspection: confirm exact files and behavior before writing final notes.

## Setup Expectations

The automation script does not install tools or clone repositories.

CodeGraph may create or update `.codegraph/` inside the analyzed checkout. By default, the script permits this only for checkouts under `work/external-repos/`. Use `--allow-source-index-state` only after explicit approval.

Graphify queries are run only when `graphify-out/graph.json` already exists in the analyzed checkout. Building that graph is a separate action because it may be expensive and may use model APIs depending on file types and backend.

Install tools only after explicit approval when needed:

```bash
npm install -g @colbymchenry/codegraph
uv tool install graphifyy
```

Keep Graphify assistant integration disabled until explicitly requested. Project installs may modify `AGENTS.md` or hook files.

## Main Command

```bash
scripts/analyze-layer.sh <owner/repo|repo-path> <layer-id> --source-path work/external-repos/<owner>__<repo>
```

Example:

```bash
scripts/analyze-layer.sh openai/codex P00 --source-path work/external-repos/openai__codex
scripts/analyze-layer.sh openai/codex L01 --source-path work/external-repos/openai__codex
```

## P00 Observation Axis

`P00-agent-loop-orchestrator` is not a component layer. It is the time-ordered observation axis that shows how the layers are composed during one or more agent turns.

Analyze P00 before L01-L12 when the question is "if we build an agent from scratch, what is the runtime skeleton?"

Default questions:

- Where is the main agent loop, turn loop, or orchestration state machine implemented?
- How does one user turn move through context building, model streaming, tool execution, approval, persistence, and stop conditions?
- Where are abort, retry, resume, fork, replay, or event append handled?

## L01 Default Questions

- Where does raw user input enter the system and become a normalized request, command, message, or task?
- Which CLI prompt, command router, slash command parser, or message normalization files handle input?
- Where does session start hand off user input to context assembly or model request creation?

## Evidence Rule

Use three confidence levels:

- `high`: direct source file or official documentation confirms behavior.
- `medium`: graph output identifies candidates and partial source inspection supports the interpretation.
- `low`: graph output or naming suggests a candidate, but source inspection is incomplete.

Do not promote `low` findings into `Confirmed Behavior`.

Generated files:

- `queries.md`: default questions for the layer.
- `candidate-files.md`: ranked candidate files from local `rg` matching.
- `rg-matches.txt`: raw text matches.
- `codegraph-results.txt`: CodeGraph output when available and allowed.
- `graphify-results.txt`: Graphify query output when an existing graph is present.
- `layer-draft.md`: local draft for human or agent review.

## Review Rule

For each layer:

1. Start with `P00-agent-loop-orchestrator` when the goal is runtime design from scratch.
2. Run the automation script for each target repo.
3. Inspect `work/analysis/.../candidate-files.md`.
4. Inspect `work/analysis/.../queries.md` and `rg-matches.txt`.
5. Read the exact source files named by `rg`, CodeGraph, or Graphify.
6. Fill `docs/research/layers/<layer>.md`.
7. Apply the review checklist from [checklists.md](checklists.md).

When validating this repo's own Markdown, exclude `work/external-repos/`. Cloned upstream repositories may contain fixtures, generated docs, broken example links, or frontmatter samples that are not governed by this repo.

## Stop Conditions

Stop and ask before:

- Cloning external repositories.
- Installing CodeGraph, Graphify, or language dependencies.
- Running graph tools against paths outside this repo root.
- Running tool commands that mutate external services.
