---
type: Layer Analysis
title: L08 Trajectory
description: Cross-project analysis of session trajectory, event logs, checkpoints, resume, fork, and replay.
tags: [research/layers, layer/l08, trajectory, event-log, replay]
status: draft
change_policy: curated
derived_from:
  - 01_sources/index.md
  - docs/design/P00-target-loop-contract.md
  - docs/research/layers/P00-agent-loop-evaluation.md
---

# L08 trajectory

## Metadata

- Date: 2026-06-19
- Analyst: Codex
- Source cards:
  - `01_sources/open-source/github/openai__codex/2026-06-19/source-card.md`
  - `01_sources/open-source/github/nousresearch__hermes-agent/2026-06-19/source-card.md`
  - `01_sources/open-source/github/xiaomimimo__mimo-code/2026-06-19/source-card.md`
  - `01_sources/open-source/github/moonshotai__kimi-cli/2026-06-19/source-card.md`
- Repository snapshots:
  - `work/external-repos/openai__codex`
  - `work/external-repos/nousresearch__hermes-agent`
  - `work/external-repos/xiaomimimo__mimo-code`
  - `work/external-repos/moonshotai__kimi-cli`

## Layer Definition

- 역할: 한 turn 또는 여러 turn 동안 발생한 입력, 모델 응답, 도구 호출, 승인, 오류, 압축, 재개, 포크, 최종 결과를 나중에 재생하거나 검증할 수 있는 trajectory로 보존한다.
- 포함되는 것: session/thread id, event log, transcript, model-context history, tool-call/result pairing, checkpoints, compaction summaries, resume/fork metadata, rollback/revert metadata, audit/debug view.
- 제외되는 것: 어떤 컨텍스트를 모델에 넣을지 결정하는 정책 자체는 L02, 모델 provider 호출은 L03, tool-call 문법 검증은 L04, 실제 도구 실행은 L05, 승인 판단은 L06, 화면 표시용 렌더링 모델은 L07/L12이다.
- 헷갈리기 쉬운 경계:
  - L02 active-context는 trajectory에서 읽어 모델 입력을 조립한다. L08은 원장과 재생 가능한 기록을 제공한다.
  - L07 observation-ir은 화면에 보여줄 중간 표현을 만든다. L08은 그 표현의 원본 사건과 순서를 보존한다.
  - L09 verification은 trajectory를 읽어 완료 주장과 불변식을 감사한다. L08이 자기 자신을 최종 판정하지 않는다.

## Analysis Method

- Search terms: `rollout`, `session`, `history`, `checkpoint`, `compaction`, `reconstruct`, `resume`, `fork`, `wire`, `jsonl`, `event`, `replay`, `tool_result`.
- Files inspected:
  - openai/codex: `codex-rs/core/src/rollout.rs`, `thread_manager.rs`, `thread_rollout_truncation.rs`, `session/rollout_reconstruction.rs`
  - NousResearch/hermes-agent: `hermes_state.py`, `agent/conversation_loop.py`, `website/docs/developer-guide/agent-loop.md`
  - XiaomiMiMo/MiMo-Code: `packages/opencode/src/session/*.ts`, `packages/opencode/src/sync/*.ts`, `README.md`
  - MoonshotAI/kimi-cli: `src/kimi_cli/soul/context.py`, `session.py`, `session_state.py`, `wire/file.py`, `wire/types.py`
- Evidence rules:
  - 확인한 사실은 파일 경로와 line range로 표시한다.
  - 이름만 비슷한 모듈은 L08로 확정하지 않는다. 저장/재생/재개/포크/압축 동작이 확인되어야 한다.
  - “좋아 보인다”는 평가는 Codex의 해석으로 분리한다.
- Confidence levels:
  - high: 코드에서 저장 구조와 재개/재생 동작을 직접 확인.
  - medium: 문서 또는 타입 정의는 확인했으나 실제 호출 경로 일부가 남음.
  - low: 후보 파일만 확인했고 동작 증거가 부족함.

## Cross-Project Matrix

| Project | Storage Unit | Persisted Records | Resume/Fork/Rebuild | Event Model | Verification Implication | Evidence | Confidence | Open Questions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| openai/codex | thread rollout, thread store | `RolloutItem`, `ResponseItem`, `EventMsg`, `SessionMeta`, `TurnContext` | rollout을 역방향 스캔해 replacement history와 surviving tail을 재생해 history를 재구성한다. fork는 user-message boundary 또는 interrupted snapshot을 기준으로 자른다. | rollout recorder와 `EventMsg` 중심 | append-only 원장 위에서 재구성해야 하며 rollback/compaction/interrupt marker를 해석해야 한다. | `rollout.rs:1-24`, `thread_manager.rs:113-149`, `thread_rollout_truncation.rs:27-160`, `rollout_reconstruction.rs:101-111`, `150-253`, `274-352` | high | `codex_rollout` crate 내부 저장 포맷과 압축 worker 세부 구현은 추가 확인 필요. |
| NousResearch/hermes-agent | SQLite `state.db` | `sessions`, `messages`, FTS tables, parent session lineage, system prompt, token/cost counters | compression 후 child session을 만들고 resume target을 compression tip으로 redirect한다. `/resume`과 `hermes chat --resume` 경로를 문서화한다. | DB row 중심 transcript; loop finalizer에서 turn 결과 저장 | 검색성과 lineage는 강하지만 transcript rewrite가 원장성을 약화시킬 수 있어 rewrite evidence가 필요하다. | `hermes_state.py:514-570`, `601-653`, `2423-2660`, `2860-2970`, `agent-loop.md:199-219` | high | `finalize_turn`의 정확한 persist order, inactive message audit view의 UI 노출 범위 확인 필요. |
| XiaomiMiMo/MiMo-Code | SQLite session/message/part tables + optional sync event log | `SessionTable`, `MessageTable`, `PartTable`, `EventTable`, checkpoint/compaction/retry parts | session fork가 기존 message/part를 복제하고, checkpoint/compaction part가 모델 메시지 변환 시 summary marker로 재삽입된다. parent context는 watermark로 제한된다. | `SyncEvent` with aggregate seq; projectors materialize tables | event seq와 projector가 있으면 replay 검증에 강하다. 동시에 message/part projection과 event log의 일관성 검사가 필요하다. | `session.sql.ts:14-84`, `sync/index.ts:104-193`, `240-248`, `session.ts:122-239`, `435-632`, `message-v2.ts:490-539`, `978-1012`, `boundary.ts:29-77` | high | experimental workspace flag가 꺼진 경우 event log persist 범위와 production 기본값 확인 필요. |
| MoonshotAI/kimi-cli | session directory | `context.jsonl`, `wire.jsonl`, `state.json` | context file은 `_system_prompt`, `_checkpoint`, `_usage`, message를 순차 적용해 restore한다. revert는 context file을 rotate하고 checkpoint 전까지만 새 파일에 쓴다. wire file은 Turn/Step/Tool/Approval/Compaction 이벤트를 JSONL envelope로 보존한다. | context log와 wire event log를 분리 | 사람이 보는 playback과 모델 context 복원이 분리되어 설계가 명료하다. 다만 두 파일 간 cross-reference 검증이 필요하다. | `context.py:20-65`, `91-133`, `135-200`, `232-248`, `276-339`, `session.py:22-82`, `130-224`, `wire/file.py:18-40`, `95-132`, `wire/types.py:37-63`, `516-661` | high | wire event와 context message 간 id 매칭/불일치 복구 정책 확인 필요. |

## Project Notes

### openai/codex

Confirmed facts:

- `rollout.rs`는 `RolloutRecorder`, `SessionMeta`, `ThreadItem`, thread path lookup 같은 rollout 관련 API를 re-export한다. `RolloutConfigView`는 `codex_home`, `sqlite_home`, `cwd`, model provider id, memory generation flag를 rollout 설정에 제공한다. Evidence: `work/external-repos/openai__codex/codex-rs/core/src/rollout.rs:1-46`.
- 새 thread는 첫 event인 `SessionConfigured`를 포함한다. fork snapshot은 `TruncateBeforeNthUserMessage`와 `Interrupted` 두 축을 갖고, mid-turn snapshot이면 실제 interrupt와 같은 `<turn_aborted>` marker를 붙이는 정책이 있다. Evidence: `work/external-repos/openai__codex/codex-rs/core/src/thread_manager.rs:113-149`.
- rollout truncation은 `ResponseItem::Message`를 user-turn boundary로 해석하고, `ThreadRolledBack` marker를 반영한다. Evidence: `work/external-repos/openai__codex/codex-rs/core/src/thread_rollout_truncation.rs:27-55`.
- `reconstruct_history_from_rollout`은 최신 surviving replacement history와 resume metadata를 찾기 위해 rollout을 newest-to-oldest로 스캔하고, tail은 다시 forward replay한다. Evidence: `work/external-repos/openai__codex/codex-rs/core/src/session/rollout_reconstruction.rs:101-111`.

Codex interpretation:

- Codex형 L08의 핵심은 “저장된 transcript를 그대로 믿기”보다 “rollout 원장에서 유효 history view를 재구성하기”이다.
- fork/rollback/interrupt가 모두 trajectory semantics에 들어간다. 따라서 우리 repo의 L08 계약도 단순 `messages[]` 저장만으로는 부족하다.

### NousResearch/hermes-agent

Confirmed facts:

- `hermes_state.py`는 SQLite 기반 session storage를 설명하며, JSONL 대신 session metadata, full message history, model config, FTS5, parent session chain 등을 저장한다고 문서화한다. Evidence: `work/external-repos/nousresearch__hermes-agent/hermes_state.py:1-15`.
- `sessions` table은 `parent_session_id`, token/cost counters, handoff, rewind, archived 등의 metadata를 갖고, `messages` table은 role/content/tool calls/reasoning/platform id/active flag를 갖는다. Evidence: `work/external-repos/nousresearch__hermes-agent/hermes_state.py:514-570`.
- FTS5와 trigram FTS trigger가 message content, tool name, tool calls를 색인한다. Evidence: `work/external-repos/nousresearch__hermes-agent/hermes_state.py:601-653`.
- `append_message`는 structured fields를 JSON으로 serialize하고 message/tool counters를 갱신한다. `get_messages`는 insertion order를 위해 timestamp가 아니라 autoincrement id로 정렬한다. Evidence: `work/external-repos/nousresearch__hermes-agent/hermes_state.py:2423-2660`.
- compression child session 때문에 resume target을 descendant tip으로 redirect하는 helper가 있다. Evidence: `work/external-repos/nousresearch__hermes-agent/hermes_state.py:2860-2941`.
- developer guide는 compression이 memory flush, middle summary, protected last N, tool call/result pair 보존, child session lineage를 수행한다고 설명한다. Evidence: `work/external-repos/nousresearch__hermes-agent/website/docs/developer-guide/agent-loop.md:199-219`.

Codex interpretation:

- Hermes형 L08은 검색 가능한 운영 DB에 강하다. 장기 운영, 다중 UI, resume 검색에는 좋지만, transcript rewrite와 soft delete가 들어가므로 verifier는 “현재 active view”와 “audit/debug view”를 분리해서 봐야 한다.

### XiaomiMiMo/MiMo-Code

Confirmed facts:

- README는 project memory, session checkpoint, scratch notes, task progress를 persistent memory로 설명하고, resume 시 memory가 자동 주입된다고 말한다. Evidence: `work/external-repos/xiaomimimo__mimo-code/README.md:67-82`.
- session table은 `parent_id`, `context_from`, `context_watermark`, permission, revert, compacting/archive time, `last_checkpoint_message_id`를 가진다. message와 part는 별도 table이다. Evidence: `work/external-repos/xiaomimimo__mimo-code/packages/opencode/src/session/session.sql.ts:14-84`.
- `SyncEvent`는 event type/version/aggregate/schema를 정의하고, replay 시 aggregate별 seq mismatch를 검사한다. Evidence: `work/external-repos/xiaomimimo__mimo-code/packages/opencode/src/sync/index.ts:13-31`, `169-193`.
- message event는 `message.updated`, `message.removed`, `message.part.updated`, `message.part.removed`로 분리된다. Evidence: `work/external-repos/xiaomimimo__mimo-code/packages/opencode/src/session/message-v2.ts:490-539`.
- checkpoint/compaction part는 모델 메시지 변환에서 “Summary of previous conversation...” 텍스트로 재삽입된다. Evidence: `work/external-repos/xiaomimimo__mimo-code/packages/opencode/src/session/message-v2.ts:705-716`.
- fork는 새 session을 만들고 원본 message/part를 새 id로 복제한다. Evidence: `work/external-repos/xiaomimimo__mimo-code/packages/opencode/src/session/session.ts:598-632`.
- boundary adjustment는 tool_use/tool_result pair가 summary/tail 경계에서 찢어지지 않도록 boundary를 뒤로 이동한다. Evidence: `work/external-repos/xiaomimimo__mimo-code/packages/opencode/src/session/boundary.ts:29-77`.

Codex interpretation:

- MiMo형 L08은 “event-sourced 원장 + materialized tables”에 가깝다. 우리가 더 나은 구현을 목표로 한다면, 초기 JSONL 다음 단계에서 이 구조가 가장 강한 후보이다.
- message와 part 분리는 사람이 보는 transcript, 모델 입력, UI delta, checkpoint marker를 같은 message 아래에서 구조적으로 다루게 한다.

### MoonshotAI/kimi-cli

Confirmed facts:

- `Context`는 `context.jsonl`을 line-by-line restore하며 `_system_prompt`, `_usage`, `_checkpoint`, 일반 message record를 적용한다. Evidence: `work/external-repos/moonshotai__kimi-cli/src/kimi_cli/soul/context.py:20-65`, `276-339`.
- system prompt는 context file 첫 record로 쓰며, 기존 file에 prepend할 때 임시 파일을 써 atomic replace를 한다. Evidence: `work/external-repos/moonshotai__kimi-cli/src/kimi_cli/soul/context.py:91-121`.
- checkpoint는 `_checkpoint` record를 append하고, 필요하면 user message `CHECKPOINT <id>`도 append한다. revert는 원본 context file을 rotate하고 checkpoint 이전 record만 새 file에 쓴다. Evidence: `work/external-repos/moonshotai__kimi-cli/src/kimi_cli/soul/context.py:123-200`.
- session은 `context.jsonl`, `wire.jsonl`, `state.json`을 session directory에 둔다. `is_empty`는 wire file과 context history를 함께 본다. Evidence: `work/external-repos/moonshotai__kimi-cli/src/kimi_cli/session.py:22-82`, `130-224`.
- wire file은 첫 line metadata와 timestamped envelope record를 JSONL로 append한다. Evidence: `work/external-repos/moonshotai__kimi-cli/src/kimi_cli/wire/file.py:18-40`, `95-132`.
- wire event union에는 TurnBegin, SteerInput, TurnEnd, StepBegin, StepInterrupted, StepRetry, CompactionBegin/End, StatusUpdate, content/tool events, ApprovalResponse, SubagentEvent 등이 포함된다. Evidence: `work/external-repos/moonshotai__kimi-cli/src/kimi_cli/wire/types.py:37-63`, `516-540`.

Codex interpretation:

- Kimi형 L08의 강점은 파일 기반으로 이해하기 쉽고, 모델 context log와 UI/event wire log를 분리한다는 점이다.
- 초기 제품에서는 SQLite보다 이 분리가 더 빠르게 작동한다. 다만 큰 프로젝트 검색성과 cross-session query는 Hermes/MiMo식 DB 색인이 나중에 필요하다.

## Common Patterns

- Trajectory는 단순 transcript가 아니다. 최소한 turn, step, model output, tool call, tool result, approval, retry, compaction, interrupt, terminal state를 담아야 한다.
- resume/fork는 저장 파일을 그대로 이어 붙이는 일이 아니다. 각 프로젝트는 boundary, lineage, checkpoint, rollback, compression tip 같은 별도 semantics를 둔다.
- tool-call/result pairing은 L08의 핵심 불변식이다. pair가 찢어진 history는 다음 모델 요청에서 실패하거나 verifier가 신뢰할 수 없는 증거가 된다.
- 사람이 읽는 view와 모델에 넣는 view는 달라진다. Codex는 rollout에서 history를 재구성하고, Kimi는 `context.jsonl`과 `wire.jsonl`을 분리하며, MiMo는 message/part를 model message로 변환한다.
- 장기 운영은 검색 가능한 저장소를 요구한다. Hermes와 MiMo는 SQLite/FTS/event seq로 그 방향을 보여준다.

## Differences

- openai/codex: rollout 원장과 replay/reconstruction이 강하다. 시스템적으로 견고하지만 구현 복잡도가 높다.
- Hermes: SQLite transcript/search/lineage가 강하다. 운영 DB로 좋지만 rewrite/soft-delete audit 규칙이 필요하다.
- MiMo-Code: event seq + projector + message/part 분리가 가장 구조적이다. “더 나은 구현”의 장기 target에 가깝다.
- Kimi CLI: JSONL context/wire 분리가 단순하고 학습하기 쉽다. 첫 vertical slice에 적합하다.

## Boundary Notes

- L08 vs L02: L08은 저장된 trajectory와 checkpoint를 제공한다. L02는 그중 무엇을 모델 context로 주입할지 결정한다.
- L08 vs L03: L08은 provider request/response evidence를 기록할 수 있지만, retry/backoff/auth/provider adapter는 L03이다.
- L08 vs L06: 승인 request/response는 trajectory에 남아야 한다. 어떤 action에 승인이 필요한지는 L06이다.
- L08 vs L07/L12: wire/display event는 L08에 저장될 수 있지만, 화면용 rendering과 theme는 L12이다.
- L08 vs L09: L08은 증거를 남긴다. L09는 그 증거를 읽어 통과/실패를 판정한다.

## Target Contract For This Repo

### First Implementation Shape

초기 구현은 SQLite가 아니라 JSONL 두 파일로 시작한다.

```text
runs/<run-id>/
  event-log.jsonl
  context-log.jsonl
  turn-report.json
  verification-report.json
```

- `event-log.jsonl`: 사람/검증자/표면이 재생할 사건 원장. Kimi의 `wire.jsonl`과 Codex rollout에 가까운 역할.
- `context-log.jsonl`: L02가 모델 입력 history를 재구성할 때 읽는 기록. Kimi의 `context.jsonl`에 가까운 역할.
- `turn-report.json`: runtime이 만든 결과 요약. 단독 신뢰 금지.
- `verification-report.json`: L09 verifier가 event/context log에서 독립 판정한 결과.

### Minimum Event Envelope

```ts
type TrajectoryEvent = {
  runId: string;
  turnId: string;
  seq: number;
  at: string;
  type: string;
  payload: Record<string, unknown>;
};
```

Rules:

- `seq`는 run 안에서 단조 증가한다.
- terminal event는 `TurnCompleted | TurnInterrupted | TurnFailed | WaitingForApproval` 중 하나다.
- tool request와 result는 같은 `toolCallId`를 공유해야 한다.
- interrupted turn은 중단 marker를 남긴다.
- compaction/checkpoint는 어떤 message/event 범위를 덮는지 명시한다.
- derived report는 event log를 대체하지 않는다.

### Why L08 Before Model Proxy

모델 proxy(L03)를 먼저 붙이면 provider별 request/response가 생기지만, 그것을 신뢰할 수 있게 남기는 원장이 없다.

L08을 먼저 세우면 다음이 가능하다.

- fake model/fake tool vertical slice도 재생 가능해진다.
- 실제 model client를 붙일 때 request/response evidence 위치가 정해진다.
- 실패 재현이 쉬워진다.
- verifier가 loop 내부 자기판정이 아니라 event evidence를 읽을 수 있다.

## Verification Rules For L08

- Event sequence has no gaps or duplicate `seq`.
- Each turn has exactly one terminal event unless it is explicitly waiting for approval.
- Every `ToolCallRequested` has one matching `ToolCompleted`, `ToolFailed`, or `PermissionRequested`.
- No model-context view contains orphaned tool result or orphaned assistant tool call.
- Compaction/checkpoint records declare covered range and preserved tail boundary.
- Resume reconstructs the same visible transcript from event/context logs.
- Final report cites evidence paths, not only final assistant text.

## Next Implementation Step

1. Add `src/contracts/trajectory.ts` with `TrajectoryEvent`, `ContextRecord`, `TrajectoryStore`, and pairing invariants.
2. Replace or wrap `InMemoryEventLog` with append-only JSONL store under `runs/<run-id>/`.
3. Extend `verify-turn-report.ts` to verify event sequence, terminal state, and tool-call/result pairing.
4. Keep SQLite out of the first slice. Revisit SQLite after JSONL replay and verifier evidence work.

