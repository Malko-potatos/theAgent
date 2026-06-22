---
type: Run Log
title: P00 Loop Contract Spike
description: Handoff note for the first executable TypeScript P00 loop contract implementation.
tags: [run/p00, implementation/typescript, agent-loop]
status: complete
change_policy: append-only
date: 2026-06-19
---

# P00 loop contract spike

## Objective

Start implementation of the P00 loop contract:

```text
run_turn -> agent_loop -> build_context -> run_step -> classify_step
```

## Implementation Scope

- TypeScript + Node.js.
- No dependency installation.
- Fake model provider.
- Fake tool executor.
- In-memory event log.
- Separate verifier.
- Node built-in test runner.

## Files Added

- `docs/design/P00-target-loop-contract.md`
- `package.json`
- `tsconfig.json`
- `src/contracts/*.ts`
- `src/runtime/*.ts`
- `src/harness/*.ts`
- `src/verification/*.ts`
- `src/cli/main.ts`
- `tests/p00-loop.test.ts`

## Verification

- Node test runner: passed, 6 tests.
- Smoke run: passed, fake tool turn completed with verifier evidence `ok: true`.
- Frontmatter validation: passed.
- Internal link validation: passed.
- Incomplete marker scan: passed.
