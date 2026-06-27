---
type: Run Log
title: OpenAI Codex Enterprise Provider Control
description: Recovery trail for latest openai/codex source refresh and enterprise provider-control analysis.
tags: [run, research/openai-codex, topic/enterprise, topic/model-provider, topic/config]
status: complete
change_policy: append-only
---

# OpenAI Codex Enterprise Provider Control

## Goal

Analyze current openai/codex as a base for an enterprise coding agent where:

- settings can be enforced by server/admin policy,
- models can come from multiple providers,
- the company is the only client-visible model supplier.

## Current State

- Updated existing local checkout `work/external-repos/openai__codex` from `70a6aa2634adedaabf66a66f11c16e869c1c7d1e` to `c38b2e9ba69cb57d197c6e5ba78b5e52ae0870f9`.
- Wrote latest source card: `01_sources/open-source/github/openai__codex/2026-06-25/source-card.md`.
- Wrote research note: `docs/research/openai-codex/2026-06-25-enterprise-provider-control.md`.
- Existing external checkout still has untracked `.codegraph/`; it was not modified or treated as source evidence.

## Sources Read

- Public repository: <https://github.com/openai/codex>, accessed 2026-06-25.
- Local checkout commit: `c38b2e9ba69cb57d197c6e5ba78b5e52ae0870f9`.
- `codex-rs/config/src/config_layer_source.rs`
- `codex-rs/config/src/config_requirements.rs`
- `codex-rs/config/src/loader/mod.rs`
- `codex-rs/config/src/cloud_config_bundle.rs`
- `codex-rs/config/src/cloud_config_layers.rs`
- `codex-rs/cloud-config/src/service.rs`
- `codex-rs/config/src/config_toml.rs`
- `codex-rs/model-provider-info/src/lib.rs`
- `codex-rs/model-provider/src/provider.rs`
- `codex-rs/model-provider/src/auth.rs`
- `codex-rs/model-provider/src/amazon_bedrock/mod.rs`
- `codex-rs/config/src/thread_config/remote.rs`
- `codex-rs/core/src/config/mod.rs`
- `codex-rs/core/src/config/network_proxy_spec.rs`
- `codex-rs/network-proxy/src/state.rs`
- `codex-rs/app-server/src/config_manager_service.rs`
- `codex-rs/app-server-protocol/src/protocol/v2/config.rs`

## Key Decisions

- Treat company-only supply as "company gateway is the only client-visible provider."
- Treat upstream provider diversity as server-side gateway behavior, not a client config freedom.
- Use existing Codex requirements path for enforcement, but add missing model/provider requirements.
- Use managed network allowlist hardening as a secondary bypass control.

## Verification

- Confirmed latest checkout HEAD with `git log -1 --format=%H%n%cI%n%s`.
- Confirmed source-card, research-note, and run-log headings/commit references with `rg`.
- Checked root `git status --short`; unrelated pre-existing untracked design/research files remain.
- Checked external checkout `git status --short`; `.codegraph/` remains the only untracked path.
- Confirmed source evidence by reading the local checkout files listed above.

## Next Steps

1. Write an ADR under `docs/adr/` for the company-gateway provider decision.
2. Spike a minimal requirements schema patch in a separate branch or worktree.
3. Add deterministic tests for malicious user provider config, direct egress denial, and server unavailable fail-closed behavior.
