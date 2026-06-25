---
type: Layer Analysis
title: L01 Intent Intake
description: Cross-project source-backed notes on how raw user input becomes a normalized request, command, message, or task.
tags: [research/layers, layer/l01, intent-intake, prompt, slash-command, input-normalization]
status: draft
change_policy: curated
derived_from:
  - docs/research/layers/P00-agent-loop-orchestrator.md
  - runs/2026-06-19-openai__codex-L01-intent-intake.md
  - runs/2026-06-19-moonshotai__kimi-cli-L01-intent-intake.md
  - runs/2026-06-19-xiaomimimo__mimo-code-L01-intent-intake.md
  - runs/2026-06-19-nousresearch__hermes-agent-L01-intent-intake.md
  - runs/2026-06-19-theagent-L01-intent-intake.md
---

# L01 intent-intake

## Metadata

- Date: 2026-06-25
- Analyst: Codex
- Source cards:
  - `01_sources/open-source/github/openai__codex/2026-06-19/source-card.md`
  - `01_sources/open-source/github/moonshotai__kimi-cli/2026-06-19/source-card.md`
  - `01_sources/open-source/github/xiaomimimo__mimo-code/2026-06-19/source-card.md`
  - `01_sources/open-source/github/nousresearch__hermes-agent/2026-06-19/source-card.md`
- Local source snapshots:
  - openai/codex: `70a6aa2634adedaabf66a66f11c16e869c1c7d1e`
  - MoonshotAI/kimi-cli: `eca4334a42dc8c680be0602de41368e7d9f53fc7`
  - XiaomiMiMo/MiMo-Code: `3edb90454a7d0f02844463c7b409595edfafba46`
  - NousResearch/hermes-agent: `28d887ca18fdb52e352f5d9b61c9edf455e92a50`
  - theAgent: current workspace state on 2026-06-25

## Layer Definition

- Role: normalize raw human or client input into a runtime-understandable request, command, message, steer, shell command, task, or multimodal prompt part.
- Includes: CLI args, TUI composer text, ACP/API prompt blocks, slash command parsing, shell mode routing, attachment/reference expansion, command template expansion, per-turn model/agent selection hints when they are part of intake.
- Excludes: model-context assembly after input is accepted (L02), provider request conversion (L03), tool-call schema validation (L04), tool execution (L05), permission decision (L06), transcript persistence (L08), and rendering (L12).
- Confusing boundary: a slash command can be local UI control, a runtime command that creates a prompt, or an agent-visible prompt. L01 must classify the input before P00 starts or continues a turn.

## Analysis Method

- Search terms: `intent`, `intake`, `prompt`, `input`, `command`, `slash`, `router`, `parse`, `message`, `session start`, `user`.
- Discovery outputs:
  - `work/analysis/openai__codex/L01-intent-intake/`
  - `work/analysis/moonshotai__kimi-cli/L01-intent-intake/`
  - `work/analysis/xiaomimimo__mimo-code/L01-intent-intake/`
  - `work/analysis/nousresearch__hermes-agent/L01-intent-intake/`
  - `work/analysis/theagent/L01-intent-intake/`
- Evidence rule: generated candidate files and CodeGraph results are discovery aids only. Confirmed behavior below cites actual source files and line ranges.

## Cross-Project Matrix

| Project | Candidate Files / Modules | Confirmed Behavior | Interpretation | Evidence | Confidence | Open Questions |
| --- | --- | --- | --- | --- | --- | --- |
| openai/codex | `sdk/python/src/openai_codex/_inputs.py`; `sdk/python/src/openai_codex/api.py`; `codex-rs/app-server/src/request_processors/turn_processor.rs`; TUI composer and slash dispatch modules | SDK input accepts text, remote image, local image, skill, and mention items. A raw string becomes `TextInput`; input items become wire JSON. `Thread.turn()` converts normalized input into `TurnStartParams`. The app-server validates input size, maps v2 input items to core input items, resolves cwd/environment/settings, then submits `Op::UserInput` to the thread. | Codex keeps rich input types outside the provider loop. L01 spans SDK/client conversion and app-server request normalization before core P00 consumes `Op::UserInput`. | `_inputs.py:8-73`; `api.py:540-606`; `turn_processor.rs:386-483`. | high | TUI composer slash-command preparation has rich behavior, but this pass only used it as supporting context. Later L12/L01 work should map composer result variants to `turn/start`. |
| MoonshotAI/kimi-cli | `src/kimi_cli/ui/shell/__init__.py`; `src/kimi_cli/soul/kimisoul.py`; `src/kimi_cli/acp/session.py`; `src/kimi_cli/ui/shell/slash.py` | Interactive shell routes shell-mode input to shell execution, classifies local commands, distinguishes shell-level slash commands from soul-level slash commands, and sends ordinary text/content to `run_soul_command`. `KimiSoul.run()` emits `UserPromptSubmit` hook data, starts `TurnBegin`, builds a user message, and handles soul-level slash commands before `_turn()`. ACP prompt blocks are converted to content parts and streamed through the same CLI runner. | Kimi has a strong two-stage L01: shell/UI intake first, then soul/runtime turn intake. It explicitly prevents local commands and shell commands from leaking into agent turns. | `ui/shell/__init__.py:620-681`; `kimisoul.py:577-646`; `acp/session.py:155-164`. | high | Need inspect `parse_slash_command_call` and `classify_input` in a later pass to specify the command grammar contract. |
| XiaomiMiMo/MiMo-Code | `packages/opencode/src/session/prompt.ts`; `packages/opencode/src/acp/agent.ts`; `packages/opencode/src/cli/cmd/tui/component/prompt/index.tsx` | ACP prompt blocks are converted into text/file/resource parts, then leading slash text is split into command name and args. Non-command input calls `session.prompt`; known commands call `session.command`. Core `SessionPrompt.command` expands command templates, resolves agents/models, turns subagent commands into `subtask` parts, and finally calls `prompt`. Core `createUserMessage` resolves file/resource/agent parts into saved message parts and synthetic context text. | MiMo/OpenCode treats intake as structured prompt-part construction, not just message text. Commands are control-plane entries that may synthesize a prompt, subtask, or file context before P00 loops. | `acp/agent.ts:1300-1448`; `session/prompt.ts:1309-1673`; `session/prompt.ts:3082-3254`. | high | Need map the TUI prompt submit path to server routes to confirm the current released path for slash commands and attachments. |
| NousResearch/hermes-agent | `cli.py`; `hermes_cli/commands.py`; gateway command modules | CLI process loop strips leaked terminal control wrappers, detects file/image drops, intercepts slash commands, expands paste references, previews user messages, and only then calls `chat()`. `chat()` resolves agent/model route, handles native/text image attachment mode, expands `@` context references, sanitizes text, appends the user message, and calls `run_conversation()`. Slash commands have a central `CommandDef` registry and alias resolution; gateway helpers decide whether commands bypass active-session queuing. | Hermes puts a large amount of L01 policy in the CLI surface. It is powerful but mixes input cleanup, routing, attachment expansion, and command policy close to UI code. | `cli.py:13648-13760`; `cli.py:10687-10962`; `cli.py:14473-14593`; `hermes_cli/commands.py:47-61`, `258-391`. | high | Need separate gateway L01 from CLI L01; the gateway has command bypass rules that may matter more for multi-client runtime design. |
| theAgent | `src/cli/main.ts`; `src/runtime/run-turn.ts`; `src/contracts/turn.ts` | Current local harness joins CLI args into one string, builds a fake model tool-call input from that same text, and calls `runTurn({ content })`. `TurnInput` is currently only `{ content: string; receivedAt?: string }`; `runTurn` converts it directly into a user message and emits `TurnStarted`. | The local prototype intentionally has minimal L01. The next richer layer cycle should add an explicit input item or intent envelope before adding real attachments, slash commands, or subagents. | `src/cli/main.ts:5-33`; `src/runtime/run-turn.ts:21-43`; `src/contracts/turn.ts:4-23`. | high | Decide whether the first extension is `UserInputItem[]`, an `IntentRequest` union, or a harness-local command router feeding the existing turn input. |

## Confirmed Patterns

### 1. Raw Text Is Only One Input Kind

OpenAI Codex and MiMo/OpenCode both accept structured input items before a model call: text, images, local files/resources, skills, mentions, or prompt parts. Hermes and Kimi also route images, pasted content, shell-mode text, and command text before the agent loop sees a user message.

Design implication: this repo should not let `TurnInput.content: string` become the long-term runtime contract. It is fine for the fake-provider vertical slice, but L01 needs a normalized item list before L02 and L08 grow.

### 2. Slash Commands Must Be Classified Before The Turn Loop

Kimi intercepts shell-level and soul-level slash commands before ordinary text reaches the soul. MiMo/OpenCode turns recognized slash commands into `session.command`, where templates, subagents, and model/agent overrides are resolved. Hermes uses a central command registry and bypass rules so active-session commands are not silently queued as prompts.

Design implication: slash command text must not be persisted as an ordinary user message until L01 decides whether it is:

- local harness command,
- runtime control command,
- prompt-template command,
- subagent/task command,
- or literal text.

### 3. Intake Can Attach Control Metadata Without Owning The Loop

`Thread.turn()` in Codex includes approval, cwd, model, sandbox, service tier, and output schema in `TurnStartParams`. MiMo/OpenCode command intake resolves model and agent metadata. Hermes resolves turn agent config before `run_conversation()`.

Design implication: L01 may attach metadata to the normalized turn request, but P00 still owns loop sequencing and L03/L05/L06 own provider/tool/approval details.

### 4. Surface Cleanup Is Not Runtime Truth

Hermes strips leaked terminal control wrappers, expands paste references, detects file drops, and previews submitted messages in the CLI. Kimi shell routing also keeps prompt-session details near UI. These are important surface behaviors, but they should produce explicit normalized input records instead of becoming hidden runtime behavior.

Design implication: the runtime should receive a small, explicit `NormalizedTurnInput` or `IntentEnvelope`, not raw terminal state.

## Boundary Notes

- L01 vs P00: L01 ends when the turn request is normalized and accepted. P00 begins when the runtime starts/continues the turn.
- L01 vs L02: L01 may expand a file reference into an input part, but choosing the final model-facing context budget belongs to L02.
- L01 vs L04: parsing slash command syntax is L01; validating model-requested tool-call schemas is L04.
- L01 vs L05: shell-mode user input may be classified in L01, but actually running a shell command belongs to L05 and L06.
- L01 vs L08: L01 should emit or hand off enough structured input data for L08 to record what was submitted and how it was classified.
- L01 vs L12: composer key handling and popup rendering are L12; the resulting command/prompt classification is L01.

## Target Contract For This Repo

Initial contract candidate:

```ts
type UserInputItem =
  | { type: "text"; text: string }
  | { type: "file"; path: string; mime?: string; source: "local" | "resource" }
  | { type: "image"; path?: string; url?: string; mime?: string }
  | { type: "mention"; name: string; path: string }
  | { type: "skill"; name: string; path: string };

type IntakeKind =
  | "turn_prompt"
  | "slash_command"
  | "shell_command"
  | "steer"
  | "subagent_task"
  | "local_harness_command";

type NormalizedIntent = {
  id: string;
  sessionId: string;
  kind: IntakeKind;
  items: UserInputItem[];
  rawText?: string;
  command?: { name: string; args: string; source: "builtin" | "skill" | "plugin" };
  metadata?: {
    cwd?: string;
    modelRef?: string;
    agent?: string;
    approvalProfile?: string;
    sandboxProfile?: string;
  };
};
```

Rules:

- Preserve raw text separately from normalized items.
- Persist the classification result as evidence before the loop consumes it.
- Do not let local UI commands become ordinary model-visible text by accident.
- Keep command template expansion explicit and replayable.
- Keep attachment materialization separate from final L02 context budgeting.

## Next Layer Prep

- Continue layer circulation with `L02-active-context.md` before implementing the richer L01 contract.
- For L02, inspect how each repo turns accepted input plus session history into provider-facing messages.
- Carry forward these L01 questions:
  - Which normalized input items are model-visible immediately?
  - Which items need a materialization step before L02?
  - Which commands mutate session state without starting a model turn?
  - Which commands synthesize a prompt and should be replayable in L08?
