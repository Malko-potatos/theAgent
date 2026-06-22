# Layer Analysis Run

## Target

- Repository: `NousResearch/hermes-agent`
- Repository URL: https://github.com/NousResearch/hermes-agent
- Source path: `work/external-repos/nousresearch__hermes-agent`
- Physical source path: `/Users/potablepotato/HansolProduct/potato-project/theAgent/work/external-repos/nousresearch__hermes-agent`
- Layer: `P00-agent-loop-orchestrator`
- Layer definition: Observation axis for the time-ordered agent loop: turn/session start, context build, model call, tool-call cycle, approval, persistence, stop, abort, retry, resume, and replay touchpoints.
- Commit: `28d887ca18fdb52e352f5d9b61c9edf455e92a50`

## Commands

- Script: `scripts/analyze-layer.sh NousResearch/hermes-agent P00 --source-path work/external-repos/nousresearch__hermes-agent --skip-graphify`

## Tool Versions

- CodeGraph: `1.0.1`
- Graphify CLI: `graphify 0.8.13`

## Tool Runs

- CodeGraph: `work/analysis/nousresearch__hermes-agent/P00-agent-loop-orchestrator/codegraph-results.txt`
- Graphify: not run

## Outputs

- Candidate files: `work/analysis/nousresearch__hermes-agent/P00-agent-loop-orchestrator/candidate-files.md`
- Search queries: `work/analysis/nousresearch__hermes-agent/P00-agent-loop-orchestrator/queries.md`
- ripgrep matches: `work/analysis/nousresearch__hermes-agent/P00-agent-loop-orchestrator/rg-matches.txt`
- CodeGraph results: `work/analysis/nousresearch__hermes-agent/P00-agent-loop-orchestrator/codegraph-results.txt`
- Graphify results: `work/analysis/nousresearch__hermes-agent/P00-agent-loop-orchestrator/graphify-results.txt`
- Draft: `work/analysis/nousresearch__hermes-agent/P00-agent-loop-orchestrator/layer-draft.md`

## Evidence Rule

Graph outputs are discovery aids only. Final evidence must cite actual files, symbols, source cards, or official upstream URLs.
