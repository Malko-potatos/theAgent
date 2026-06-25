---
type: Layer Analysis
title: L05 Tool Harness
description: Cross-project source-backed notes on shell tool execution, platform shell selection, permissions, sandboxing, timeout, and result capture.
tags: [research/layers, layer/l05, tool-harness, shell, windows, permissions]
status: draft
change_policy: curated
---

# L05 Tool Harness

## Metadata

- Date: 2026-06-24
- Analyst: Codex
- Source cards:
  - `01_sources/open-source/github/openai__codex/2026-06-19/source-card.md`
  - `01_sources/open-source/github/moonshotai__kimi-cli/2026-06-19/source-card.md`
  - `01_sources/open-source/github/xiaomimimo__mimo-code/2026-06-19/source-card.md`
  - `01_sources/open-source/github/nousresearch__hermes-agent/2026-06-19/source-card.md`
  - `01_sources/open-source/github/wquguru__harness-books/2026-06-19/source-card.md`
- Local checkout SHAs:
  - openai/codex: `70a6aa2634adedaabf66a66f11c16e869c1c7d1e`
  - MoonshotAI/kimi-cli: `eca4334a42dc8c680be0602de41368e7d9f53fc7`
  - XiaomiMiMo/MiMo-Code: `3edb90454a7d0f02844463c7b409595edfafba46`
  - NousResearch/hermes-agent: `28d887ca18fdb52e352f5d9b61c9edf455e92a50`
- Access dates: source cards captured 2026-06-19; local source inspected 2026-06-24.

## Layer Definition

- Role: execute validated tool requests with observable side effects, permission gates, sandbox attempts, timeout/abort handling, and structured results.
- Includes: shell/process execution, platform shell selection, command parsing for safety, approval handoff, sandbox transform, output capture, timeout and cancellation.
- Excludes: model loop continuation policy (P00), provider adapter message conversion (L03), and durable event ledger design (L08), except as emitted evidence.
- Confusing boundary: a model-facing tool can be named `bash` while the real executor uses PowerShell, cmd, Git Bash, zsh, sh, Docker, SSH, or another backend. The runtime contract must not assume the display name is the executable.

## Immediate Question

What happens when a `bash`-like tool is used on Windows where `bash` is unavailable?

The reviewed sources show three distinct strategies:

1. Platform shell abstraction: choose PowerShell/cmd on Windows and keep `bash` only as a legacy hook/display name.
2. Bundled or required Git Bash: require a POSIX shell on Windows and fail early with an installation hint when unavailable.
3. Backend abstraction: make shell execution run through a selected local/remote/container backend, with environment-specific requirements.

## Cross-Project Matrix

| Project | Candidate Files / Modules | Confirmed Behavior | Interpretation | Evidence | Confidence | Open Questions |
| --- | --- | --- | --- | --- | --- | --- |
| openai/codex | `codex-rs/shell-command/src/shell_detect.rs`; `codex-rs/core/src/shell.rs`; `codex-rs/core/src/tools/handlers/shell/shell_command.rs`; `codex-rs/core/src/tools/runtimes/shell.rs`; `codex-rs/core/src/tools/orchestrator.rs`; `codex-rs/shell-command/src/command_safety/windows_safe_commands.rs` | Shell detection models `zsh`, `bash`, `powershell`, `sh`, and `cmd`. On Windows, default user shell resolves to PowerShell and ultimate fallback is `cmd.exe`. Shell exec args differ by shell type: POSIX shells use `-c`/`-lc`, PowerShell uses `-Command`, and cmd uses `/c`. The shell handler builds exec params from `session.user_shell()`, while approval/hook payloads may still use a `bash` label. Windows safety parsing accepts only conservative PowerShell wrappers for auto-approval. | Best evidence for this repo: separate model-facing shell tool identity from the executable selected by environment capabilities. A Windows machine without bash should not be treated as an exceptional product state if PowerShell/cmd is an accepted shell capability. | `shell_detect.rs:6-13`, `199-246`, `271-294`; `shell.rs:20-49`; `shell_command.rs:81-95`, `194-208`, `223-227`; `shell.rs` runtime `242-299`; `windows_safe_commands.rs:6-17`, `143-207`. | high | Need map exact user-facing event names for command-not-found vs sandbox-denied vs approval-denied. |
| MoonshotAI/kimi-cli | `src/kimi_cli/utils/environment.py`; `src/kimi_cli/tools/shell/__init__.py`; `src/kimi_cli/tools/shell/bash.md`; `src/kimi_cli/soul/approval.py` | On Windows, environment detection explicitly searches for Git Bash and raises `GitBashNotFoundError` if it cannot find `bash.exe`. The error text says Windows requires Git for Windows because the Shell tool runs through bash, not PowerShell. The Shell tool executes `environment.shell_path -c <command>` and requests approval before foreground or background execution. | This is the strict POSIX-shell strategy. It is acceptable only if the product contract says Git Bash is required and failure is surfaced at environment detection/setup time, not as an obscure spawn error mid-turn. | `environment.py:15-28`, `55-80`, `88-131`; `tools/shell/__init__.py:60-78`, `90-142`, `236-241`, `263-264`; `bash.md:1-6`, `27-35`; `approval.py:151-193`, `205-260`. | high | Need inspect startup path to see whether `GitBashNotFoundError` blocks app launch, tool registration, or first shell call. |
| XiaomiMiMo/MiMo-Code | `packages/opencode/src/shell/shell.ts`; `packages/opencode/src/tool/bash.ts`; `packages/opencode/src/permission/index.ts`; `packages/opencode/src/config/permission.ts` | The tool is still named `bash`, but a TODO says it may need renaming for other shells. On Windows, shell selection prefers `pwsh.exe`, then `powershell.exe`, then Git Bash, then `COMSPEC`/`cmd.exe`. The bash tool loads both bash and PowerShell tree-sitter parsers, special-cases PowerShell command execution with `-NoLogo -NoProfile -NonInteractive -Command`, and routes parsed command/path patterns through permission asks. Permission rules are `allow`, `deny`, or `ask`, with `ask` producing pending requests and non-interactive asks failing cleanly. | Strong hybrid strategy: keep a familiar `bash` tool API but implement shell capability detection, PowerShell-aware parsing, and permission pattern extraction. The naming is misleading unless the UI/tool descriptor exposes actual OS and shell. | `shell.ts:56-90`, `93-108`; `bash.ts:28-29`, `280-307`, `309-325`, `328-357`, `617-647`, `680-691`; `permission/index.ts:20-56`, `184-223`, `261-317`; `config/permission.ts:6-18`, `33-52`. | high | Need inspect failure handling when selected shell is `cmd.exe` but parser still receives commands not expressible in cmd semantics. |
| NousResearch/hermes-agent | `README.md`; `tools/code_execution_tool.py`; source card | README states the Windows installer bundles portable Git Bash and uses it to run shell commands. README also describes six terminal backends: local, Docker, SSH, Singularity, Modal, and Daytona. Code comments treat terminal backend portability as a reason to prefer typed tools over shelling out for some workflows. | Hermes reinforces two lessons: package required shell capabilities when you depend on them, and avoid shell-only designs when typed tools can be more portable across execution backends. | `README.md:23-28`, `48-52`; source card `Confirmed Facts` and `Agent Operation Signals`; `tools/kanban_tools.py` search result notes backend portability and shell-quoting footguns. | medium | Need code-level map of `tools/terminal_tool.py` backend selection and Windows bundled Git Bash wiring. |
| wquguru/harness-books / local charter | `docs/harness/research-charter.md`; `docs/harness/strategy.md` | Local charter already says bash-only is a useful minimal baseline but this repo should still support typed tools for observability, validation, and permissions. It also says a `bash` tool must expose command, cwd, env changes, timeout, sandbox profile, and expected side effects to the permission gate. | The target design should not clone a bash-only ACI. It should keep shell execution as one typed executor capability inside a broader tool harness. | `research-charter.md:161-170`, `396-433`; `strategy.md:38-40`. | high | Need turn this into L05/L06 contract and fake-executor tests. |

## Extracted Knowledge

### Confirmed From Source

- Windows support cannot be inferred from the presence of a `bash` tool name.
- openai/codex resolves a real shell capability and uses PowerShell/cmd on Windows rather than assuming bash.
- Kimi CLI takes the opposite route: it requires Git Bash on Windows and gives an explicit setup hint if bash is unavailable.
- MiMo keeps the `bash` tool name but uses Windows-aware shell selection and PowerShell parsing/execution.
- Hermes packages a portable Git Bash for Windows and also treats terminal execution as backend-dependent.
- Permission and execution are separate concerns in all useful designs: command parsing/approval happens before process spawn, and result/timeout/rejection are separate outcomes.

### Design Rules For This Repo

1. Do not define the core tool as `bash` if the intended abstraction is "run a shell command".
2. Define a provider-neutral `shell.exec` or `process.exec` capability with fields for `command`, `cwd`, `env`, `timeout`, `shell`, `platform`, `sandbox`, and side-effect hints.
3. Advertise executor capabilities to the model/harness: `platform`, selected `shellName`, `shellPath`, parser mode, PATH lookup behavior, sandbox type, network policy, and whether interactive stdin is supported.
4. On Windows, choose one product contract explicitly:
   - PowerShell-first with cmd fallback, like openai/codex.
   - Git-Bash-required with early setup failure, like Kimi CLI.
   - Bundled portable Git Bash, like Hermes.
   - Hybrid capability selection, like MiMo, but then the tool descriptor must show the actual shell.
5. A missing executable is not a permission denial. It should become `ToolExecutionFailed` or `ToolUnavailable`, with reason `executable_not_found`, selected shell candidate list, and recovery hint.
6. Sandbox denial, command exit code, timeout, user rejection, and command-not-found must remain distinct result classes. openai/codex explicitly avoids treating exit code `127` as sandbox denial.
7. Permission policy should evaluate the command after shell-specific parsing or lowering. PowerShell and POSIX shell syntax need different parsers/safelists.
8. The model-facing description should not promise POSIX utilities on Windows unless Git Bash or equivalent is guaranteed.
9. Background/persistent shell behavior is a separate capability. A fresh one-shot shell is easier to reason about for permission, replay, and deterministic tests.
10. If `bash` remains as a compatibility alias, the runtime should store both `toolName: "bash"` and `executionShell: "powershell" | "cmd" | "bash" | ...` in events.

## Target Event Implications

Minimum L05/L06 events for shell execution:

- `ToolCallValidated`: schema accepted and cwd/env normalized.
- `ToolUnavailable`: no acceptable shell executable found, with candidates and install hint.
- `PermissionEvaluated`: pure allow/deny/ask decision.
- `PermissionRequested`: only if policy requires a human/harness decision.
- `ToolExecutionStarted`: includes program argv, cwd, environment policy summary, sandbox, timeout, and shell capability.
- `ToolExecutionOutputDelta`: stdout/stderr chunks when streaming.
- `ToolExecutionFinished`: exit code, stdout/stderr summary, duration, truncation, timed_out=false.
- `ToolExecutionTimedOut`: timeout distinct from non-zero exit.
- `ToolExecutionDeniedBySandbox`: sandbox denial distinct from command-not-found.
- `ToolExecutionFailed`: spawn failure, executable-not-found, invalid cwd, or executor internal error.

## Implications For Windows Bash Absence

If the current executor contract says "bash is required":

- Detect during environment setup.
- Fail before the model gets a misleading shell tool.
- Return an actionable setup message such as "Install Git for Windows or set `*_GIT_BASH_PATH`".

If the current executor contract says "shell command is required":

- Do not call `bash`.
- Select PowerShell first on Windows, optionally fallback to cmd.
- Parse/approve commands with a PowerShell-aware policy.
- Tell the model which shell is active.

If the current executor contract says "portable POSIX shell is bundled":

- Verify the bundled bash path at startup.
- Store that path in capability metadata.
- Treat missing bundle as packaging failure, not model/tool misuse.

## Boundary Notes

- P00 observes whether the loop continues after a failed shell command; L05 owns the execution attempt and structured result.
- L04 owns argument/schema validation and shell-specific command parsing. L05 consumes the validated execution request.
- L06 owns the pure permission decision and human/harness approval protocol. L05 must not hide approval inside process spawn.
- L08 records the event stream and result evidence. It should not infer shell outcome from UI-only text.
- L12 may render a button or approval modal, but it must not be the only owner of the permission state.

## Next Layer Prep

- Write `docs/design/L05-tool-harness-contract.md` with a fake shell executor contract.
- Add deterministic tests for:
  - Windows PowerShell selected when bash is absent.
  - Git-Bash-required mode fails with `ToolUnavailable`.
  - command-not-found is not sandbox-denied.
  - timeout, abort, user rejection, and non-zero exit are separate outcomes.
  - permission policy gets shell-specific parsed command words.
