---
type: Source Card
title: openai/codex
description: Latest local source snapshot used to analyze enterprise settings enforcement and model-provider control in OpenAI Codex.
resource: https://github.com/openai/codex
tags: [layer/l1-source, source/github, topic/agent-runtime, topic/model-provider, topic/config, topic/permission-gate, topic/network-policy]
timestamp: "2026-06-25T18:45:00+09:00"
layer: L1
status: reviewed
change_policy: immutable
source_type: github_repo
captured_at: "2026-06-25T18:45:00+09:00"
source_version: c38b2e9ba69cb57d197c6e5ba78b5e52ae0870f9
derived_from:
  - 01_sources/open-source/github/openai__codex/2026-06-19/source-card.md
supports:
  - docs/research/openai-codex/2026-06-25-enterprise-provider-control.md
aliases: [OpenAI Codex CLI, Codex CLI]
confidence: source
verification:
  last_checked: "2026-06-25"
  method: git-fetch-and-source-review
---

# Source Scope

- Repository: <https://github.com/openai/codex>
- Accessed: 2026-06-25
- Local checkout: `work/external-repos/openai__codex`
- Reviewed commit: `c38b2e9ba69cb57d197c6e5ba78b5e52ae0870f9`
- Latest reviewed commit date: 2026-06-25T09:45:20Z
- Latest reviewed commit subject: `Test executor-routed MCP OAuth token exchange (#29656)`
- Local checkout note: `.codegraph/` remains untracked and was not treated as source evidence.

# Confirmed Facts

- The public repository describes Codex CLI as a local coding agent and contains the Rust implementation under `codex-rs/`.
- Current source has a layered configuration system with admin, system, cloud enterprise-managed, user, project, session, and legacy managed sources.
- Current source has a `ConfigRequirements` path for server/admin constraints such as approval policy, sandbox/permission profile, hooks, MCP servers, plugins, network constraints, and residency.
- Current source has a `model_provider` selector and user-defined `model_providers` map that extends built-in providers.
- Built-in model provider IDs cannot generally be overridden by user-defined providers.
- Project-local config denylist blocks `model_provider` and `model_providers`.
- Current source exposes built-in provider IDs including `openai`, `amazon-bedrock`, `ollama`, and `lmstudio`.
- Current source has managed network constraints, including `managed_allowed_domains_only`, which can pin effective allowed domains to managed entries.

# Enterprise Control Signals

- Strong starting point: requirements layers already express many server/admin enforced controls.
- Main gap: model/provider selection is config-driven but not yet a first-class requirements constraint.
- Safe architecture direction: the enterprise client should see one company gateway provider while the company server brokers actual upstream model providers.
- Network policy should deny direct egress to upstream model providers unless routed through the company gateway.

# Files Reviewed

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

# Citations

[1] [openai/codex](https://github.com/openai/codex)
