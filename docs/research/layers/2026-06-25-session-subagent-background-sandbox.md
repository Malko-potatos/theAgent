---
type: Research Note
title: Session, Subagent, Background Shell, And Sandbox Operations
description: Cross-project source-backed notes on multi-session execution, subagent delegation, background shell/task management, and sandbox boundaries in open-source coding agents.
tags:
  - research/layers
  - topic/sessions
  - topic/subagents
  - topic/background-shell
  - topic/sandbox
  - layer/l05
  - layer/l06
  - layer/l08
  - layer/l11
status: draft
change_policy: curated
---

# Session, Subagent, Background Shell, And Sandbox Operations

Date: 2026-06-25

Scope:

- Multiple session execution.
- Subagent or teammate execution.
- Background shell and long-running task management.
- Sandbox and permission boundaries.

Layer boundary:

- L05 tool harness: shell execution, tool task lifecycle, output capture.
- L06 approval and permission: allow, ask, deny, approval cache, policy scope.
- L08 trajectory and persistence: sessions, forks, replayable events.
- L10 resilience and recovery: timeout, abort, stale background work.
- L11 extensibility: tools, agents, hooks, plugins, subagent registry.
- L12 human-facing surface: session list, terminal panes, task board, hub clients.

Non-scope:

- Provider adapter shape except where provider events interact with subagent or task
  events.
- Exact UI implementation.
- Live evaluation of agent quality.

## Sources

Local source snapshots:

- OpenAI Codex local snapshot:
  `work/external-repos/openai__codex`, source cards dated 2026-06-19,
  commit `70a6aa2634adedaabf66a66f11c16e869c1c7d1e`, accessed
  2026-06-25.
- MoonshotAI Kimi CLI local snapshot:
  `work/external-repos/moonshotai__kimi-cli`, local source inspected
  2026-06-25.
- Xiaomi MiMo Code / OpenCode-derived local snapshot:
  `work/external-repos/xiaomimimo__mimo-code`, local source inspected
  2026-06-25.

Live public sources:

- OpenHands README:
  <https://github.com/OpenHands/OpenHands>, accessed 2026-06-25.
- OpenHands Software Agent SDK README:
  <https://github.com/OpenHands/software-agent-sdk>, accessed 2026-06-25.
- OpenHands Software Agent SDK source, browsed on `main` on 2026-06-25:
  conversation service, conversation factory, and bash event service under
  <https://github.com/OpenHands/software-agent-sdk>.
- Cline README:
  <https://github.com/cline/cline>, accessed 2026-06-25.
- Cline SDK architecture:
  <https://github.com/cline/cline/blob/main/sdk/ARCHITECTURE.md>, accessed
  2026-06-25.
- Cline Kanban README:
  <https://github.com/cline/cline/tree/main/cline/kanban>, accessed
  2026-06-25.

Source quality note:

- Codex, Kimi CLI, and MiMo/OpenCode observations below are based on local source
  files with line-number inspection.
- OpenHands and Cline observations combine current public README/architecture
  pages with browsed source files on `main`. Exact `main` commit SHA was not
  captured in this pass, so claims should be refreshed before accepting an ADR.

## Research Questions

1. How does the project represent and run multiple sessions?
2. Are subagents separate sessions, child threads, tools, or only prompt-level
   roles?
3. How are long-running shell commands represented, observed, stopped, and
   resumed?
4. Does "permission" mean user approval, OS/process isolation, container
   isolation, or all of these?
5. What minimum contract should this repo prototype first?

## Cross-Project Matrix

| Project | Multiple sessions | Subagents | Background shell/tasks | Sandbox and permission | Design takeaway |
| --- | --- | --- | --- | --- | --- |
| OpenAI Codex | `ThreadManagerState` keeps an in-memory `HashMap<ThreadId, Arc<CodexThread>>`, supports start, resume, and fork from rollout/history. Thread config snapshots include parent and fork metadata. | `spawn_subagent` materializes the parent rollout, forks interrupted history, and starts a child thread with `parent_thread_id` and `forked_from_thread_id`. Multi-agent prompt hints vary root vs subagent instructions. | `CodexThread` exposes `list_background_terminals` and `terminate_background_terminal`; the unified exec process manager lists live processes as `BackgroundTerminalInfo` with item id, process id, command, and cwd. | Shell runtime implements approvable and sandboxable traits, uses an approval key, preserves denied reads on escalation, and delegates sandbox transforms to platform-specific backends: macOS seatbelt, Linux seccomp, Windows restricted token, or none. | Treat session as the durable authority. Model subagent as a child/forked session, not only a tool result. Keep sandbox transform separate from approval decision. |
| Kimi CLI | Session-local background task store under the session context directory. Background manager reconciles stored tasks and supports local/root-agent constraints. | `Agent` tool can create or resume a subagent and, in background mode, turns it into a persisted `agent` background task. Wire events include `SubagentEvent` with parent tool call, agent id, subagent type, and nested event. | Background shell uses explicit foreground/background tools. Background tasks have ids, shell name/path, cwd, timeout, owner role, heartbeat/control files, output/tail/read/wait APIs, and stop semantics. | Shell calls request approval. The inspected files show strong lifecycle controls, root/local restrictions, and task limits, but not a strong OS sandbox boundary. | Best concrete background task contract: task ids, output cursors, completion notifications, and stop/read/wait tools should be first-class. |
| MiMo Code / OpenCode-derived | Docs describe primary agents, subagents, child sessions, and navigation between parent and child sessions. | Agents have `mode` values such as primary/subagent/all. Primary agents can invoke subagents through a Task tool; permissions can hide or deny subagents from the Task tool description. | Not the strongest inspected source for shell lifecycle in this pass. | `SECURITY.md` explicitly says there is no sandbox and that permission is UX control, not security isolation; it recommends Docker/VMs for true isolation. | Useful caution: never call permission prompts a sandbox. Keep `PermissionEvaluated` and `SandboxApplied` as different facts. |
| OpenHands | Agent Canvas can connect to multiple Agent Servers. The Agent Server is a REST API for running multiple agents on one machine. SDK conversations can run locally or in ephemeral Docker/Kubernetes workspaces. | README supports major tasks involving multiple agents. Browsed server source keeps per-conversation event services, supports `max_concurrent_runs`, worktree creation, startup reload, and conversation fork by copying event history. | Browsed `BashEventService` starts subprocess shell commands as background tasks, streams stdout/stderr chunks, times out and kills process groups, and explicitly keeps shell events out of the agent-visible event stream. | README distinguishes running without sandbox, where the agent has full filesystem access, from a Docker sandbox where the agent accesses projects under `PROJECTS_PATH`. | Server/hub-style multi-session is valuable, but background shell output should not be hidden from the runtime if it can affect decisions. Worktree isolation is useful but not the same as OS sandboxing. |
| Cline | SDK architecture separates stateless `@cline/agents` from stateful `@cline/core`; hub-backed runtime lets hosts attach/detach from shared sessions while a daemon keeps authority runtime alive. Kanban runs many agents in parallel, each card with its own worktree. | SDK README and architecture describe multi-agent teams, teammate/subagent aggregate usage, session-local executors, and hub forwarding of structured lifecycle events. | README says long-running processes continue in background and Cline reacts to new output. Hub startup and resume hydration are explicitly backgrounded so the TUI can render quickly. | Human-in-the-loop approvals are central. Kanban research preview notes permission bypass for autonomy, which should be treated as a risk label rather than a production default. | Strong harness lesson: hub/daemon/session orchestration belongs above a stateless loop. Background startup work should be explicit and observable. |

## Confirmed Observations

### 1. Multiple Sessions Need A Manager, Not A Bigger Message Array

Confirmed:

- Codex uses `ThreadManager` and a thread map; each thread has its own
  `CodexThread`, config snapshot, rollout path, session source, and event access
  methods.
- Cline puts session lifecycle, persistence, hub server, schedule services, and
  host-facing clients in `@cline/core`; the `@cline/agents` package owns the
  stateless loop.
- OpenHands uses Agent Server as the multi-agent/multi-conversation authority and
  lets Agent Canvas connect to multiple backends.

What we learn:

- The minimum architecture should include a `SessionRuntimeManager` that owns
  session ids, lifecycle state, execution capacity, active turn status,
  persistence location, and event subscription.
- A single `messages[]` or transcript object is not enough once a user can resume,
  fork, attach a second client, spawn a subagent, or leave a process running.

What we should redesign:

- Keep the runtime loop single-session and deterministic.
- Put multi-session scheduling, attach/detach, fork, and lifecycle in a manager
  above the loop.
- Make `SessionStarted`, `SessionResumed`, `SessionForked`, and
  `SessionAttached` replayable events, not UI state.

### 2. Subagents Are Safer As Child Sessions Than As Invisible Tool Calls

Confirmed:

- Codex `spawn_subagent` forks persisted history from the parent and starts a new
  thread with parent/fork metadata.
- Kimi CLI can create a background `agent` task and emits nested
  `SubagentEvent` records that preserve parent tool call and subagent identity.
- MiMo/OpenCode docs expose parent/child session navigation for subagent-created
  child sessions and permission controls for which subagents a Task tool may
  call.
- Cline distinguishes root usage from aggregate teammate/subagent usage in hub
  session records.

What we learn:

- Subagents should have identity, owner session, parent tool call, mode
  (`inline` or `background`), permission profile, and their own event stream.
- Parent session projection can summarize child progress, but the child event log
  should remain separately inspectable and replayable.

What we should redesign:

```ts
type SubagentSpawn = {
  parentSessionId: SessionId;
  parentTurnId: TurnId;
  parentToolCallId: ToolCallId;
  forkSourceEventId?: EventId;
  subagentKind: string;
  prompt: string;
  mode: "inline" | "background";
  permissionProfile: PermissionProfileId;
  workspaceBinding: WorkspaceBinding;
};
```

Minimum events:

- `SubagentSpawnRequested`
- `SubagentStarted`
- `SubagentEvent`
- `SubagentCompleted`
- `SubagentFailed`
- `SubagentCancelled`

### 3. Background Shell Should Be A Durable Task Entity

Confirmed:

- Kimi CLI has the clearest background shell surface: background shell creation,
  validation, root/local restrictions, task store, heartbeat/control files,
  read/tail/wait/stop APIs, output cursors, and completion notifications.
- Codex can list and terminate background terminals and maps live processes into
  `BackgroundTerminalInfo` with item id, process id, command, and cwd.
- Cline explicitly supports long-running commands and background output
  reactions, and it backgrounds hub startup/resume hydration for UI
  responsiveness.
- OpenHands browsed bash service starts shell subprocesses in background tasks,
  streams chunks, and kills a process group on timeout; however, it marks bash
  events as not visible to the agent event stream.

What we learn:

- A background process is not just "a command that did not finish." It needs an
  id, owner, status, timeout, output cursor, heartbeat/stale state, stop method,
  and visibility policy.
- Hiding shell output from the agent may simplify UI separation, but it can make
  runtime decisions depend on facts that are not in the replayable trajectory.

What we should redesign:

```ts
type BackgroundTask = {
  taskId: TaskId;
  ownerSessionId: SessionId;
  ownerRole: "root" | "subagent";
  kind: "shell" | "agent";
  parentToolCallId: ToolCallId;
  command?: string;
  cwd?: string;
  shell?: string;
  timeoutMs: number;
  status:
    | "created"
    | "awaiting_approval"
    | "starting"
    | "running"
    | "succeeded"
    | "failed"
    | "timed_out"
    | "killed"
    | "stale";
  workerPid?: number;
  childPid?: number;
  outputCursor: string;
  startedAt?: string;
  updatedAt: string;
  finishedAt?: string;
};
```

Minimum events:

- `BackgroundTaskCreated`
- `BackgroundTaskApprovalRequested`
- `BackgroundTaskStarted`
- `BackgroundTaskOutputChunk`
- `BackgroundTaskHeartbeat`
- `BackgroundTaskStale`
- `BackgroundTaskCompleted`
- `BackgroundTaskTimedOut`
- `BackgroundTaskKilled`

### 4. Permission Is Not Sandbox

Confirmed:

- MiMo/OpenCode `SECURITY.md` explicitly states there is no sandbox and that
  permission controls are UX, not security isolation.
- OpenHands README warns that running without sandbox gives the agent full
  filesystem access, while the Docker option constrains accessible project roots
  through mounted `PROJECTS_PATH`.
- Codex separates approval requirement, approval caching, sandbox permissions,
  denied reads, network policy, sandbox transform, and platform sandbox type.
- Cline centers approval UX, while its Kanban research preview warns that some
  permission/hook protections may be bypassed for autonomy.

What we learn:

- Permission answers "may this operation proceed?"
- Sandbox answers "what can the operation actually touch if it proceeds?"
- Worktree answers "where should changes be isolated?"
- Container or OS sandbox answers "what process/file/network boundaries are
  enforced?"

What we should redesign:

```ts
type ToolExecutionGate = {
  permissionDecision: PermissionDecision;
  sandboxKind:
    | "none"
    | "container"
    | "macos-seatbelt"
    | "linux-seccomp"
    | "windows-token"
    | "external";
  filesystemPolicy: FilesystemPolicy;
  networkPolicy: NetworkPolicy;
  workspaceRoots: string[];
  deniedReads: string[];
  bypassReason?: string;
};
```

Rules:

- `permissionDecision.kind === "allow"` must not imply `sandboxKind === "none"`.
- Escalation must preserve denied reads unless the user explicitly changes the
  file policy.
- A worktree can isolate Git changes but cannot be presented as a security
  boundary.
- A permission bypass mode must be labeled as such in events and UI projections.

## Implications For This Repo

Prototype order:

1. Add `SessionRuntimeManager` around a deterministic fake-provider loop.
2. Add `BackgroundTaskStore` for fake shell tasks before real shell execution.
3. Add `SubagentSpawn` as a child session/fork event, not as hidden recursion in
   the loop.
4. Add permission evaluation as a pure function.
5. Add sandbox metadata as execution contract fields before implementing any
   real OS sandbox.

Suggested first vertical slice:

- Root session starts with fake provider.
- Provider requests `fake_shell.startBackground`.
- Permission policy returns `ask`, then test supplies `allow`.
- Runtime emits background task events and stores task output.
- User or parent agent reads task output by cursor.
- User kills task.
- Replay reconstructs task lifecycle and session projection without live process
  state.

Deterministic tests to add:

- Cannot start a background task from a subagent when policy is root-only.
- `maxRunningTasks` denial is distinct from user denial.
- `TaskOutput` returns only recorded output up to a cursor and never guesses final
  status.
- Killing a task emits a terminal event and cancels pending approval for that
  task.
- Subagent spawn creates a child session with parent links and aggregate usage
  stays separate from root usage.
- A permission allow decision does not remove sandbox metadata.
- Sandbox escalation preserves denied reads.
- Replay after interruption reconstructs `running`, `stale`, or `killed` task
  state from events plus recovery policy.

## Open Questions

- Should the first prototype support real background shell, or only fake shell
  tasks until event replay is stable?
- Should a subagent inherit a forked transcript, a projected context view, or both?
- Should background task output always be visible to the agent, or can a harness
  create private terminal panes whose outputs are explicitly excluded from replay?
- How should process ids be treated across restart: stale by default, or
  recoverable through a worker heartbeat?
- Which sandbox implementation, if any, belongs in this repo versus staying as
  metadata until a later prototype?

## Recommendation

For this repo, start with the following design stance:

- A session is the durable unit of authority.
- A subagent is a child session with parent/fork metadata.
- A background shell command is a task with an event stream, not terminal text.
- Permission, worktree isolation, and sandbox isolation are separate facts.
- The harness may render sessions, task boards, and terminal panes, but it must
  not be the only owner of session or task truth.

