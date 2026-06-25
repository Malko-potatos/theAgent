---
type: Research Note
title: OpenCode Model Switching
project: opencode
topic: model-switching
status: draft
access_date: 2026-06-25
source_commit: dc569b5a5f461e75a93ba3c642d8bc9cec027c1d
scope:
  - P00-agent-loop-orchestrator
  - L03-model-client
  - L08-trajectory
  - L10-config-governance
  - L12-surface
change_policy: curated
---

# OpenCode Model Switching

## Research question

OpenCode에서 여러 모델 간 사용 전환이 어디에 존재하는지 확인한다.

- 대화 중 모델 전환.
- 기존 대화의 다음 턴에 모델이 바뀌는 방식.
- 각 모델의 특성, 옵션, variant 관리.

이 노트는 OpenCode를 복제하기 위한 문서가 아니라, 이 repo의 provider-neutral runtime / harness / trajectory 설계에 반영할 경계만 뽑기 위한 연구 기록이다.

## Sources

- OpenCode docs, Models: <https://opencode.ai/docs/models/> (accessed 2026-06-25).
- OpenCode docs, TUI: <https://opencode.ai/docs/tui/> (accessed 2026-06-25).
- OpenCode docs, Agents: <https://opencode.ai/docs/agents/> (accessed 2026-06-25).
- OpenCode docs, Providers: <https://opencode.ai/docs/providers/> (accessed 2026-06-25).
- `anomalyco/opencode` source, commit `dc569b5a5f461e75a93ba3c642d8bc9cec027c1d` (branch `dev`, accessed 2026-06-25):
  - <https://github.com/anomalyco/opencode/blob/dc569b5a5f461e75a93ba3c642d8bc9cec027c1d/packages/schema/src/model.ts>
  - <https://github.com/anomalyco/opencode/blob/dc569b5a5f461e75a93ba3c642d8bc9cec027c1d/packages/core/src/config/provider.ts>
  - <https://github.com/anomalyco/opencode/blob/dc569b5a5f461e75a93ba3c642d8bc9cec027c1d/packages/core/src/session.ts>
  - <https://github.com/anomalyco/opencode/blob/dc569b5a5f461e75a93ba3c642d8bc9cec027c1d/packages/core/src/session/sql.ts>
  - <https://github.com/anomalyco/opencode/blob/dc569b5a5f461e75a93ba3c642d8bc9cec027c1d/packages/core/src/session/projector.ts>
  - <https://github.com/anomalyco/opencode/blob/dc569b5a5f461e75a93ba3c642d8bc9cec027c1d/packages/core/src/session/runner/model.ts>
  - <https://github.com/anomalyco/opencode/blob/dc569b5a5f461e75a93ba3c642d8bc9cec027c1d/packages/core/src/session/runner/llm.ts>
  - <https://github.com/anomalyco/opencode/blob/dc569b5a5f461e75a93ba3c642d8bc9cec027c1d/packages/tui/src/context/local.tsx>
  - <https://github.com/anomalyco/opencode/blob/dc569b5a5f461e75a93ba3c642d8bc9cec027c1d/packages/tui/src/component/dialog-model.tsx>
  - <https://github.com/anomalyco/opencode/blob/dc569b5a5f461e75a93ba3c642d8bc9cec027c1d/packages/tui/src/component/dialog-variant.tsx>
  - <https://github.com/anomalyco/opencode/blob/dc569b5a5f461e75a93ba3c642d8bc9cec027c1d/packages/tui/src/component/prompt/index.tsx>

## Comparison matrix

| Axis | Confirmed OpenCode behavior |
| --- | --- |
| Agent loop structure | Runner reads the current session at turn start, selects agent, resolves model, builds LLM request, streams provider events, and loops for tool continuations or pending queued input. |
| LLM provider abstraction | Model resolution goes through a catalog model plus credential/integration lookup, then converts to OpenAI Responses, Anthropic Messages, or OpenAI-compatible chat routes. Unsupported API types fail as a model-resolution error. |
| Message/context representation | Context is built from session history entries. Prompt admission is separate from model resolution; the model is part of session/step metadata rather than prompt text. |
| Tool calling 방식 | Model capability and provider route determine whether tools can be sent. Agent permissions still control materialized tool definitions. |
| Tool result 처리 | Not the focus of this note. Relevant point: tool continuations reuse the session's current model resolution at each provider turn. |
| Permission/sandbox 모델 | Not directly coupled to model selection. Agent-specific permissions can override global permissions, separate from agent-specific model override. |
| File system and shell access 모델 | Not directly coupled to model selection. Shell prompt path still attaches the currently selected model in the TUI client path. |
| Context management, pruning, compaction | Compaction receives the resolved model and request, so model limits influence compaction decisions. |
| Streaming/event model | Assistant step publication includes the resolved model ref. A model switch is a durable session event in the v2 core path, not only a UI preference. |
| Transcript/session persistence | Session rows persist `model` as JSON `{ id, providerID, variant? }`. `ModelSwitched` projects into that row; step events record model metadata for audit. |
| Runtime/harness separation | TUI owns local selection UX, recent/favorite lists, and keybinds. Core owns session model state, model resolution, and provider route creation. |
| Configuration/extension model | Models come from provider catalog/config, Models.dev, provider plugins, per-model config, variants, and agent model override. |
| Testing strategy | Source exposes explicit error types for no model, unavailable model, unavailable variant, and unsupported API. This is testable without a live provider if catalog and credentials are faked. |
| Failure handling | `ModelNotSelectedError`, `ModelUnavailableError`, `VariantUnavailableError`, and `UnsupportedApiError` are distinct in `SessionRunnerModel`. |
| Human intervention, steering, approval flow | User can select models via `/models` and keybinds, cycle recent/favorite models, and cycle variants. API description says model switching affects subsequent provider turns. |
| Multi-agent or sub-agent boundary | Agent config can override the model. Primary agents use global/current model if unspecified; subagents inherit the primary agent model unless configured otherwise. |

## Confirmed from source

### 1. Model identity is a small ref

`Model.Ref` is `{ id, providerID, variant? }`. This is the portable identity used for session model state and switch events. `Model.Info` is richer: provider id, family, name, API route, capabilities, request defaults, variants, release time, cost, status, enabled flag, and token limits.

Implication: OpenCode separates "which model is selected" from "what this model can do". The selected session state only needs the ref; the catalog supplies capabilities and request details at execution time.

### 2. Model selection is durable session state, not just display state

The session table stores `model` as JSON with `id`, `providerID`, and optional `variant`. `session.create` can initialize this field. In the v2 path, `session.switchModel` emits `SessionEvent.ModelSwitched`; the projector updates the session row's `model` and `time_updated`.

The HTTP API describes `session.switchModel` as switching the model used by subsequent provider turns.

Implication: the clean runtime contract is an explicit `ModelSwitched` or `ModelSelected` event that changes future turns. It should not be hidden inside the TUI.

### 3. Running provider turns resolve the model from current session state

At provider turn start, the runner:

1. loads the session,
2. selects the agent,
3. initializes or prepares system context,
4. resolves the model from `session.model`,
5. builds the LLM request and compaction checks with that resolved model,
6. publishes assistant-step events with the model ref.

If `session.model` is absent, resolution falls back through catalog default or the first supported model. If present but unavailable, it fails with `ModelUnavailableError`. If a variant is explicitly selected but not available, it fails with `VariantUnavailableError`.

Implication: OpenCode does not need a separate "next model" slot in the runner. The next provider turn just observes the projected session state.

### 4. TUI local state is a harness concern

The TUI keeps local model UX state:

- current model per current agent,
- recent models,
- favorite models,
- selected variant per `providerID/modelID`,
- persisted local state in `model.json`,
- fallback order from CLI `--model`, config `model`, recents, provider default, then first provider model.

The model dialog sets `local.model`. Variant dialog sets `local.model.variant`. Default keybinds include model list, recent/favorite cycling, and variant cycling. Docs expose `/models`; TUI docs show model list keybind through the leader key; local config maps `variant_cycle` to `ctrl+t`.

Implication: recent/favorite/cycle is surface preference, not runtime truth. Runtime truth starts when a session is created, switched, or a prompt submission records model intent.

### 5. Existing conversation next-turn switch is supported, but not as in-flight hot-swap

The clearest v2 contract is `POST /api/session/:sessionID/model`, which updates the session model for subsequent provider turns. The runner resolves the model at the start of a provider turn, so an already-running stream should continue with the model already resolved for that turn.

The TUI prompt component also reads `local.model.current()` and `local.model.variant.current()` at submit time. For a new session, it passes the model ref to session creation. For command and prompt submission, the TUI client attaches the selected model/variant to the send path. The v2 `Prompt` schema itself contains prompt text/files/agents, not model fields, so the durable v2 design should be read as: model choice is session/turn state, not prompt content.

Implication: "대화 중 모델 전환" should mean "change the model used by the next provider turn", not "replace the model behind an active streaming response".

### 6. Model traits are managed by catalog/config/variant layers

Docs and schema show several trait layers:

- provider-level credentials and options,
- model-level options such as OpenAI reasoning effort or Anthropic thinking budget,
- `capabilities.tools`, `capabilities.input`, `capabilities.output`,
- token limits for context/input/output,
- cost tiers and cache cost,
- status such as alpha/beta/deprecated/active,
- request defaults with headers/body,
- variants that merge extra headers/body into the model request,
- agent-level model override for task-specific model choice.

OpenCode variants are practical "same model, different request profile" entries. Built-in examples include reasoning effort and thinking-token variants; custom variants can override or disable entries.

## What we learn

OpenCode's model switching is a three-layer design:

1. Harness preference: TUI current/recent/favorite/variant selection.
2. Durable session state: the selected model ref projected into the session.
3. Execution resolution: runner resolves that ref against provider catalog, credentials, variants, and supported protocol route at provider-turn start.

This is a good boundary because UI affordances can change without changing the agent loop, while the loop remains replayable from session events and catalog snapshots.

The design also keeps model traits out of the transcript. A transcript or message can record which model was used, but the canonical behavior comes from explicit session events plus catalog/config state.

## What we should redesign for this repo

- Define `ModelRef = { providerID, modelID, variantID? }` as a small runtime value.
- Define a durable `ModelSwitched` event with timestamp, session ID, optional turn/input boundary, and previous/next model refs.
- Do not treat model switching as prompt text. It is control-plane state.
- Record assistant step model metadata for audit, but do not make assistant-message metadata the source of truth for the next turn.
- Keep TUI recent/favorite/cycle state in harness-local storage. It can propose a model, but the runtime must receive an explicit event/input to use it.
- Resolve model traits at turn start from a catalog snapshot: capabilities, limits, cost, request defaults, provider route, and variant merge.
- Expose distinct resolution failures: no model selected, model unavailable, variant unavailable, unsupported provider API, missing credentials.
- Make compaction/token budgeting consume the resolved model's limits, not a hardcoded default.

## Open questions and assumptions

- The public source currently contains v2 session APIs and older TUI/client paths side by side. The v2 contract is clear about `switchModel`; the current TUI prompt path also attaches selected model/variant on submit. A follow-up runtime trace would be needed to confirm which HTTP path the released TUI uses in every mode.
- I did not run OpenCode locally or call live providers. This note is based on official docs and source inspection only.
- The source was inspected at branch `dev` commit `dc569b5a5f461e75a93ba3c642d8bc9cec027c1d`; model/provider docs can change quickly as new models are added.

