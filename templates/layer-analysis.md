---
type: Layer Analysis Template
title: Layer Analysis
description: Template for one architecture layer across multiple coding-agent projects.
tags: [template/layer-analysis, research/layers]
status: draft
change_policy: curated
---

# <Axis or Layer ID> <axis-or-layer-name>

## Metadata

- Date:
- Analyst:
- Source cards:
- Repositories:
- Access dates:
- Commit SHAs:

## Layer Definition

- 역할:
- 포함되는 것:
- 제외되는 것:
- 헷갈리기 쉬운 경계:

## Axis Note

- If this is `P00-agent-loop-orchestrator`, treat it as a time-ordered observation axis, not a component layer.
- P00 should identify how L01-L12 are composed during a turn, where the loop starts/stops, and where trajectory events are appended.

## Analysis Method

- Search terms:
- Files to inspect:
- Evidence rules:
- Confidence levels:

## Cross-Project Matrix

| Project | Candidate Files / Modules | Confirmed Behavior | Interpretation | Evidence | Confidence | Open Questions |
| --- | --- | --- | --- | --- | --- | --- |
| openai/codex | | | | | | |
| NousResearch/hermes-agent | | | | | | |
| XiaomiMiMo/MiMo-Code | | | | | | |
| MoonshotAI/kimi-cli | | | | | | |
| pydantic/pydantic-ai-harness | optional | optional | optional | optional | optional | optional |
| wquguru/harness-books | optional | optional | optional | optional | optional | optional |

## AGENTS Comparison Axes Touched

- Agent loop:
- LLM provider abstraction:
- Message/context representation:
- Tool calling:
- Permission/sandbox:
- Context management:
- Streaming/event model:
- Transcript/session persistence:
- Runtime/harness separation:

## Common Patterns

## Differences

## Boundary Notes

- P00 vs L01-L12:
- This layer vs adjacent lower layer:
- This layer vs adjacent higher layer:
- This layer vs surface/UI:

## Next Layer Prep

- Files to inspect next:
- Repo-specific next questions:
