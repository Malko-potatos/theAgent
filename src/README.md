---
type: Folder Guide
title: Source Code
description: Product code for the local agent runtime, contracts, harness adapters, verification, and CLI.
tags: [folder/src, code, agent-runtime]
status: draft
change_policy: curated
---

# Source Code

Use this folder for actual product code.

Initial ownership map:

```text
src/
  contracts/      canonical TypeScript contracts and schemas
  runtime/        run_turn, agent_loop, run_step, classify_step
  harness/        fake provider, fake tools, in-memory logs, adapters
  trajectory/     replay readers and projection builders
  verification/   independent checks for reports, events, and loop outcomes
  cli/            command-line entrypoints and surface adapters
```

Rules:

- Keep `src/` code separate from `outputs/`.
- Keep runtime contracts stable and testable.
- Do not put research notes or final reports here.
- Prefer fake provider and fake tool tests before real model or external tool integration.
- Record non-trivial implementation runs under `runs/`.

Current commands:

```text
npm test
npm run smoke
```

The current spike uses Node's built-in TypeScript type stripping and does not require dependency installation.
