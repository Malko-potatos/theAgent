---
type: Index
title: theAgent Knowledge Vault README
description: GitHub-facing entrypoint for the Markdown-first LLM wiki.
resource: ""
tags: [index/readme, wiki/entrypoint]
timestamp: "2026-06-19T00:00:00+09:00"
layer: Root
status: draft
change_policy: curated
source_type: index
captured_at: "2026-06-19T00:00:00+09:00"
source_version: initial
derived_from:
  - /index.md
supports: []
aliases: [README]
confidence: high
verification:
  last_checked: "2026-06-19"
  method: manual
---

# theAgent Knowledge Vault

This repository is a Markdown-first LLM wiki for studying coding agent systems.

Start with:

- [AGENTS.md](AGENTS.md): local Codex harness contract.
- [index.md](index.md): vault entrypoint.
- [docs/harness/research-charter.md](docs/harness/research-charter.md): original project purpose and research scope.
- [90_moc/MOC-LLM-Wiki.md](90_moc/MOC-LLM-Wiki.md): human-facing map.
- [05_agent/index.md](05_agent/index.md): agent-facing read order.
- [docs/harness/](docs/harness/): operating model, policy, strategy, and checklists.
- [docs/harness/code-analysis-automation.md](docs/harness/code-analysis-automation.md): CodeGraph/Graphify-assisted P00 and layer analysis workflow.
- [docs/design/P00-target-loop-contract.md](docs/design/P00-target-loop-contract.md): first executable loop contract.
- [src/](src/README.md): TypeScript runtime, contracts, harness, verification, and CLI code.

Knowledge layers:

- [01_sources/](01_sources/index.md): immutable source cards.
- [02_normalized/](02_normalized/index.md): normalized source summaries.
- [03_concepts/](03_concepts/index.md): concept wiki.
- [04_synthesis/](04_synthesis/index.md): comparisons, decisions, and briefs.
- [05_agent/](05_agent/index.md): runbooks and indexes for agents.
- [06_quality/](06_quality/index.md): verification logs.
- [inputs/](inputs/README.md): original task inputs.
- [work/](work/README.md): intermediate work.
- [outputs/](outputs/README.md): final deliverables.
- [runs/](runs/README.md): run logs and recovery notes.
- [templates/](templates/): reusable task and report templates.
- [scripts/analyze-layer.sh](scripts/analyze-layer.sh): create repeatable layer-analysis workspaces.

Runtime spike:

```text
npm test
npm run smoke
```

The first implementation uses Node's TypeScript type stripping and installs no dependencies.
