# Research Charter

이 문서는 이전 루트 `Agent.md`의 원문 보존본이다. 현재 canonical 실행 계약은 [/AGENTS.md](/AGENTS.md)다.

이 문서는 이 레포에서 일하는 에이전트와 사람 연구자가 따라야 할 첫 운영 지침서다. 목적은 특정 오픈소스 코딩 에이전트를 복제하는 것이 아니라, 여러 구현을 비교해 더 단순하고 테스트 가능하며 확장 가능한 agent runtime과 human-facing harness 구조를 찾는 것이다.

기준일: 2026-06-18

## Project Purpose

이 레포는 오픈소스 코딩 에이전트들의 실제 구현을 비교 연구하여, agent runtime, LLM provider adapter, tool execution, permission gate, context management, event streaming, transcript persistence, human-facing harness의 경계를 다시 설계하는 실험 공간이다.

중심 질문은 다음이다.

> 여러 코딩 에이전트 구현을 비교했을 때, agent runtime, LLM provider adapter, tool execution, permission model, context management, event streaming, transcript persistence, human-facing harness는 어디서 분리되어야 하며, 처음부터 다시 설계한다면 더 나은 최소 구조는 무엇인가?

이 레포의 산출물은 처음부터 완성된 제품이 아니라 다음의 누적 결과여야 한다.

- 비교 가능한 연구 노트
- 각 프로젝트의 설계 결정을 분석한 ADR
- 작은 재현 실험
- fake provider와 fake tool로 검증 가능한 runtime prototype
- CLI/TUI/IDE/web harness와 core runtime의 분리 원칙
- 나중에 실제 구현으로 옮길 수 있는 최소 architecture contract

## Research Scope

이 레포에서 연구하는 범위는 coding agent system의 내부 구조와 운영 경계다.

- Agent loop: planning, model call, tool call, result ingestion, stop condition
- LLM provider adapter: model capability, tool-call normalization, streaming normalization, usage/cost metadata
- Message and context representation: provider-neutral message shape, context transform, pruning, compaction, retrieval injection
- Tool system: typed schema, validation, execution lifecycle, result shape, streaming progress, observable side effects
- Permission model: policy resolution, user approval, sandbox boundary, deny/allow/ask modes
- Workspace access: file system, shell, container, remote workspace, git/worktree boundary
- Event model: text delta, thought/reasoning delta when exposed, tool call, tool result, permission request, error, abort, compaction, persistence
- Transcript/session persistence: append-only event log, replay, resume, fork, export, debugging
- Harness: CLI, TUI, IDE extension, web UI, RPC/API server, automation runner
- Testing: deterministic loop tests, fake providers, fake tools, event snapshots, permission matrix, replay tests

Every new research task should make clear whether it is studying runtime, harness, provider adapter, tools, permission, context, transcript, or tests. If a task touches more than one boundary, name the boundary explicitly.

## Non-Goals

This project is not a reimplementation of pi, pi-ai, OpenHands, Aider, Continue, SWE-agent, Cline, Roo Code, Goose, Codex CLI, or any other single project.

Non-goals:

- Do not clone one project architecture wholesale.
- Do not treat pi-ai as the answer. It is the first reference case and a useful comparison baseline.
- Do not build a product-first IDE assistant before the runtime boundary is understood.
- Do not hide tool execution or permission decisions inside UI code.
- Do not let provider-specific message formats leak through the entire runtime.
- Do not rely on live LLM calls for core loop tests.
- Do not couple transcript persistence to a single UI, shell session, or terminal renderer.
- Do not optimize first for maximum features. Optimize first for inspectability, determinism, and clean seams between responsibilities.

## Reference Projects

Use current public source and documentation when analyzing projects. Record the source URLs and the date accessed in each research note.

### Primary Baseline: pi / pi-ai

Reference links:

- https://github.com/earendil-works/pi/tree/main/packages/ai
- https://github.com/earendil-works/pi/tree/main/packages/agent
- https://github.com/earendil-works/pi/tree/main/packages/coding-agent

What to learn:

- `@earendil-works/pi-ai` separates provider/model access from the higher-level coding harness.
- It emphasizes unified model discovery, provider configuration, tool-capable model filtering, token/cost tracking, stream events, context serialization, and cross-provider handoff.
- `@earendil-works/pi-agent-core` exposes a stateful agent with tool execution and event streaming on top of pi-ai.
- The agent readme distinguishes `AgentMessage` from LLM messages and uses `transformContext()` followed by `convertToLlm()`.
- The coding-agent package is a minimal terminal harness with interactive, print/JSON, RPC, and SDK embedding modes.
- Pi deliberately keeps some features out of core, such as built-in sub-agents, plan mode, permission popups, and background bash, preferring extensions or external containment.

What to redesign or challenge:

- A no-permission-popup philosophy may be appropriate for some users, but this repo should model permission as a first-class gate independent of tool execution.
- Extension packages that execute arbitrary code are powerful but should be analyzed against explicit trust, signing, sandboxing, and policy boundaries.
- Runtime events should be treated not only as UI updates but as replayable state transitions.
- Context transform and compaction should be testable units with deterministic fixtures.
- RPC/SDK modes are important harnesses, but the core runtime contract should remain independent of terminal assumptions.

### OpenHands / Software Agent SDK

Reference links:

- https://github.com/OpenHands/OpenHands
- https://github.com/OpenHands/software-agent-sdk
- https://docs.openhands.dev/sdk/arch/overview

What to learn:

- OpenHands now distinguishes UI/application layers from a Software Agent SDK and Agent Server.
- The SDK documentation names agents, LLMs, conversations, tools, workspaces, events, security policies, skills, and context condenser as core concepts.
- It separates `openhands.sdk`, `openhands.tools`, `openhands.workspace`, and `openhands.agent_server`.
- It supports local workspace and sandboxed/remote workspace modes by swapping workspace implementations.
- The Agent Server exposes HTTP/WebSocket surfaces for remote execution and event delivery.

What to redesign or challenge:

- The package split is a strong reference, but this repo should still ask what the smallest useful runtime interface is before adopting a multi-package architecture.
- Security policy and workspace isolation should be explicit contracts rather than incidental server behavior.
- Production agent server design should not force the local SDK loop to become distributed by default.
- Conversation, transcript, and event log should be reconciled: are they three names for one replayable source of truth, or separate projections?

### Aider

Reference links:

- https://github.com/Aider-AI/aider
- https://aider.chat/

What to learn:

- Aider is a terminal-first pair programmer with strong git integration.
- It builds a repo map to help with large codebases.
- It automatically commits changes, supports many languages, can run lint/tests after edits, and can fix issues found by those commands.
- Its ergonomics are built around a git working tree and direct developer review.

What to redesign or challenge:

- Git integration is useful, but core runtime should not assume git exists.
- Auto-commit behavior belongs in a harness or workflow policy, not the agent loop.
- Repo-map construction should be modeled as a context provider/retrieval injection stage with measurable token budget behavior.
- Lint/test feedback should be a tool result or event, not an unstructured side effect.

### Continue

Reference links:

- https://github.com/continuedev/continue
- https://docs.continue.dev/
- https://docs.continue.dev/cli/tool-permissions

What to learn:

- Continue provides CLI, TUI, VS Code, and JetBrains experiences over a shared agent idea.
- Its CLI supports TUI and headless modes, session resume/fork/title, `/compact`, `@` context references, and MCP management.
- Its permission model exposes `allow`, `ask`, and `exclude`, with defaults, flags, persistent `permissions.yaml`, and mode overrides such as readonly/auto.
- Headless mode excludes `ask` tools unless explicitly allowed, which is a useful automation safety principle.

What to redesign or challenge:

- The public docs now state the original `continuedev/continue` repository is read-only after final 2.0.0, so treat it as a design reference rather than an active upstream target.
- Permission matching should be studied carefully, but this repo should define permission resolution as a pure function that can be tested independently from TUI prompts.
- `@` context references should map to explicit context injection events.
- TUI commands should be harness commands, not hidden runtime branches.

### SWE-agent and mini-swe-agent

Reference links:

- https://github.com/SWE-agent/SWE-agent
- https://github.com/SWE-agent/mini-swe-agent
- https://arxiv.org/abs/2405.15793

What to learn:

- SWE-agent foregrounded the Agent-Computer Interface as a major factor in coding-agent performance.
- mini-swe-agent is a valuable counterpoint: a radically simple loop, bash-only actions, linear history, and easy sandbox substitution.
- The mini design treats trajectory and messages as nearly the same object, which is excellent for debugging and fine-tuning.
- Independent `subprocess.run` actions make sandbox swapping easier than a long-lived shell session.

What to redesign or challenge:

- Bash-only is a strong minimal baseline, but this repo should still support typed tools for observability, validation, and permissions.
- Linear history is attractive, but compaction, retrieval, redaction, and provider-specific transforms require explicit derived views.
- Benchmarks can reward scaffold choices that do not fit interactive developer workflows; separate benchmark harness from human-facing harness.
- ACI ideas should become interface contracts, not prompt folklore.

### Cline

Reference links:

- https://github.com/cline/cline
- https://docs.cline.bot/

What to learn:

- Cline presents the same agent engine through SDK, CLI, Kanban, VS Code, and JetBrains surfaces.
- It emphasizes human-in-the-loop approval for file edits, command execution, browsing, and other tools.
- Its README describes diff review, checkpoints, undo, lint/compiler monitoring, and multi-agent Kanban workflows.
- The existence of an SDK plus multiple harnesses is directly relevant to this repo's runtime/harness boundary.

What to redesign or challenge:

- Human approval should be specified as a permission gate protocol, not a UI-specific modal.
- Checkpoints and undo should be derived from event log plus workspace snapshots or git/worktree policy.
- Multi-agent task boards should be studied as harness orchestration first; only promote sub-agent behavior into core when the runtime contract demands it.

### Roo Code

Reference links:

- https://github.com/RooCodeInc/Roo-Code
- https://docs.roocode.com/

What to learn:

- Roo Code is a VS Code-centered coding agent family with modes, role specialization, MCP usage, and editor-integrated workflows.
- It is useful for studying mode design, custom instructions, approval UX, and IDE-specific context.
- It should be compared with Cline because of historical and product-surface overlap.

What to redesign or challenge:

- Modes and roles should not become hard-coded branches in the agent loop. Prefer runtime configuration, system prompt layers, tool sets, and permission profiles.
- IDE context should enter through typed context providers and harness events.
- MCP support should be one tool-source adapter among others, not the only extension model.

### Goose

Reference links:

- https://github.com/aaif-goose/goose
- https://goose-docs.ai/

What to learn:

- Goose is a general-purpose local agent with desktop app, CLI, and API surfaces.
- It is implemented largely in Rust with TypeScript UI components, which is relevant for runtime portability.
- It supports many providers and many extensions through MCP, and participates in ACP-related interoperability.
- It is a useful reference for extension ecosystems and native desktop harness design.

What to redesign or challenge:

- General-purpose extension breadth can obscure the minimal coding-agent runtime. Keep this repo's core contract smaller.
- MCP tools should be normalized into the same typed tool execution and permission model as local tools.
- Provider and extension discovery should be pluggable, observable, and safe under constrained trust.

### Additional Candidates

Consider these after the first milestone set:

- OpenAI Codex CLI: https://github.com/openai/codex
- OpenCode: https://github.com/anomalyco/opencode
- Cursor-like open components, if any become available under a clear OSS license
- Agent Protocol / ACP implementations that expose runtime-harness interoperability

## Comparison Framework

Every project analysis must use the same comparison axes. Do not write free-form impressions until this matrix is filled.

For each project, record:

- Agent loop structure
- LLM provider abstraction
- Message/context representation
- Tool calling 방식
- Tool result 처리
- Permission/sandbox 모델
- File system and shell access 모델
- Context management, pruning, compaction
- Streaming/event model
- Transcript/session persistence
- CLI/TUI/IDE/web harness와 core runtime의 분리
- Configuration and extension model
- Testing strategy
- Failure handling
- Human intervention, steering, approval flow
- Multi-agent 또는 sub-agent 구조가 있다면 그 경계

Use this template for each research note:

```md
# Research Note: <Project>

Date accessed:
Version/commit/tag:
Primary sources:

## Surface Summary

## Architecture Map

## Comparison Matrix

| Axis | Observation | Evidence | Open Question |
| --- | --- | --- | --- |
| Agent loop structure | | | |
| LLM provider abstraction | | | |
| Message/context representation | | | |
| Tool calling 방식 | | | |
| Tool result 처리 | | | |
| Permission/sandbox 모델 | | | |
| File system and shell access 모델 | | | |
| Context management, pruning, compaction | | | |
| Streaming/event model | | | |
| Transcript/session persistence | | | |
| Runtime/harness separation | | | |
| Configuration/extension model | | | |
| Testing strategy | | | |
| Failure handling | | | |
| Human intervention/approval flow | | | |
| Multi-agent/sub-agent boundary | | | |

## What We Learn

## What We Should Redesign

## Implications for This Repo
```

## Core Architecture Questions

Use these questions to drive research and prototypes.

1. What is the smallest provider-neutral message model that can represent user messages, assistant text, tool calls, tool results, images/files, reasoning metadata when available, and errors?
2. Should the agent loop consume a transcript, an event log, a conversation object, or a derived context view?
3. What belongs in the provider adapter versus the runtime?
4. Can all provider-specific streaming formats be normalized into a small event union without losing important information?
5. Where should context compaction happen: before provider conversion, after retrieval injection, or as a transcript-derived checkpoint?
6. Is tool execution part of the agent runtime, or does the runtime only emit requested actions for an executor service?
7. How should permission be modeled so CLI, TUI, web, IDE, and headless automation can share the same policy engine?
8. What is the minimum event log that can replay a session, debug a failure, resume a conversation, and reproduce a test?
9. How do abort, timeout, provider error, validation error, denied permission, and tool failure differ in the event model?
10. How can fake provider scripts and fake tools make the agent loop deterministic?
11. How should multi-agent or sub-agent execution be represented without corrupting a simple single-agent loop?
12. What does the human-facing harness need to know, and what must it never own?

## Agent Runtime vs Harness Boundary

The core runtime should be usable without a terminal, IDE, web UI, or specific process model.

Runtime owns:

- Agent state machine
- Provider-neutral message and event types
- Context transform pipeline
- Provider adapter interface
- Tool registry interface
- Tool call validation
- Permission request emission
- Tool execution orchestration contract
- Event emission
- Transcript append/replay contract
- Abort and timeout semantics
- Deterministic test hooks

Harness owns:

- Human input collection
- Display rendering
- Slash commands and keyboard shortcuts
- Approval prompts
- File picker, IDE symbols, selected text, diagnostics, terminal panes
- Headless flags and automation defaults
- Session list UI, titles, forks, sharing
- Provider credential UX
- Workspace selection and container lifecycle UI

Boundary rule:

- The runtime may emit `PermissionRequested`, but the harness decides how to ask a human.
- The runtime may emit `ContextCompactionRequested` or run a configured compactor, but the harness should not mutate context invisibly.
- The runtime may request a tool execution, but the permission gate and tool executor must be separable.
- The harness may provide context, but it must do so as explicit events or context provider outputs.
- The harness may visualize transcript state, but it must not be the only place session truth exists.

## Provider Adapter Principles

Provider adapters translate between this repo's canonical runtime types and provider-specific APIs. They must not contain the agent loop.

Principles:

- Keep provider adapter and agent loop separate.
- Use capability descriptors: supports tool calling, parallel tool calls, image input, JSON mode, reasoning config, prompt caching, streaming, stop reasons, max context, max output.
- Normalize streaming into canonical runtime events.
- Normalize tool calls into typed `ToolCallRequested` records with stable IDs.
- Normalize usage into provider-neutral token, cache, reasoning, and cost metadata when available.
- Preserve raw provider metadata under a namespaced `provider` field for debugging.
- Make provider adapters stateless where possible.
- Do not let provider SDK objects leak into core state.
- Treat provider retries as adapter policy only when safe; runtime-level retries must be explicit events.
- Provide a fake provider implementation before adding real providers.

Minimum adapter shape to explore:

```ts
interface ProviderAdapter {
  id: string;
  capabilities(model: ModelRef): ModelCapabilities;
  stream(request: ProviderRequest, signal: AbortSignal): AsyncIterable<ProviderEvent>;
  complete?(request: ProviderRequest, signal: AbortSignal): Promise<ProviderMessage>;
  countTokens?(request: ProviderRequest): Promise<TokenEstimate>;
}
```

## Tool Execution and Permission Model

Tools are typed, validated, observable effects. A tool is not just a function.

Tool definition should include:

- Stable name and namespace
- Description for model exposure
- Input schema
- Output schema or structured result contract
- Side-effect classification: read, write, network, shell, process, credential, external service
- Workspace scope
- Timeout behavior
- Streaming progress support
- Idempotency notes
- Risk hints for permission policy

Execution stages:

1. Model requests tool call.
2. Runtime validates tool name and arguments.
3. Runtime emits `ToolCallValidated` or `ToolCallValidationFailed`.
4. Permission engine evaluates policy.
5. If policy is `ask`, runtime emits `PermissionRequested` and waits for harness decision.
6. If allowed, executor emits `ToolExecutionStarted`.
7. Executor streams progress as events if applicable.
8. Executor emits structured result, structured error, timeout, or abort.
9. Runtime appends a tool result message/event.
10. Agent loop decides whether to continue, stop, or ask for human steering.

Permission must be a separate gate from tool execution.

Permission policy should be testable as a pure decision:

```ts
type PermissionDecision =
  | { kind: "allow"; reason: string }
  | { kind: "deny"; reason: string }
  | { kind: "ask"; reason: string; prompt: PermissionPrompt };
```

Do not hide dangerous behavior inside broad tools. For example, a `bash` tool must expose command, working directory, environment changes, timeout, sandbox profile, and expected side effects to the permission gate.

## Context Management and Compaction

Context is not the same as transcript.

Definitions:

- Transcript: durable record of what happened.
- Event log: append-only state transition stream; ideally sufficient to reconstruct transcript and runtime state.
- Context view: selected and transformed subset sent to a provider.
- Compaction: explicit transform that summarizes or restructures older context.
- Retrieval injection: explicit insertion of external information.
- Redaction: explicit removal or masking of sensitive content.

Context pipeline:

1. Start from transcript/event log.
2. Apply policy redaction if needed.
3. Apply message filtering for model compatibility.
4. Inject harness-provided context, such as selected files, diagnostics, or issue text.
5. Inject retrieval results, such as repo map or search hits.
6. Apply pruning or compaction under a named strategy.
7. Convert to provider-specific request via provider adapter.

Rules:

- Every compaction must produce an event.
- Every injected context block must record source, time, and budget.
- Context transforms must be deterministic given the same inputs, except when explicitly using an LLM compactor.
- LLM-based compaction must be tested with fake compactors and reviewed with replay fixtures.
- Never mutate the transcript to fit a provider context window.

## Streaming/Event Model

Streaming is part of the runtime contract, not just terminal output.

Events should cover:

- Session started/ended
- Turn started/ended
- User message appended
- Provider request started
- Provider text delta
- Provider reasoning/thinking delta when exposed and allowed
- Provider tool call delta
- Provider message completed
- Tool call requested
- Tool call validation failed
- Permission requested/resolved
- Tool execution started/progress/completed/failed
- Context transform started/completed
- Compaction started/completed
- Transcript persisted
- Error
- Abort requested/completed

Event design rules:

- Events must have stable IDs, parent IDs where needed, timestamps, and sequence numbers.
- Events must be append-only.
- Events must be serializable.
- Events should be replayable into derived state.
- UI-specific display events should live in harness code, not the core event union.
- Provider raw chunks may be stored as debug metadata, but the canonical event shape should remain provider-neutral.

## Transcript and Session Persistence

All important execution state should be reconstructable from event log or transcript.

Persistence goals:

- Resume a session.
- Fork from a previous turn.
- Debug a provider or tool failure.
- Re-render a UI from events.
- Export training/evaluation trajectories after redaction.
- Re-run deterministic tests against prior sessions.

Minimum persisted objects:

- Session metadata: ID, created time, project root, runtime version, config hash
- Event log: append-only JSONL or equivalent
- Transcript projection: human-readable messages and tool results
- Context snapshots for provider requests, with redaction policy
- Tool execution records: input, decision, result, duration, side effects
- Provider metadata: model, usage, stop reason, raw IDs, cache data if available
- Workspace snapshot pointer when available: git commit, worktree path, container ID, archive, or checksum

Persistence rules:

- Treat transcript as a projection, not necessarily the only source of truth.
- Never store secrets unless a research note explicitly justifies the risk and defines redaction.
- Store permission decisions with enough evidence to audit why a tool ran.
- Make session export separate from local persistence.
- Prefer append-only logs for debuggability; derived indexes can be rebuilt.

## Testing Strategy

The runtime must be deterministic under fake provider and fake tool implementations.

Required test layers:

- Unit tests for provider request conversion.
- Unit tests for provider stream normalization.
- Unit tests for tool argument validation.
- Unit tests for permission policy resolution.
- Agent loop tests with fake provider scripts.
- Tool loop tests with fake tools that return success, structured error, timeout, stream progress, and abort.
- Context transform tests with fixed transcript fixtures.
- Compaction tests with fake compactor and golden outputs.
- Event replay tests that reconstruct state from event logs.
- Harness contract tests for CLI/TUI/headless behavior without real LLM calls.
- Sandbox/workspace tests that verify filesystem boundaries.
- Failure tests for denied permission, invalid tool args, provider interruption, malformed tool call, and partial stream abort.

Testing rule:

- No core runtime behavior is considered implemented if it only passes against a live model.

Useful fake provider pattern:

```ts
const script = [
  { event: "text_delta", text: "I will inspect the file." },
  { event: "tool_call", name: "read_file", args: { path: "package.json" } },
  { event: "stop", reason: "tool_calls" },
  { event: "text_delta", text: "The package file says..." },
  { event: "stop", reason: "end_turn" },
];
```

## Research Notes and ADR Rules

Research notes and ADRs keep this repo from becoming a pile of impressions.

Research notes:

- Put project-specific notes under `docs/research/<project>/<date>-<topic>.md`.
- Include source links, access date, commit/tag when available, and the comparison matrix.
- Separate "What we learn" from "What we should redesign."
- Mark uncertain claims as assumptions.
- Prefer primary sources: official repos, official docs, papers, code files.
- Do not rely on marketing copy when code or docs are available.

ADRs:

- Put decisions under `docs/adr/NNNN-<slug>.md`.
- Use status: proposed, accepted, superseded, rejected.
- Every ADR should include context, decision, consequences, alternatives considered, and references.
- A research note may inform an ADR, but it is not an ADR.
- Do not accept an ADR because one reference project does it. Accept it because it fits this repo's architecture goals and test strategy.

ADR template:

```md
# ADR NNNN: <Decision>

Status:
Date:

## Context

## Decision

## Consequences

## Alternatives Considered

## References
```

## Implementation Principles

Implement slowly enough that the boundaries remain visible.

Architecture bias:

- Separate provider adapter from agent loop.
- Separate agent runtime from human-facing harness.
- Treat tools as typed, validated, observable effects.
- Put permission behind an explicit gate independent of tool execution.
- Make important execution state reconstructable from event log or transcript.
- Treat streaming output, tool call, tool result, error, and abort as observable events.
- Make context transform, compaction, and retrieval injection explicit stages.
- Use fake provider and fake tool implementations to test the agent loop deterministically.
- Treat UI/CLI/TUI/IDE integration as harnesses on top of core runtime.

Design preferences:

- Start with a narrow runtime contract before building many harnesses.
- Prefer explicit data structures over hidden mutable state.
- Prefer append-only records over destructive session mutation.
- Prefer small composable interfaces over large framework objects.
- Prefer pure policy functions where possible.
- Prefer replayability over clever live-only behavior.
- Prefer boring serialization formats during research.
- Prefer one working vertical slice over many abstract interfaces.

Before adding a feature, answer:

- Is this runtime behavior or harness behavior?
- Does this need provider-specific code?
- Is there a deterministic fake-provider test?
- Is there a permission policy implication?
- Does this change transcript or event replay?
- Can the same feature work in CLI, TUI, IDE, and headless modes?
- What project taught us this pattern, and what are we deliberately changing?

## First Research Milestones

### Milestone 1: Baseline Map

Create initial research notes for:

- pi-ai / pi-agent-core / pi-coding-agent
- OpenHands Software Agent SDK
- Aider
- Continue
- SWE-agent and mini-swe-agent
- Cline
- Roo Code
- Goose

Each note must fill the comparison matrix and list open questions.

### Milestone 2: Boundary ADRs

Draft ADRs for:

- Runtime vs harness boundary
- Canonical message and event model
- Provider adapter interface
- Tool definition and execution lifecycle
- Permission gate model
- Transcript/event-log persistence model
- Context transform and compaction pipeline

### Milestone 3: Deterministic Loop Prototype

Build a tiny runtime prototype that can:

- Accept a user message.
- Ask a fake provider for streamed events.
- Validate a fake tool call.
- Run permission policy.
- Execute a fake tool.
- Append events.
- Continue the loop after tool result.
- Replay the event log into session state.

This prototype should not require real provider credentials.

### Milestone 4: Minimal Harness

Build one minimal harness after the runtime prototype:

- CLI or headless runner first.
- No IDE integration yet.
- Show event stream.
- Ask for permission using the shared permission protocol.
- Persist session JSONL.
- Resume from event log.

### Milestone 5: Comparative Re-evaluation

Revisit the first reference projects after the prototype exists.

Ask:

- Which project designs became simpler in our model?
- Which design pressures did we underestimate?
- Which abstractions are too broad?
- Which harness requirements should feed back into runtime contracts?
- Which tests caught design flaws?

Only after this milestone should the repo consider broader UX work, IDE integration, multi-agent orchestration, or remote agent server design.
