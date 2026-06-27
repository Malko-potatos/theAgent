---
type: Run Note
title: OpenAI Codex App-Server Artifact Research
status: complete
change_policy: append-only
---

# OpenAI Codex App-Server Artifact Research

## Goal

Research how OpenAI Codex handles artifacts in `codex app-server`, with a follow-up focus on Markdown and HTML artifacts.

## Status

Complete for the reviewed open-source surface.

## Sources Read

- `01_sources/open-source/github/openai__codex/2026-06-19/source-card.md`
- `work/external-repos/openai__codex/codex-rs/app-server/README.md`
- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/v2/item.rs`
- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/v2/fs.rs`
- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/v2/thread.rs`
- `work/external-repos/openai__codex/codex-rs/app-server-protocol/src/protocol/thread_history.rs`
- `work/external-repos/openai__codex/codex-rs/app-server/src/request_processors/fs_processor.rs`
- `work/external-repos/openai__codex/codex-rs/app-server/src/request_processors/thread_resume_redaction.rs`
- `work/external-repos/openai__codex/codex-rs/core/src/stream_events_utils.rs`
- `work/external-repos/openai__codex/codex-rs/core/src/mcp_tool_call.rs`
- `work/external-repos/openai__codex/codex-rs/features/src/lib.rs`
- Official public source opened: <https://github.com/openai/codex>, accessed 2026-06-25.

## Key Decisions

- Treat image generation as the only confirmed first-class artifact-like `ThreadItem` path in the reviewed app-server protocol.
- Treat Markdown and HTML as ordinary files, file changes, MCP UI resource URIs, or agent text unless an explicit artifact declaration exists.
- Recommend this repo use explicit artifact declaration metadata instead of inferring artifacts from every file write.

## Changed Files

- `docs/design/artifact-preview-contract.md`
- `docs/design/README.md`
- `docs/research/openai-codex/2026-06-25-app-server-artifacts.md`
- `runs/2026-06-25-openai-codex-app-server-artifacts.md`

## Verification

- Verified frontmatter and required H1 with `sed` and `rg`.
- Verified key local source evidence files exist with `test -f`.
- Verified worktree status with `git status --short`; only this research note directory and run note are untracked.
- Follow-up design pass added `docs/design/artifact-preview-contract.md` and linked it from `docs/design/README.md`.

## Next Step

If this research becomes implementation work, translate `ArtifactDeclared`, `ArtifactValidated`, and `ArtifactReferencedInFinal` into `src/contracts/` types and replay/projection tests.
