---
type: Research Note
title: OpenAI Codex Enterprise Provider Control
description: Source-backed analysis of using current openai/codex as the base for an enterprise coding agent with server-enforced settings and company-controlled model supply.
tags: [research/openai-codex, topic/enterprise, topic/config, topic/model-provider, topic/permission-gate, topic/network-policy]
status: draft
change_policy: curated
---

# OpenAI Codex Enterprise Provider Control

## Metadata

- Date: 2026-06-25
- Analyst: Codex
- User goal: Codex open source를 최신화하고, 이를 기반으로 엔터프라이즈 코딩 에이전트를 만들 때 설정 강제, 다양한 모델 제공자, 회사 단일 공급자 조건을 분석한다.
- Scope: server-enforced settings, multi-provider model adapter, company-only model supply path.
- Research boundaries: LLM provider adapter, permission model, configuration/extension model, network/file access policy, runtime/harness boundary.
- Local source snapshot: `work/external-repos/openai__codex` at `c38b2e9ba69cb57d197c6e5ba78b5e52ae0870f9`.
- Public source checked: <https://github.com/openai/codex>, accessed 2026-06-25.
- Source card: `01_sources/open-source/github/openai__codex/2026-06-25/source-card.md`.

## Short Answer

최신 openai/codex는 엔터프라이즈 코딩 에이전트의 베이스로 꽤 좋은 출발점이다. 특히 설정 레이어, requirements 기반 제약, 모델 provider 추상화, remote thread config, network proxy constraint가 이미 분리되어 있다.

하지만 그대로 쓰면 요구사항을 완전히 만족하지 못한다. 결정적인 gap은 `model_provider`와 `model_providers`가 config에는 있지만, modern `ConfigRequirements`에는 provider/model allowlist나 custom provider 금지 조건이 없다는 점이다. 즉 approval/sandbox/network는 서버나 관리자가 강제할 수 있지만, 모델 공급 경로를 "회사만"으로 강제하려면 fork 패치가 필요하다.

권장 방향은 클라이언트가 여러 upstream provider를 직접 알게 하는 것이 아니라, 클라이언트에는 `company-gateway` 하나만 보이게 하고 회사 서버가 OpenAI, Azure, Bedrock, 사내 모델 등 실제 provider를 broker하는 구조다. "모델은 다양한 제공자"와 "회사가 유일한 공급자"를 동시에 만족시키려면 provider 다양성은 서버 뒤에 숨기는 편이 맞다.

## Confirmed From Source

### 1. 설정 강제: requirements 레이어는 이미 방향이 맞다

Codex는 config와 requirements를 분리한다. config는 값이고, requirements는 허용/금지/강제 조건이다.

주요 source evidence:

- `codex-rs/config/src/config_layer_source.rs`
  - `Mdm`, `System`, `EnterpriseManaged`, `User`, `Project`, `SessionFlags`, legacy managed source가 구분된다.
  - layer precedence가 있고, legacy managed config는 매우 높은 우선순위로 남아 있다.
- `codex-rs/config/src/config_requirements.rs`
  - approval policy, approvals reviewer, sandbox/permission profile, web search mode, managed hooks, MCP servers, plugins, marketplaces, exec policy, residency, network/filesystem constraints가 requirements로 표현된다.
- `codex-rs/config/src/loader/mod.rs`
  - Unix `/etc/codex/requirements.toml`, Windows `%ProgramData%\OpenAI\Codex\requirements.toml`, macOS MDM, cloud enterprise-managed bundle, legacy managed config를 로드한다.
  - project-local config denylist에 `model_provider`, `model_providers`, `openai_base_url`, `chatgpt_base_url`, `profiles`, `notify`, realtime URL 등이 포함된다.
- `codex-rs/app-server/src/config_manager_service.rs`
  - user config write 후 effective config를 재계산하고, 상위 layer가 덮어쓴 경우 `OkOverridden` 메타데이터를 반환한다.

해석:

- 서버/관리자 강제 설정의 핵심 확장점은 기존 requirements path에 태워야 한다.
- 단순히 cloud config fragment에 `model_provider = "company-gateway"`를 넣는 것은 충분하지 않다. cloud enterprise-managed config는 layer일 뿐이고, user/session 값과 충돌할 때 진짜 enforcement가 되려면 requirements 검증이 필요하다.

### 2. 다양한 모델 제공자: provider abstraction은 이미 있다

Codex는 `model_provider`와 `model_providers`를 통해 provider 선택과 provider 정의를 분리한다.

주요 source evidence:

- `codex-rs/config/src/config_toml.rs`
  - `model_provider: Option<String>`은 `model_providers` map의 key를 선택한다.
  - `model_providers: HashMap<String, ModelProviderInfo>`는 user-defined provider를 built-in list에 추가한다.
  - built-in provider ID는 일반적으로 override할 수 없고, custom provider는 `openai-custom` 같은 별도 이름을 써야 한다.
- `codex-rs/model-provider-info/src/lib.rs`
  - built-in provider에는 `openai`, `amazon-bedrock`, `ollama`, `lmstudio`가 있다.
  - `ModelProviderInfo`는 `base_url`, `env_key`, command-backed bearer token auth, AWS auth, headers/query params, timeout/retry, first-party auth requirement를 담는다.
  - wire API는 현재 `responses` 중심이다.
- `codex-rs/model-provider/src/provider.rs`
  - provider trait가 capabilities, auth, model listing, runtime base URL, API provider 변환을 담당한다.
- `codex-rs/model-provider/src/amazon_bedrock/mod.rs`
  - Bedrock은 특별 provider로 분리되어 있고, Mantle OpenAI-compatible endpoint 및 AWS/managed API key auth 흐름이 있다.
- `codex-rs/config/src/thread_config/remote.rs`
  - remote thread config가 `model_provider`, `model_providers`, feature flags를 세션 layer로 내려줄 수 있다.

해석:

- multi-provider 자체는 새로 처음부터 만들 필요가 없다.
- 다만 엔터프라이즈 요구에서는 "클라이언트가 provider를 마음대로 추가 가능"한 점이 위험하다.
- `env_key`, `experimental_bearer_token`, command-backed auth는 유연하지만, 회사 단일 공급자 모델에서는 관리형 auth source로 제한해야 한다.

### 3. 회사가 유일한 공급자: 현재 소스는 부분만 만족한다

현재 Codex에는 회사 단일 공급자를 만드는 데 필요한 재료가 있다.

- cloud enterprise-managed config bundle
- remote thread config
- provider abstraction
- forced ChatGPT workspace/login method
- network requirements and allowlist constraints
- project-local provider override denylist

하지만 다음 enforcement gap이 남아 있다.

- `ConfigRequirements`에 `allowed_model_providers`, `default_model_provider`, `allow_user_defined_model_providers`, `allowed_models`, `allowed_provider_base_urls`, `allowed_provider_auth_sources` 같은 필드가 없다.
- cloud config layer는 provider 값을 공급할 수 있지만, requirements처럼 "사용자 변경을 거부"하는 구조가 아니다.
- built-in provider ID를 override할 수 없어서, corporate gateway를 `openai`로 투명하게 바꾸는 방식은 현재 검증 로직과 충돌한다.
- user config의 custom provider와 env/API key path가 남아 있으면, 네트워크 egress가 열려 있는 환경에서 직접 provider 우회가 가능하다.
- remote thread config는 세션 layer라 유용하지만, 서버 불가 시 fail-closed 동작을 별도로 정의해야 한다.

## Recommended Enterprise Architecture

### Decision Thesis

클라이언트에는 provider를 하나만 노출한다.

```toml
model_provider = "company-gateway"

[model_providers.company-gateway]
name = "Company Model Gateway"
base_url = "https://agent.company.example/v1"
wire_api = "responses"
requires_openai_auth = false
```

실제 모델 다양성은 회사 gateway 뒤에서 해결한다.

- OpenAI, Azure OpenAI, Bedrock, 사내 vLLM, 온프레미스 모델은 gateway backend가 선택한다.
- 클라이언트에는 provider list가 아니라 model catalog와 capability만 내려준다.
- billing, DLP, audit, prompt policy, data residency, abuse monitoring, per-tenant allowlist는 gateway에서 일관되게 적용한다.

### Required Codex Fork Patch

#### 1. Model provider requirements 추가

현재 requirements schema에 다음에 해당하는 제약을 추가해야 한다.

```toml
[model_provider_requirements]
allowed_providers = ["company-gateway"]
default_provider = "company-gateway"
allow_user_defined_providers = false
allowed_models = ["gpt-5-enterprise", "company-code-large"]
require_server_catalog = true
allowed_base_url_patterns = ["https://agent.company.example/*"]
allowed_auth_sources = ["managed_session", "company_token_command"]
```

Rust 쪽 개념 타입:

```rust
pub struct ModelProviderRequirementsToml {
    pub allowed_providers: Option<Vec<String>>,
    pub default_provider: Option<String>,
    pub allow_user_defined_providers: Option<bool>,
    pub allowed_models: Option<Vec<String>>,
    pub require_server_catalog: Option<bool>,
    pub allowed_base_url_patterns: Option<Vec<String>>,
    pub allowed_auth_sources: Option<Vec<ModelProviderAuthSourceRequirement>>,
}
```

적용 위치:

- `codex-rs/config/src/config_requirements.rs`: TOML schema와 sourced requirements 추가.
- `codex-rs/core/src/config/mod.rs`: `model_providers` merge 후, `model_provider_id` resolve 전후로 constraints 검증.
- `codex-rs/app-server-protocol/src/protocol/v2/config.rs`: app/server가 provider constraints와 origin을 표시할 수 있게 protocol 확장.
- `codex-rs/app-server/src/config_manager_service.rs`: user write가 provider requirements에 막히거나 override되는 상태를 명확히 반환.

검증 기준:

- user config가 `model_provider = "openai"`로 바꿔도 rejected 또는 overridden 되어야 한다.
- user config가 `[model_providers.attacker] base_url = "https://api.openai.com/v1"`를 추가하면 enterprise requirements 아래에서 rejected 되어야 한다.
- project `.codex/config.toml`은 이미 provider denylist가 있으므로 계속 차단되어야 한다.

#### 2. Company gateway provider profile

두 가지 선택지가 있다.

| Option | 설명 | 장점 | 단점 |
| --- | --- | --- | --- |
| custom provider entry | enterprise cloud config가 `company-gateway` provider를 내려준다 | upstream Codex 구조와 잘 맞음 | requirements 없이는 사용자가 다른 provider로 전환 가능 |
| built-in enterprise provider | fork에서 `company-gateway`를 built-in provider로 추가한다 | 배포 기본값과 catalog UX가 안정적 | fork surface가 조금 커짐 |

권장안은 built-in `company-gateway` + requirements allowlist다. custom provider entry만으로는 "회사 단일 공급자" 보장이 약하다.

#### 3. Network egress hardening

Codex network proxy에는 managed requirements 기반의 allowlist/denylist constraint가 이미 있다.

주요 source evidence:

- `codex-rs/core/src/config/network_proxy_spec.rs`
  - requirements가 network allowed/denied domains를 seed하고 constraint로 저장한다.
  - `managed_allowed_domains_only = true`이면 user allowlist 확장을 끄고 allowlist miss를 hard deny할 수 있다.
- `codex-rs/network-proxy/src/state.rs`
  - managed allowed domains와 candidate config를 검증하고, widening/global wildcard를 거부하는 path가 있다.

엔터프라이즈 policy:

```toml
[experimental_network]
enabled = true
managed_allowed_domains_only = true

[experimental_network.domains]
allow = ["agent.company.example", "auth.company.example"]
deny = ["api.openai.com", "chatgpt.com", "*.bedrock.amazonaws.com", "localhost"]
```

주의:

- 실제 gateway가 private network, proxy, Bedrock VPC endpoint를 쓰면 client allowlist가 아니라 server egress policy에서 처리한다.
- 클라이언트 network allowlist는 "Codex client가 모델 provider로 직접 나가지 못하게" 하는 보조 안전장치다.

#### 4. Auth path restriction

회사 단일 공급자 모델에서는 provider credential을 client에 주지 않는다.

권장:

- client는 회사 SSO/agent session token만 가진다.
- gateway가 upstream provider credential을 보관한다.
- user-defined `env_key`, `experimental_bearer_token`, arbitrary command auth는 enterprise mode에서 금지한다.
- 필요한 command auth는 회사가 서명한 managed token helper만 허용한다.

#### 5. Fail-closed enterprise startup

managed account에서 다음 중 하나가 실패하면 local default provider로 fallback하지 않는다.

- cloud enterprise requirements fetch/cache validation
- remote thread config fetch
- company gateway model catalog fetch
- managed token minting
- network proxy startup under enterprise constraints

실패 상태는 runtime error와 app-server config surface에 명확히 표시한다. UI가 조용히 `openai`나 user API key로 돌아가면 "회사 유일 공급자" 조건이 깨진다.

## Comparison Axes

| Axis | Current Codex Observation | Enterprise Redesign |
| --- | --- | --- |
| Agent loop structure | core runtime selects model/provider from merged config before provider use | loop 시작 전 enterprise requirements 검증을 필수 preflight로 둔다 |
| LLM provider abstraction | `ModelProviderInfo` + provider trait + built-ins/custom map | client-visible provider는 `company-gateway` 하나로 제한하고 upstream diversity는 gateway로 이동 |
| Message/context representation | provider-neutral runtime이 provider-specific SDK 객체를 직접 core state에 흘리지 않도록 설계됨 | gateway가 model capability/catalog metadata만 내려주고 raw provider identity는 audit metadata에만 둔다 |
| Tool calling 방식 | tool/provider capability는 provider abstraction과 runtime tool system으로 분리됨 | provider별 tool 지원 차이는 gateway가 normalized capability로 수렴 |
| Tool result 처리 | tool execution은 permission/sandbox와 별도 경계가 있음 | company policy가 tool result logging/redaction을 gateway 및 runtime event log 양쪽에 걸어야 함 |
| Permission/sandbox 모델 | requirements로 approval, sandbox, permission profile 강제 가능 | provider/model/network/auth도 requirements family로 승격 |
| File system and shell access 모델 | project-local config provider override는 denylist로 차단됨 | shell/env를 통한 직접 API key 사용은 policy와 network egress로 별도 차단 필요 |
| Context management | context와 transcript 경계는 별도 연구 필요 | gateway가 DLP/redaction을 하더라도 runtime transcript 변조는 금지 |
| Streaming/event model | provider streaming은 normalized event path로 들어간다 | gateway도 Responses-compatible streaming contract를 유지 |
| Transcript/session persistence | config, thread config, event history가 분리됨 | 어떤 provider/model policy가 적용됐는지 session metadata/event로 남긴다 |
| Runtime/harness separation | app-server는 effective config와 origins를 surface함 | UI는 selector가 아니라 server catalog projection만 보여준다 |
| Configuration/extension model | user/project/session/cloud/admin config layer가 공존 | model provider requirements를 추가해 extension freedom을 enterprise mode에서 제한 |
| Testing strategy | fake provider/fake tools를 쓸 수 있는 구조 | fake company gateway와 fake malicious provider config로 deterministic tests 추가 |
| Failure handling | missing provider는 config error가 됨 | missing enterprise policy는 fail-closed managed startup error가 됨 |
| Human intervention, steering, approval flow | approval reviewer와 permission prompts는 requirements로 제약 가능 | 모델/provider 변경은 인간 승인으로 풀지 않고 server policy로만 변경 |
| Multi-agent boundary | thread config/session flags가 provider를 내려줄 수 있음 | sub-agent도 동일 gateway/provider requirements를 상속해야 함 |

## Minimal Implementation Plan

1. ADR: "Company gateway is the only client-visible model provider"를 accepted decision으로 기록한다.
2. Requirements schema: `model_provider_requirements`를 config requirements에 추가한다.
3. Config enforcement: provider merge/selection 단계에서 requirements를 검증하고, 위반 시 명확한 error를 낸다.
4. App-server projection: effective config, origins, provider requirements, overridden/rejected status를 UI가 볼 수 있게 한다.
5. Gateway provider: built-in `company-gateway` 또는 enterprise-managed provider entry를 추가한다.
6. Network policy: `managed_allowed_domains_only`를 켜고 company gateway/auth domain만 allow한다.
7. Auth hardening: enterprise mode에서 user env/API key/custom command provider auth를 금지한다.
8. Tests: fake gateway, malicious user provider, project override, network direct egress, server unavailable fail-closed fixtures를 추가한다.

## Test Matrix To Add

| Scenario | Expected |
| --- | --- |
| user config sets `model_provider = "openai"` under enterprise requirements | rejected or overridden with explicit metadata |
| user config defines `[model_providers.attacker]` with OpenAI public base URL | rejected |
| project `.codex/config.toml` sets provider | rejected by existing project-local denylist |
| remote thread config selects `company-gateway` and supplies provider entry | accepted |
| remote thread config selects unallowed provider | rejected |
| gateway catalog returns allowed model | accepted |
| user manually chooses unallowed model | rejected |
| network request to `api.openai.com` | denied |
| network request to `agent.company.example` | allowed |
| enterprise bundle unavailable for managed account | fail closed |
| unmanaged developer mode without enterprise requirements | existing custom provider behavior remains unless separately disabled |

## Open Questions

- 회사 gateway가 모델 identity를 UI에 어느 정도 노출해야 하는가: vendor name까지 보여줄지, capability tier만 보여줄지 결정이 필요하다.
- dev/offline mode가 필요한가. 필요하다면 "enterprise-managed production mode"와 "unmanaged local research mode"를 명확히 분리해야 한다.
- Bedrock/Azure/private model을 gateway 뒤에 숨길 때 latency, regional residency, audit log ownership을 어디서 보장할지 정해야 한다.
- upstream Codex와의 rebase 비용을 줄이려면 provider requirements를 general upstream-worthy feature로 설계할지, internal fork patch로 둘지 선택해야 한다.

## Implications For This Repo

- 이 repo의 runtime prototype도 provider diversity를 core client concern으로 넓히기보다, provider-neutral gateway contract를 먼저 정의하는 편이 낫다.
- permission model과 provider policy를 같은 gate로 섞으면 안 된다. permission은 tool/sandbox action gate, provider policy는 config/server-supply gate로 분리한다.
- deterministic tests는 live LLM/provider가 아니라 fake gateway와 fake requirements bundle로 검증해야 한다.
- "작성했다"와 "검증됐다"를 구분해야 하므로, 다음 단계는 ADR 작성 또는 small fork patch spike 중 하나로 분리한다.
