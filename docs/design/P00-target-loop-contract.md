---
type: Design Contract
title: P00 Target Loop Contract
description: Target contract for the first executable agent loop vertical slice.
tags: [design/p00, agent-loop, runtime-contract, typescript]
status: draft
change_policy: curated
derived_from:
  - docs/research/layers/P00-agent-loop-evaluation.md
  - outputs/p00-agent-loop-evaluation-brief.md
---

# P00 target loop contract

## Purpose

This document fixes the first executable contract for the local agent runtime.

The goal is not to build a full coding agent yet. The goal is to prove that the core loop can be represented as a small, testable, AI-operable contract:

```text
run_turn -> agent_loop -> build_context -> run_step -> classify_step
```

## Product Premise

- AI agents perform coding work.
- Humans supervise through contracts, state diagrams, event logs, verification evidence, and final reports.
- The loop must be observable and replayable enough that a later verifier can inspect what happened without trusting the loop's own final claim.

## State Decisions

The first loop recognizes these decisions:

```text
continue | approval | overflow | retry | final | failed
```

Meanings:

| Decision | Meaning | First Slice Behavior |
| --- | --- | --- |
| `continue` | The loop should continue to another step. | Usually after a safe tool call completes. |
| `approval` | A requested action needs human approval before execution. | Emit `PermissionRequested` and stop in `waiting_for_approval`. |
| `overflow` | Context is too large or must be rebuilt. | Emit `ContextOverflow` and return an overflow report. |
| `retry` | The step should be retried under policy. | Retry until `maxRetries`, then fail. |
| `final` | The assistant produced a final answer. | Emit `TurnCompleted`. |
| `failed` | The loop cannot continue safely. | Emit `TurnFailed`. |

## Runtime Responsibilities

Runtime owns:

- turn state
- context construction
- one-step model execution
- step classification
- tool execution orchestration
- permission request emission
- event emission
- deterministic fake-provider tests

Runtime does not own:

- UI rendering
- human approval UX
- live provider credentials
- real shell/network side effects
- final human review

## Event Evidence

Every run must emit an append-only event list. The minimum first-slice events are:

```text
TurnStarted
StepStarted
ModelStepCompleted
ToolCallRequested
PermissionRequested
ToolCompleted
ContextOverflow
RetryRequested
TurnCompleted
TurnInterrupted
TurnFailed
```

The event log is the bridge between code and human supervision.

## Verification Boundary

Verification is separate from execution.

The runtime returns a `TurnReport`, but a verifier must inspect it from the outside. The first verifier checks:

- a turn has a start event
- a turn has a terminal event
- tool calls are either completed or paused for permission
- final reports include a final message
- failed reports include a reason

## First Vertical Slice

The first executable slice uses:

- fake model provider
- fake tool executor
- in-memory event log
- Node test runner
- TypeScript files executed by Node's type stripping

No live model, shell execution, network execution, or external service mutation is allowed in this slice.

## Acceptance Criteria

- A final-only fake model turn completes.
- A fake tool call can execute and continue to final.
- An approval-required tool call stops with `waiting_for_approval`.
- The verifier runs outside the loop and passes/fails from event evidence.
- The implementation does not require dependency installation.
