---
type: Research Note
title: OpenAI Codex App-Server Artifact Handling
description: Focused source review of how openai/codex app-server represents artifacts, especially image, Markdown, and HTML outputs.
tags: [research/openai-codex, topic/app-server, topic/artifacts, topic/file-system, topic/event-model]
status: draft
change_policy: curated
---

# OpenAI Codex App-Server Artifact Handling

## Metadata

- Date: 2026-06-25
- Analyst: Codex
- Scope: how `codex app-server` represents artifact-like outputs in the app-server protocol and adjacent core runtime.
- Research boundary: event model, transcript/session persistence, tool system, file system access, runtime/harness boundary.
- Local source snapshot: `work/external-repos/openai__codex` at `70a6aa2634adedaabf66a66f11c16e869c1c7d1e`.
- Local checkout note: `.codegraph/` is untracked in the external checkout and was not treated as source evidence.
- Public source checked: <https://github.com/openai/codex>, accessed 2026-06-25.
- Prior source card: `01_sources/open-source/github/openai__codex/2026-06-19/source-card.md`.

## Short Answer

In the current reviewed source, `codex app-server` does not expose a generic first-class `Artifact` or `HtmlArtifact` / `MarkdownArtifact` item in its `ThreadItem` union.

The special first-class artifact-like path is image generation:

- Core saves generated image bytes under `$CODEX_HOME/generated_images/<session_id>/<call_id>.png`.
- The resulting `ThreadItem::ImageGeneration` carries `status`, `revised_prompt`, raw base64 `result`, and optional `saved_path`.
- App-server can replay `ImageGenerationEnd` events into thread history with that `saved_path`.

For `.md` or `.html`, the observed app-server behavior is different:

- If the agent writes or patches a Markdown/HTML file, app-server represents it as a `FileChange` item with `path`, `kind`, `diff`, and `status`, not as an artifact object.
- If an app client writes/reads such a file directly, it uses `fs/writeFile` and `fs/readFile` with base64 file contents. This is a host filesystem API, not transcript artifact promotion.
- If an MCP/app tool returns a UI resource such as `ui://widget/lookup.html`, app-server keeps that URI as `McpToolCall.appContext.resourceUri` and legacy `mcpAppResourceUri`. It is still an MCP tool-call item, not a generic HTML artifact item.
- If the assistant merely mentions Markdown or HTML in text, it is just `AgentMessage.text`.

So for this repo's design: a first-class md/html artifact contract should not be inferred from generic file writes. It needs an explicit event/item type or explicit metadata gate.

## Source Evidence

### App-Server Primitives

`codex-rs/app-server/README.md` defines the top-level app-server shape as `Thread`, `Turn`, and `Item`. Items include examples such as user message, reasoning, agent message, shell command, and file edit, but not a named generic artifact primitive. It also says app-server streams `item/started`, `item/completed`, agent-message deltas, tool progress, and side effects.

Evidence:

- `work/external-repos/openai__codex/codex-rs/app-server/README.md:64-81`

The same README documents schema generation outputs as "generated artifacts", but this is about protocol binding files (`generate-ts`, `generate-json-schema`), not user-facing conversation artifacts.

Evidence:

- `work/external-repos/openai__codex/codex-rs/app-server/README.md:55-62`

### Protocol Item Union

The v2 `ThreadItem` union has concrete variants for:

- `UserMessage`
- `HookPrompt`
- `AgentMessage`
- `Plan`
- `Reasoning`
- `CommandExecution`
- `FileChange`
- `McpToolCall`
- `DynamicToolCall`
- `CollabAgentToolCall`
- `SubAgentActivity`
- `WebSearch`
- `ImageView`
- `Sleep`
- `ImageGeneration`
- review-mode markers
- `ContextCompaction`

There is no `Artifact`, `MarkdownArtifact`, or `HtmlArtifact` variant in the reviewed item union.

Evidence:

- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/v2/item.rs:215-386`

### Image Generation Is The Special Case

Core defines a host-owned image output directory and path:

- directory constant: `generated_images`
- path: `codex_home/generated_images/sanitized_session_id/sanitized_call_id.png`

It decodes standard base64, creates the parent directory, writes bytes to disk, and sets `image_item.saved_path` when successful.

Evidence:

- `work/external-repos/openai__codex/codex-rs/core/src/stream_events_utils.rs:39-68`
- `work/external-repos/openai__codex/codex-rs/core/src/stream_events_utils.rs:111-166`

When a non-tool response item is an `ImageGenerationCall`, core parses it into a turn item, finalizes it, persists the generated file when `result` is non-empty, emits started/completed item events, and records image-generation path instructions for the model.

Evidence:

- `work/external-repos/openai__codex/codex-rs/core/src/stream_events_utils.rs:440-585`

App-server protocol maps `CoreTurnItem::ImageGeneration` into `ThreadItem::ImageGeneration`, preserving `saved_path`.

Evidence:

- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/v2/item.rs:864-870`

Thread-history reconstruction also handles legacy/bespoke image-generation begin/end events and upserts `ThreadItem::ImageGeneration` with `saved_path`.

Evidence:

- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/thread_history.rs:844-864`

### Markdown And HTML As Files

File edits are represented as `ThreadItem::FileChange`, and each change has only:

- `path`
- `kind`
- `diff`

There is no MIME type, preview URL, audience, stage, or artifact metadata in that file-change shape.

Evidence:

- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/v2/item.rs:278-284`
- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/v2/item.rs:970-984`

App-server also exposes host filesystem methods:

- `fs/readFile`
- `fs/writeFile`
- `fs/createDirectory`
- `fs/getMetadata`
- `fs/readDirectory`
- `fs/remove`
- `fs/copy`
- `fs/watch`

For read/write, file bytes are base64 encoded. These methods let clients manage `.md` and `.html` files, but the API shape does not promote the file to a thread artifact.

Evidence:

- `work/external-repos/openai__codex/codex-rs/app-server/README.md:192-201`
- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/v2/fs.rs:7-40`
- `work/external-repos/openai__codex/codex-rs/app-server/src/request_processors/fs_processor.rs:64-93`

### HTML Through MCP Resource URIs

MCP tool calls can carry app context with:

- `connector_id`
- `link_id`
- `resource_uri`

Core reads `resourceUri` from MCP tool metadata keys such as nested `ui.resourceUri`, flat `ui/resourceUri`, and `openai/outputTemplate`. App-server preserves this as `McpToolCall.appContext.resourceUri` and deprecated `mcpAppResourceUri`.

Evidence:

- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/v2/item.rs:287-304`
- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/v2/item.rs:389-395`
- `work/external-repos/openai__codex/codex-rs/core/src/mcp_tool_call.rs:1540-1570`
- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/thread_history.rs:760-830`

This can point at HTML-like widget resources (`ui://widget/lookup.html` in tests), but the protocol still treats it as an MCP tool-call result and UI resource hint, not a generic standalone HTML artifact.

### Resume And Redaction Caveat

`ThreadItems` are documented as a lossy projection for some history paths. `thread/resume` behavior is explicitly not a complete replay of every agent interaction.

Evidence:

- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/v2/thread.rs:1016-1020`

For selected ChatGPT mobile remote clients, app-server redacts MCP payloads and drops image-generation items from `thread/resume` responses. This is response-only and does not change persisted rollout history or model resume history.

Evidence:

- `work/external-repos/openai__codex/codex-rs/app-server/src/request_processors/thread_resume_redaction.rs:6-39`

## Comparison Axes

| Axis | Artifact-specific observation |
| --- | --- |
| Agent loop structure | Image generation finalization happens inside core response-item handling, before app-server projection. md/html file writes enter as normal file-change or filesystem operations. |
| LLM provider abstraction | Provider image-generation result is a `ResponseItem::ImageGenerationCall`; app-server does not expose provider-specific SDK objects. |
| Message/context representation | Image generation records a model-visible path hint after a successful save. md/html files have no equivalent artifact hint unless a tool or assistant message writes one. |
| Tool calling 방식 | Standalone image generation is exposed as a tool-like capability and produces `ImageGeneration` items. MCP UI resources stay under `McpToolCall`. |
| Tool result 처리 | Image result base64 is decoded and saved. MCP result content/meta is preserved in the tool-call item, with resource URI metadata when available. |
| Permission/sandbox 모델 | File writes through app-server `fs/writeFile` are host filesystem operations mediated by the environment filesystem. Agent patch/file changes flow through normal file-change approval surfaces, not artifact-specific permission. |
| File system and shell access 모델 | md/html are ordinary files from app-server's point of view: patch diffs, fs read/write, metadata, directory listing, or watch notifications. |
| Context management, pruning, compaction | Generated image output can add explicit model-visible path instructions. There is no observed md/html artifact context injection policy. |
| Streaming/event model | Image generation has started/completed item semantics and legacy begin/end history reconstruction. md/html file creation streams as file-change or command/tool output. |
| Transcript/session persistence | Image generation can be replayed from rollout events into `ThreadItem::ImageGeneration`; `ThreadItem` history is lossy in some response paths. |
| Runtime/harness separation | Runtime/core owns image save path and item finalization. Harness/client would own previewing md/html files unless a future protocol item makes that first-class. |
| Configuration/extension model | A `Feature::Artifact` flag exists and is under development/default-disabled in the reviewed source, but this review found no direct app-server `ThreadItem::Artifact` implementation tied to md/html. |
| Testing strategy | Image-generation app-server tests assert saved path, bytes on disk, and model-visible hint. File-change tests assert `README.md` additions are projected as `FileChange`. |
| Failure handling | Invalid image payload or backend failure yields no saved path or a failed image-generation item. md/html write failures would be ordinary fs/tool/patch failures. |
| Human intervention, steering, approval flow | File changes can use file-change approval. Artifact-specific review/approval metadata for md/html is absent. |
| Multi-agent or sub-agent boundary | Artifact handling is not a separate multi-agent primitive; sub-agent activity has its own item type. |

## What We Learn

- Codex app-server's current durable UI primitive is not "artifact"; it is `ThreadItem`.
- Image generation is the only reviewed user-output path that combines a durable host file path with a dedicated item variant.
- Markdown/HTML should be treated as ordinary workspace files unless explicitly promoted by another layer.
- MCP UI resources are useful for connector widgets, but they are not the same as agent-authored human review artifacts.
- A client that wants md/html previews must either watch/read files and infer previewability or define an explicit contract above app-server.

## What We Should Redesign

For this repo's runtime/harness architecture, do not equate "the agent wrote a file" with "the agent produced a first-class artifact."

Recommended contract direction:

```ts
type ArtifactDeclared = {
  id: string;
  sourceItemId: string;
  path: string;
  mimeType: "text/markdown" | "text/html" | "image/png" | string;
  title?: string;
  audience: "user" | "agent" | "reviewer";
  stage: "draft" | "review" | "final" | string;
  status: "created" | "updated" | "ready" | "failed";
  provenance: {
    threadId: string;
    turnId: string;
    toolCallId?: string;
  };
};
```

Promotion rules:

- Promote only explicit declarations, not all writes.
- Keep raw file writes as `FileChange` / filesystem events.
- Let harness preview md/html only after an explicit artifact declaration or an allowlisted checkpoint rule.
- Persist the declaration as an event so resume/fork/replay can reconstruct artifact affordances.
- Keep image generation as a specialized producer that can emit the same generic declaration in addition to image-specific payload.

## Implications For This Repo

- `src/contracts/event.ts` should not copy app-server's current lack of md/html artifact typing if this repo wants human-facing review surfaces.
- `docs/design/` should distinguish:
  - file effect: a write happened
  - transcript item: a client can render the turn
  - artifact declaration: a user-facing deliverable should be surfaced
  - preview handle: a harness can open/render it
- `outputs/` and `runs/` policy here already matches the desired split: final/reviewable outputs are promoted intentionally, while scratch and raw evidence stay elsewhere.

## Open Questions And Assumptions

- Assumption: the reviewed local checkout is close enough to public `main` for this focused analysis. Public GitHub source was opened on 2026-06-25, but line-level evidence is from the local snapshot.
- Open question: `Feature::Artifact` is under development/default-disabled. It may point to future native artifact tools not yet wired into the app-server item union reviewed here.
- Open question: remote ChatGPT/desktop clients may implement private UI-side artifact affordances over files or MCP resources that are not visible in this open-source repo.
- Open question: app-server could later add a generic artifact item. Future research should search for `Feature::Artifact`, `ThreadItem::Artifact`, `artifact_declared`, and app-client preview code before relying on this note.
