---
type: Research Index
title: 12-Layer Research Index
description: Entry point for coding-agent 12-layer architecture analysis.
tags: [research/layers, index]
status: draft
change_policy: curated
---

# 12-Layer Research Index

Use this folder for cross-project layer and observation-axis analysis.

## Observation Axis

- [P00-agent-loop-orchestrator.md](P00-agent-loop-orchestrator.md): time-ordered runtime skeleton that composes the layers across one or more turns. It covers turn/session start, context build, model call, tool-call cycle, approval, persistence, stop condition, abort, retry, resume, fork, and replay touchpoints.
- [P00-agent-loop-evaluation.md](P00-agent-loop-evaluation.md): evaluation pass that asks which loop patterns should be reused when building a better AI-operable coding agent from scratch.

P00 is not a layer. It is the first analysis axis when the research question is "if we build a coding agent from scratch, what loop should exist?"

## Layers

- [L01-intent-intake.md](L01-intent-intake.md): normalize user input into a system-understandable request, command, message, or task.
- `L02-active-context.md`: assemble the model-facing context from rules, skills, recent conversation, memory, and retrieval.
- `L03-model-client.md`: communicate with LLM providers, including auth, retries, streaming, and provider adapters.
- `L04-action-grammar.md`: validate model-requested actions, tool calls, command syntax, and schemas.
- [L05-tool-harness.md](L05-tool-harness.md): execute tools, manage side effects, sandboxing, timeouts, and result capture.
- `L06-approval-policy.md`: decide when risky actions need approval and route the approval decision.
- `L07-observation-ir.md`: convert model/tool results into UI-friendly observations, events, and display blocks.
- [L08-trajectory.md](L08-trajectory.md): persist sessions, transcripts, event logs, checkpoints, and replayable views.
- `L09-verification.md`: audit tests, builds, architecture rules, and completion claims across layers.
- `L10-config-governance.md`: provide settings, policies, credentials, permissions, and snapshots safely.
- `L11-extensibility.md`: connect skills, plugins, hooks, MCP servers, and subagents.
- `L12-surface.md`: render TUI, web, daemon, IDE, terminal, and theme surfaces.

Start with P00 as the primary pilot, then analyze L08 trajectory and the remaining layers. Use [templates/layer-analysis.md](/templates/layer-analysis.md).
