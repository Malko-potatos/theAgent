#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
TODAY="$(date +%F)"
ORIGINAL_ARGS=("$@")

usage() {
  cat <<'USAGE'
Usage:
  scripts/analyze-layer.sh <owner/repo|repo-path> <axis-or-layer-id> [options]

Examples:
  scripts/analyze-layer.sh openai/codex P00 --source-path work/external-repos/openai__codex
  scripts/analyze-layer.sh openai/codex L01 --source-path work/external-repos/openai__codex
  scripts/analyze-layer.sh work/external-repos/openai__codex L01

Options:
  --source-path <path>   Existing local checkout to analyze.
  --repo-url <url>       Canonical repository URL for the run log.
  --allow-outside-root   Allow analysis of a local checkout outside this repo root.
  --allow-source-index-state
                         Allow CodeGraph to create/update index state in source path.
  --skip-codegraph       Do not run CodeGraph even if installed.
  --skip-graphify        Do not run Graphify even if installed.
  -h, --help             Show this help.

Policy:
  This script does not clone, install dependencies, or modify external services.
  It writes analysis outputs under work/analysis/ and run evidence under runs/.
  CodeGraph may create/update .codegraph/ inside work/external-repos checkouts.
USAGE
}

die() {
  printf 'error: %s\n' "$*" >&2
  exit 1
}

slugify_repo() {
  local value="$1"
  value="${value#https://github.com/}"
  value="${value%.git}"
  value="${value%/}"
  value="${value//\//__}"
  value="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')"
  printf '%s' "$value"
}

layer_name() {
  case "$1" in
    P00|p00) printf 'P00-agent-loop-orchestrator' ;;
    L01|l01) printf 'L01-intent-intake' ;;
    L02|l02) printf 'L02-active-context' ;;
    L03|l03) printf 'L03-model-client' ;;
    L04|l04) printf 'L04-action-grammar' ;;
    L05|l05) printf 'L05-tool-harness' ;;
    L06|l06) printf 'L06-approval-policy' ;;
    L07|l07) printf 'L07-observation-ir' ;;
    L08|l08) printf 'L08-trajectory' ;;
    L09|l09) printf 'L09-verification' ;;
    L10|l10) printf 'L10-config-governance' ;;
    L11|l11) printf 'L11-extensibility' ;;
    L12|l12) printf 'L12-surface' ;;
    *) die "unknown layer id: $1" ;;
  esac
}

default_queries() {
  case "$1" in
    P00-agent-loop-orchestrator)
      cat <<'QUERIES'
where is the main agent loop, turn loop, or orchestration state machine implemented?
turn start model call tool call loop stop condition abort resume retry event append
how does a user turn move through context building, model streaming, tool execution, approval, and persistence?
QUERIES
      ;;
    L01-intent-intake)
      cat <<'QUERIES'
where does raw user input enter the system and become a normalized request, command, message, or task?
CLI prompt input command router slash command parser message normalization
session start user prompt command routing intent intake
QUERIES
      ;;
    L02-active-context)
      cat <<'QUERIES'
where is context assembled before the model request?
skills recent conversation memory system prompt context builder
QUERIES
      ;;
    L03-model-client)
      cat <<'QUERIES'
where is the LLM or model client created, configured, authenticated, retried, and called?
model client provider adapter authentication retry stream completion request
QUERIES
      ;;
    L04-action-grammar)
      cat <<'QUERIES'
where are tool calls, command syntax, schemas, function calls, or model actions parsed and validated?
tool call schema grammar command validation function call parser
QUERIES
      ;;
    L05-tool-harness)
      cat <<'QUERIES'
where are tools executed, sandboxed, timed out, streamed, or wrapped as observable effects?
tool executor sandbox shell command timeout process environment filesystem
QUERIES
      ;;
    L06-approval-policy)
      cat <<'QUERIES'
where are risky actions checked, approved, denied, or escalated to the user?
approval permission policy allow deny ask confirmation risk
QUERIES
      ;;
    L07-observation-ir)
      cat <<'QUERIES'
where are model or tool results converted into UI-friendly events, observations, messages, or display blocks?
observation event render message block tool result ui display
QUERIES
      ;;
    L08-trajectory)
      cat <<'QUERIES'
where are conversations, transcripts, sessions, trajectories, checkpoints, or event logs persisted and replayed?
trajectory transcript session history checkpoint event log replay resume
QUERIES
      ;;
    L09-verification)
      cat <<'QUERIES'
where are tests, builds, lint, validation, review, audit, or completion checks run?
verify verification test lint build audit review check validation
QUERIES
      ;;
    L10-config-governance)
      cat <<'QUERIES'
where are config, settings, policies, profiles, credentials, permissions, or snapshots loaded and governed?
config settings policy profile credential permission snapshot governance
QUERIES
      ;;
    L11-extensibility)
      cat <<'QUERIES'
where are skills, plugins, MCP servers, hooks, extensions, subagents, or custom tools registered?
skill plugin extension hook mcp subagent registry custom tool
QUERIES
      ;;
    L12-surface)
      cat <<'QUERIES'
where are TUI, CLI, web, daemon, IDE, theme, rendering, or user-facing surfaces implemented?
tui cli web daemon ide surface render theme terminal
QUERIES
      ;;
    *)
      cat <<QUERIES
where is ${1} implemented?
architecture layer ${1} entry points modules boundaries
QUERIES
      ;;
  esac
}

candidate_regex() {
  case "$1" in
    P00-agent-loop-orchestrator) printf 'agent loop|orchestrator|orchestration|turn|run loop|state machine|model call|tool call|stop condition|abort|resume|retry|event append' ;;
    L01-intent-intake) printf 'intent|intake|prompt|input|command|slash|router|parse|message|session start|user' ;;
    L02-active-context) printf 'context|skill|memory|history|system prompt|instructions|recent|conversation' ;;
    L03-model-client) printf 'model|provider|client|auth|retry|stream|completion|request' ;;
    L04-action-grammar) printf 'tool call|schema|grammar|command|validation|function call|parser' ;;
    L05-tool-harness) printf 'tool|executor|sandbox|shell|timeout|process|environment|filesystem' ;;
    L06-approval-policy) printf 'approval|permission|policy|allow|deny|ask|confirmation|risk' ;;
    L07-observation-ir) printf 'observation|event|render|message|block|tool result|display' ;;
    L08-trajectory) printf 'trajectory|transcript|session|history|checkpoint|event log|replay|resume' ;;
    L09-verification) printf 'verify|verification|test|lint|build|audit|review|check|validation' ;;
    L10-config-governance) printf 'config|settings|policy|profile|credential|permission|snapshot|governance' ;;
    L11-extensibility) printf 'skill|plugin|extension|hook|mcp|subagent|registry|custom tool' ;;
    L12-surface) printf 'tui|cli|web|daemon|ide|surface|render|theme|terminal' ;;
    *) printf 'architecture|layer|entry|module|boundary' ;;
  esac
}

layer_definition() {
  case "$1" in
    P00-agent-loop-orchestrator) printf 'Observation axis for the time-ordered agent loop: turn/session start, context build, model call, tool-call cycle, approval, persistence, stop, abort, retry, resume, and replay touchpoints.' ;;
    L01-intent-intake) printf 'Normalize user input into a system-understandable request, command, message, or task.' ;;
    L02-active-context) printf 'Assemble the context delivered to the model, including agent rules, skills, recent conversation, memory, and retrieved material.' ;;
    L03-model-client) printf 'Communicate with the LLM, including auth, provider adapters, retries, streaming, and request/response normalization.' ;;
    L04-action-grammar) printf 'Validate the grammar and schema of model-requested actions or tool calls before execution.' ;;
    L05-tool-harness) printf 'Manage real tool execution, side effects, sandboxing, process lifecycle, and result capture.' ;;
    L06-approval-policy) printf 'Decide when risky actions require user approval and route approval decisions.' ;;
    L07-observation-ir) printf 'Convert model/tool results into intermediate observations suitable for surfaces and logs.' ;;
    L08-trajectory) printf 'Persist conversations, context schemas, sessions, trajectories, event logs, and replayable views.' ;;
    L09-verification) printf 'Audit architecture, builds, tests, and completion claims across layers.' ;;
    L10-config-governance) printf 'Provide settings, permissions, policies, credentials, profiles, and snapshots safely across the system.' ;;
    L11-extensibility) printf 'Connect external skills, plugins, hooks, MCP servers, and subagents.' ;;
    L12-surface) printf 'Render the user-facing surface such as TUI, web, daemon, IDE, theme, and interaction affordances.' ;;
    *) printf 'Unknown layer definition.' ;;
  esac
}

REPO_REF=""
LAYER_ID=""
SOURCE_PATH=""
REPO_URL=""
ALLOW_OUTSIDE_ROOT=0
ALLOW_SOURCE_INDEX_STATE=0
SKIP_CODEGRAPH=0
SKIP_GRAPHIFY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --source-path)
      SOURCE_PATH="${2:-}"
      [[ -n "$SOURCE_PATH" ]] || die "--source-path requires a value"
      shift 2
      ;;
    --repo-url)
      REPO_URL="${2:-}"
      [[ -n "$REPO_URL" ]] || die "--repo-url requires a value"
      shift 2
      ;;
    --allow-outside-root)
      ALLOW_OUTSIDE_ROOT=1
      shift
      ;;
    --allow-source-index-state)
      ALLOW_SOURCE_INDEX_STATE=1
      shift
      ;;
    --skip-codegraph)
      SKIP_CODEGRAPH=1
      shift
      ;;
    --skip-graphify)
      SKIP_GRAPHIFY=1
      shift
      ;;
    --*)
      die "unknown option: $1"
      ;;
    *)
      if [[ -z "$REPO_REF" ]]; then
        REPO_REF="$1"
      elif [[ -z "$LAYER_ID" ]]; then
        LAYER_ID="$1"
      else
        die "unexpected argument: $1"
      fi
      shift
      ;;
  esac
done

[[ -n "$REPO_REF" ]] || die "missing repository reference"
[[ -n "$LAYER_ID" ]] || die "missing layer id"

LAYER_SLUG="$(layer_name "$LAYER_ID")"
REPO_SLUG="$(slugify_repo "$REPO_REF")"

if [[ -z "$SOURCE_PATH" ]]; then
  if [[ -d "$REPO_REF" ]]; then
    SOURCE_PATH="$REPO_REF"
  else
    SOURCE_PATH="$ROOT_DIR/work/external-repos/$REPO_SLUG"
  fi
fi

if [[ -z "$REPO_URL" && "$REPO_REF" == */* && "$REPO_REF" != .* && "$REPO_REF" != /* ]]; then
  REPO_URL="https://github.com/$REPO_REF"
fi

[[ -d "$SOURCE_PATH" ]] || die "source path does not exist: $SOURCE_PATH"
SOURCE_ABS="$(cd "$SOURCE_PATH" && pwd)"
SOURCE_PHYSICAL="$(cd "$SOURCE_PATH" && pwd -P)"

if [[ -d "$REPO_REF" ]]; then
  REPO_SLUG="$(slugify_repo "$(basename "$SOURCE_ABS")")"
fi

case "$SOURCE_PHYSICAL" in
  "$ROOT_DIR"|"$ROOT_DIR"/*) ;;
  *)
    [[ "$ALLOW_OUTSIDE_ROOT" -eq 1 ]] || die "source path is outside this repo root; pass --allow-outside-root only after approval"
    ;;
esac

ANALYSIS_DIR="$ROOT_DIR/work/analysis/$REPO_SLUG/$LAYER_SLUG"
RUN_LOG="$ROOT_DIR/runs/$TODAY-$REPO_SLUG-$LAYER_SLUG.md"
DRAFT="$ANALYSIS_DIR/layer-draft.md"
QUERIES_FILE="$ANALYSIS_DIR/queries.md"
CANDIDATES_FILE="$ANALYSIS_DIR/candidate-files.md"
RG_MATCHES_FILE="$ANALYSIS_DIR/rg-matches.txt"
CODEGRAPH_FILE="$ANALYSIS_DIR/codegraph-results.txt"
GRAPHIFY_FILE="$ANALYSIS_DIR/graphify-results.txt"
mkdir -p "$ANALYSIS_DIR" "$ROOT_DIR/docs/research/layers"

COMMIT_SHA="not-a-git-repo"
if git -C "$SOURCE_PATH" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  COMMIT_SHA="$(git -C "$SOURCE_PATH" rev-parse HEAD)"
fi

{
  printf '# Layer Analysis Run\n\n'
  printf '## Target\n\n'
  printf -- '- Repository: `%s`\n' "$REPO_REF"
  printf -- '- Repository URL: %s\n' "${REPO_URL:-unknown}"
  printf -- '- Source path: `%s`\n' "$SOURCE_PATH"
  printf -- '- Physical source path: `%s`\n' "$SOURCE_PHYSICAL"
  printf -- '- Layer: `%s`\n' "$LAYER_SLUG"
  printf -- '- Layer definition: %s\n' "$(layer_definition "$LAYER_SLUG")"
  printf -- '- Commit: `%s`\n\n' "$COMMIT_SHA"
  printf '## Commands\n\n'
  printf -- '- Script: `scripts/analyze-layer.sh'
  for arg in "${ORIGINAL_ARGS[@]}"; do
    printf ' %q' "$arg"
  done
  printf '`\n'
  printf '\n## Tool Versions\n\n'
  if command -v codegraph >/dev/null 2>&1; then
    printf -- '- CodeGraph: `%s`\n' "$(codegraph --version 2>/dev/null || codegraph version 2>/dev/null || printf 'version unavailable')"
  else
    printf -- '- CodeGraph: not found\n'
  fi
  if command -v graphify >/dev/null 2>&1; then
    printf -- '- Graphify CLI: `%s`\n' "$(graphify --version 2>/dev/null || printf 'version unavailable')"
  else
    printf -- '- Graphify CLI: not found\n'
  fi
  printf '\n## Tool Runs\n\n'
} > "$RUN_LOG"

{
  printf '# Search Queries\n\n'
  printf 'Generated by `scripts/analyze-layer.sh` for `%s`.\n\n' "$LAYER_SLUG"
  printf 'Layer definition: %s\n\n' "$(layer_definition "$LAYER_SLUG")"
  printf '## Search Queries\n\n'
  default_queries "$LAYER_SLUG" | while IFS= read -r query; do
    [[ -n "$query" ]] && printf -- '- %s\n' "$query"
  done
} > "$QUERIES_FILE"

{
  printf '# Candidate Files\n\n'
  printf 'Generated by `scripts/analyze-layer.sh`. These are discovery candidates, not final evidence.\n\n'
  printf '## Regex\n\n'
  printf '`%s`\n\n' "$(candidate_regex "$LAYER_SLUG")"
  printf '## Ranked Files\n\n'
  if command -v rg >/dev/null 2>&1; then
    (cd "$SOURCE_PATH" && rg -n -i --glob '!.git/' --glob '!node_modules/' --glob '!dist/' --glob '!target/' --glob '!work/analysis/' --glob '!runs/' "$(candidate_regex "$LAYER_SLUG")" . || true) > "$RG_MATCHES_FILE"
    if [[ -s "$RG_MATCHES_FILE" ]]; then
      awk -F: '{ count[$1]++ } END { for (file in count) printf "%6d %s\n", count[file], file }' "$RG_MATCHES_FILE" | sort -nr | sed -n '1,80p'
    else
      printf 'No rg matches found.\n'
    fi
  else
    printf 'ripgrep not found; candidate ranking not generated.\n'
  fi
} > "$CANDIDATES_FILE"

CODEGRAPH_INDEX_ALLOWED=0
case "$SOURCE_PHYSICAL" in
  "$ROOT_DIR/work/external-repos/"*) CODEGRAPH_INDEX_ALLOWED=1 ;;
esac
if [[ "$ALLOW_SOURCE_INDEX_STATE" -eq 1 ]]; then
  CODEGRAPH_INDEX_ALLOWED=1
fi

if [[ "$SKIP_CODEGRAPH" -eq 0 && -x "$(command -v codegraph 2>/dev/null || true)" && "$CODEGRAPH_INDEX_ALLOWED" -eq 1 ]]; then
  {
    printf '# CodeGraph Results\n\n'
    printf 'Generated: %s\n\n' "$(date -Iseconds)"
    printf 'Note: CodeGraph may create or update `.codegraph/` inside the source checkout.\n\n'
    codegraph init "$SOURCE_PATH" --index
    codegraph status "$SOURCE_PATH"
    printf '\n## Explore Queries\n\n'
    default_queries "$LAYER_SLUG" | while IFS= read -r query; do
      [[ -z "$query" ]] && continue
      printf '\n### %s\n\n' "$query"
      (cd "$SOURCE_PATH" && codegraph explore "$query") || true
    done
  } > "$CODEGRAPH_FILE" 2>&1
  printf -- '- CodeGraph: `work/analysis/%s/%s/codegraph-results.txt`\n' "$REPO_SLUG" "$LAYER_SLUG" >> "$RUN_LOG"
else
  {
    printf '# CodeGraph Results\n\n'
    if [[ "$SKIP_CODEGRAPH" -eq 1 ]]; then
      printf 'CodeGraph was not run because `--skip-codegraph` was passed.\n'
    elif ! command -v codegraph >/dev/null 2>&1; then
      printf 'CodeGraph was not run because `codegraph` was not found on PATH.\n'
    else
      printf 'CodeGraph was not run because source index state is allowed only under `work/external-repos/` by default. Pass `--allow-source-index-state` only after approval.\n'
    fi
  } > "$CODEGRAPH_FILE"
  printf -- '- CodeGraph: not run\n' >> "$RUN_LOG"
fi

if [[ "$SKIP_GRAPHIFY" -eq 0 && -x "$(command -v graphify 2>/dev/null || true)" && -f "$SOURCE_PATH/graphify-out/graph.json" ]]; then
  {
    printf '# Graphify Query Results\n\n'
    printf 'Generated: %s\n\n' "$(date -Iseconds)"
    default_queries "$LAYER_SLUG" | while IFS= read -r query; do
      [[ -z "$query" ]] && continue
      printf '\n### %s\n\n' "$query"
      (cd "$SOURCE_PATH" && graphify query "$query") || true
    done
  } > "$GRAPHIFY_FILE" 2>&1
  printf -- '- Graphify: `work/analysis/%s/%s/graphify-results.txt`\n' "$REPO_SLUG" "$LAYER_SLUG" >> "$RUN_LOG"
else
  {
    printf '# Graphify Query Results\n\n'
    if [[ "$SKIP_GRAPHIFY" -eq 1 ]]; then
      printf 'Graphify was not run because `--skip-graphify` was passed.\n'
    elif ! command -v graphify >/dev/null 2>&1; then
      printf 'Graphify was not run because the `graphify` CLI was not found. The package is installed as `graphifyy`; the command is `graphify`.\n'
    else
      printf 'Graphify was not run because `%s/graphify-out/graph.json` does not exist.\n' "$SOURCE_PATH"
    fi
  } > "$GRAPHIFY_FILE"
  printf -- '- Graphify: not run\n' >> "$RUN_LOG"
fi

cat > "$DRAFT" <<DRAFT
# $LAYER_SLUG Draft

## Repository

- Repository: $REPO_REF
- Source path: \`$SOURCE_PATH\`
- Physical source path: \`$SOURCE_PHYSICAL\`
- Commit: \`$COMMIT_SHA\`
- Layer definition: $(layer_definition "$LAYER_SLUG")

## Candidate Files / Modules

- TODO: Review \`queries.md\`, \`candidate-files.md\`, \`rg-matches.txt\`, \`codegraph-results.txt\`, and \`graphify-results.txt\`.

## Confirmed Behavior

- TODO: Add only facts confirmed from source files or official docs.

## Interpretation

- TODO: Add Codex interpretation separately from confirmed facts.

## Evidence

- TODO: Link exact files, symbols, source cards, or upstream URLs.

## Confidence

- low

## Open Questions

- TODO
DRAFT

cat >> "$RUN_LOG" <<EOF

## Outputs

- Candidate files: \`work/analysis/$REPO_SLUG/$LAYER_SLUG/candidate-files.md\`
- Search queries: \`work/analysis/$REPO_SLUG/$LAYER_SLUG/queries.md\`
- ripgrep matches: \`work/analysis/$REPO_SLUG/$LAYER_SLUG/rg-matches.txt\`
- CodeGraph results: \`work/analysis/$REPO_SLUG/$LAYER_SLUG/codegraph-results.txt\`
- Graphify results: \`work/analysis/$REPO_SLUG/$LAYER_SLUG/graphify-results.txt\`
- Draft: \`work/analysis/$REPO_SLUG/$LAYER_SLUG/layer-draft.md\`

## Evidence Rule

Graph outputs are discovery aids only. Final evidence must cite actual files, symbols, source cards, or official upstream URLs.
EOF

printf 'analysis workspace created: %s\n' "$ANALYSIS_DIR"
printf 'run log created: %s\n' "$RUN_LOG"
