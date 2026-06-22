---
type: Research Note
title: P00 Agent Loop Orchestrator
description: Observation-axis note for the time-ordered coding-agent loop across open-source references.
tags: [research/layers, axis/p00, topic/agent-loop, topic/orchestrator]
status: draft
change_policy: curated
---

# P00 agent-loop-orchestrator

## Metadata

- Date: 2026-06-19
- Analyst: Codex
- Scope: four-repo pilot for the first architecture observation axis.
- Source cards:
  - `01_sources/open-source/github/openai__codex/2026-06-19/source-card.md`
  - `01_sources/open-source/github/nousresearch__hermes-agent/2026-06-19/source-card.md`
  - `01_sources/open-source/github/xiaomimimo__mimo-code/2026-06-19/source-card.md`
  - `01_sources/open-source/github/moonshotai__kimi-cli/2026-06-19/source-card.md`
- Local source snapshots:
  - `work/external-repos/openai__codex` at `70a6aa2634adedaabf66a66f11c16e869c1c7d1e`
  - `work/external-repos/nousresearch__hermes-agent` at `28d887ca18fdb52e352f5d9b61c9edf455e92a50`
  - `work/external-repos/xiaomimimo__mimo-code` at `3edb90454a7d0f02844463c7b409595edfafba46`
  - `work/external-repos/moonshotai__kimi-cli` at `eca4334a42dc8c680be0602de41368e7d9f53fc7`

## Axis Definition

- 역할: agent runtime의 시간 순서 뼈대를 식별한다.
- 포함되는 것: turn/session start, loop/state machine, context build trigger, model call, tool-call cycle, approval handoff, tool execution handoff, trajectory append, stop condition, abort, retry, resume, fork, replay.
- 제외되는 것: 개별 layer 내부 구현 세부. 예를 들어 model provider adapter 자체는 L03, tool executor 자체는 L05, UI rendering은 L12로 보낸다.
- L01-L12와의 관계: P00는 레이어가 아니라 관찰 축이다. L01-L12가 한 turn 안에서 어떤 순서와 event 경계로 조립되는지 본다.

## Analysis Method

- Search terms:
  - agent loop, orchestrator, orchestration, turn, run loop, state machine
  - model call, tool call, stop condition, abort, resume, retry, event append
- Files to inspect:
  - CLI/TUI/API entrypoint에서 runtime loop로 들어가는 경로
  - model stream 이후 tool loop를 반복하는 core module
  - session/event/trajectory append 위치
  - abort/retry/resume/fork 처리 위치
- Evidence rules:
  - CodeGraph/Graphify/rg output은 후보 발견 자료다.
  - Confirmed Behavior에는 실제 source file, symbol, source card, official URL로 확인한 사실만 쓴다.
  - Codex의 해석은 Interpretation에만 쓴다.
  - 표면 루프와 core loop가 분리된 경우, 표면 루프는 Candidate 또는 Boundary로 기록하고 core P00는 별도 확인한다.
- Confidence levels:
  - high: source file 또는 official docs가 behavior를 직접 확인한다.
  - medium: 후보 파일과 일부 source reading이 일치하지만 loop 전체 확인은 남아 있다.
  - low: 이름/graph output만으로 추정한 후보.

## Cross-Project Matrix

| Project | Candidate Files / Modules | Confirmed Behavior | Interpretation | Evidence | Confidence | Open Questions |
| --- | --- | --- | --- | --- | --- | --- |
| openai/codex | `codex-rs/core/src/session/turn.rs`; `codex-rs/core/src/session/mod.rs`; `sdk/python/src/openai_codex/api.py`; `codex-rs/app-server/src/request_processors/thread_processor.rs` | Python SDK `Thread.run()` starts a turn, opens the stream, and collects the final result. `Thread.turn()` normalizes run input, builds `TurnStartParams`, and calls `turn_start`. Rust `run_turn()` records context updates, builds skills/plugins, runs hooks, loops over pending input, builds sampling requests, calls `run_sampling_request()`, handles follow-up/compaction/stop hooks, and breaks only when the turn no longer needs follow-up. `run_sampling_request()` builds tool runtime and retries stream errors. `try_run_sampling_request()` opens the model stream and consumes response events. | Core P00 is `codex-rs/core/src/session/turn.rs::run_turn`. SDK/app-server APIs are entry/control surfaces. The loop composes at least L02 context, L03 model stream, L05 tool runtime, L06 approval-adjacent state, L08 rollout/turn events, and stop-hook control. | Source card: `01_sources/open-source/github/openai__codex/2026-06-19/source-card.md`. SDK entry: `work/external-repos/openai__codex/sdk/python/src/openai_codex/api.py:540-606`. Core loop: `work/external-repos/openai__codex/codex-rs/core/src/session/turn.rs:140-390`. Retry/tool runtime: `work/external-repos/openai__codex/codex-rs/core/src/session/turn.rs:1080-1165`. Stream receive loop: `work/external-repos/openai__codex/codex-rs/core/src/session/turn.rs:1890-1980`. | high | App-server `turn/start` routing to core `Op` should be mapped in a later pass. P00 already identifies the core turn loop, but the exact JSON-RPC request processor path needs tighter line evidence. |
| NousResearch/hermes-agent | `agent/conversation_loop.py`; `run_agent.py`; `cli.py`; `agent/turn_context.py`; `agent/turn_retry_state.py` | `run_agent.AIAgent.run_conversation()` is a forwarder to `agent.conversation_loop.run_conversation()`. That function declares it runs a complete conversation with tool calling until completion, calls `build_turn_context()` for once-per-turn setup, then enters a max-iteration/budget while loop. Inside the loop it handles interrupts, step callbacks, steer draining, message/tool-call normalization, API request middleware, retry/fallback/error recovery, tool-call validation, tool execution, context compression, and either continues after tools or exits on final no-tool response. | P00 is centralized and explicit. `agent.conversation_loop.run_conversation()` is the primary loop, while `agent/turn_context.py` is L02/L01-adjacent prologue support and `cli.py` is surface entry/observation. Hermes is a useful contrast case because it keeps a very large amount of loop policy in one Python function. | Source card: `01_sources/open-source/github/nousresearch__hermes-agent/2026-06-19/source-card.md`. Forwarder: `work/external-repos/nousresearch__hermes-agent/run_agent.py:5227-5248`. Turn setup and loop: `work/external-repos/nousresearch__hermes-agent/agent/conversation_loop.py:469-563`. API retry loop: `work/external-repos/nousresearch__hermes-agent/agent/conversation_loop.py:900-1065`. Tool-call validation/execution/continue: `work/external-repos/nousresearch__hermes-agent/agent/conversation_loop.py:3700-4075`. Error recovery/compression: `work/external-repos/nousresearch__hermes-agent/agent/conversation_loop.py:2140-2310`, `3030-3140`. | high | Need a later split between persistent trajectory/session DB logic and loop logic. Current pass confirms P00 but does not fully map L08. |
| XiaomiMiMo/MiMo-Code | `packages/opencode/src/session/prompt.ts`; `packages/opencode/src/session/processor.ts`; `packages/opencode/src/session/classify.ts`; `packages/opencode/src/cli/cmd/run.ts`; `packages/opencode/src/acp/agent.ts` | CLI `run` command builds/continues/forks a session, subscribes to events, starts a local or attached server client, calls `session.prompt()` or `session.command()`, and observes streamed events. The internal `SessionPrompt` service exposes `prompt`, `loop`, `shell`, and `command`, holds `SessionProcessor.Service`, and its `while (true)` loop loads the compacted message slice, classifies existing assistant state, creates a new assistant message, resolves tools, calls `processor.create()`, then calls `handle.process()` or max-mode processing. The processor drains `llm.stream()` events, retries with `SessionRetry.policy`, cleans up, and returns `overflow`, `stop`, or `continue`. `classifyAssistantStep()` forces continue when client tool parts or unfinished assistant state require another loop. | P00 is split across command surface, session prompt loop, and stream processor. The core loop appears to be `session/prompt.ts` around `while (true)`, with `session/processor.ts` as one-step model/tool stream executor. CLI `run.ts` is primarily a surface/event-observation loop, not the core runtime loop. | Source card: `01_sources/open-source/github/xiaomimimo__mimo-code/2026-06-19/source-card.md`. CLI surface: `work/external-repos/xiaomimimo__mimo-code/packages/opencode/src/cli/cmd/run.ts:280-692`. SessionPrompt service deps: `work/external-repos/xiaomimimo__mimo-code/packages/opencode/src/session/prompt.ts:180-230`. Core loop: `work/external-repos/xiaomimimo__mimo-code/packages/opencode/src/session/prompt.ts:2180-2310`, `2580-2740`, `2860-2990`. Processor: `work/external-repos/xiaomimimo__mimo-code/packages/opencode/src/session/processor.ts:675-740`. Classification: `work/external-repos/xiaomimimo__mimo-code/packages/opencode/src/session/classify.ts:36-72`. | high | Need map API route from `sdk.session.prompt()` to `SessionPrompt.prompt()` and compare `prompt`, `loop`, `shell`, `command` entry variants. |
| MoonshotAI/kimi-cli | `src/kimi_cli/soul/kimisoul.py`; `src/kimi_cli/app.py`; `src/kimi_cli/acp/session.py`; `src/kimi_cli/ui/shell/__init__.py`; `src/kimi_cli/wire/types.py` | `KimiCLI.run()` runs without UI, starts `run_soul()`, consumes wire messages, and bridges approval requests. ACP `Session.prompt()` converts ACP content to user input and iterates over `self._cli.run(...)`, translating `TurnBegin`, `StepBegin`, text, tool, approval, and terminal messages to ACP updates. `KimiSoul.run()` refreshes runtime/session state, triggers `UserPromptSubmit`, emits `TurnBegin`, handles slash commands or calls `_turn()`, then emits `TurnEnd`. `_turn()` appends the user message and calls `_agent_loop()`. `_agent_loop()` is explicitly documented as the main agent loop, clears stale steers, loads MCP, loops steps until stop/failure/max-steps, emits `StepBegin`, compacts context, checkpoints, calls `_step()`, consumes steers, and returns `TurnOutcome`. `_step()` runs `kosong.step()` with retry, streams message/tool events, waits for tool results, grows context, returns `None` when tool calls require continuation, and returns stop when no tool calls remain. | P00 is explicit and layered: `KimiCLI.run()` and ACP/session are surface/wire adapters; `KimiSoul.run()` is turn boundary; `_agent_loop()` is the core loop; `_step()` is the one-step LLM/tool executor. This repo gives the cleanest names for P00 sub-states. | Source card: `01_sources/open-source/github/moonshotai__kimi-cli/2026-06-19/source-card.md`. KimiCLI no-UI runner: `work/external-repos/moonshotai__kimi-cli/src/kimi_cli/app.py:532-680`. ACP adapter: `work/external-repos/moonshotai__kimi-cli/src/kimi_cli/acp/session.py:155-248`. Turn boundary: `work/external-repos/moonshotai__kimi-cli/src/kimi_cli/soul/kimisoul.py:577-730`. Core loop: `work/external-repos/moonshotai__kimi-cli/src/kimi_cli/soul/kimisoul.py:814-1000`. Step executor: `work/external-repos/moonshotai__kimi-cli/src/kimi_cli/soul/kimisoul.py:1001-1220`. | high | Need later map wire persistence (`wire.jsonl`, `context.jsonl`) to L08 and shell input routing to L01/L12. |

## Common Patterns

- P00 usually has at least two loops: a surface/event loop that displays or transports events, and a core turn/step loop that decides whether the model should be called again.
- The core loop is driven by assistant outcome classification: tool calls, pending input/steer, overflow/compaction, retryable errors, guardrail/approval state, and final no-tool response.
- Tool execution is not the end of a turn. In all four repos, tool results feed another model step unless the loop hits a guardrail, max iteration, interruption, or final response path.
- Context governance is cross-cutting inside P00. Compaction/pruning/checkpoint logic is not purely L02 because loop continuation depends on it.
- Streaming/event systems are observation and persistence boundaries. They often expose P00 state to surfaces, but they are not always the core loop.

## Differences

- openai/codex places the core turn loop in Rust and exposes turn control through SDK/app-server APIs.
- Hermes centralizes the loop in one large Python function, which makes P00 easy to locate but mixes adjacent layer policies in one place.
- MiMo-Code splits P00 between `SessionPrompt` orchestration and `SessionProcessor` one-step stream handling. The CLI loop is mostly observational.
- Kimi CLI names the axis directly: `KimiSoul._agent_loop()` and `_step()` separate turn orchestration from one LLM/tool step.
- Retry and recovery style differs: OpenAI Codex retries response streams in `run_sampling_request`; Hermes has extensive inline provider/fallback/compression recovery; MiMo delegates retry to Effect policies; Kimi uses tenacity around `kosong.step()`.

## Boundary Notes

- P00 vs L01: L01 is raw input normalization; P00 observes where normalized input enters a turn loop. Example: OpenAI SDK `_normalize_run_input()` is L01-adjacent; Rust `run_turn()` is P00.
- P00 vs L02: L02 builds model-facing context; P00 observes when and why that build is invoked.
- P00 vs L03: L03 owns model client details; P00 observes model-call placement in the loop.
- P00 vs L04/L05/L06: these own action validation, tool execution, and approval; P00 observes their sequence and retry/continue semantics.
- P00 vs L08: L08 owns persistence format; P00 observes when events are appended and read back.
- P00 vs L12: L12 renders interaction; P00 observes how the surface enters or observes the loop.

## Next Layer Prep

- L01 intent-intake에서 이어서 볼 파일:
  - openai/codex: `sdk/python/src/openai_codex/api.py`, protocol `TurnStartParams`, app-server request processor.
  - Hermes: `cli.py` single-query/interactive input routing, `agent/turn_context.py`.
  - MiMo-Code: `packages/opencode/src/cli/cmd/run.ts`, `packages/opencode/src/session/prompt.ts` entry variants, SDK route for `session.prompt`.
  - Kimi CLI: `src/kimi_cli/app.py`, `src/kimi_cli/ui/shell/__init__.py`, `src/kimi_cli/acp/session.py`, `KimiSoul.run()`.
- L08 trajectory에서 이어서 볼 파일:
  - openai/codex: rollout/turn event persistence around `record_conversation_items`, `persist_rollout_items`, and app-server turns list.
  - Hermes: session DB persistence and `_persist_session`.
  - MiMo-Code: session message/part storage, event bus, checkpoint and compaction records.
  - Kimi CLI: `wire.jsonl`, `context.jsonl`, session fork/replay utilities.
- 각 repo별 다음 질문:
  - What is the replayable source of truth for one turn?
  - Is the loop driven by transcript state, event log state, UI state, or provider stream state?
  - Which loop state is durable after interruption, and which state is only in-memory?
