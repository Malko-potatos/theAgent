---
type: Run Note
title: L01 Layer Circulation
status: completed
date: 2026-06-25
change_policy: append-only
derived_from:
  - docs/research/layers/README.md
  - docs/research/layers/P00-agent-loop-orchestrator.md
  - templates/layer-analysis.md
---

# L01 Layer Circulation

## Goal

Resume work with layer circulation as the priority instead of moving directly
from the session/background-task research note into implementation.

## Boundary

- L01 intent intake.
- Adjacent boundaries: P00 loop orchestration, L02 active context, L04 action
  grammar, L05 tool harness, L08 trajectory, and L12 surface.

## Context Read

- `AGENTS.md`
- `docs/harness/code-analysis-automation.md`
- `docs/research/layers/README.md`
- `docs/research/layers/P00-agent-loop-orchestrator.md`
- `docs/research/layers/L08-trajectory.md`
- `templates/layer-analysis.md`
- Prior L01 automation run notes under `runs/2026-06-19-*L01-intent-intake.md`
- Candidate discovery outputs under `work/analysis/*/L01-intent-intake/`
- Source snippets from local snapshots under `work/external-repos/`

## Changed Files

- Added `docs/research/layers/L01-intent-intake.md`.
- Updated `docs/research/layers/README.md` to link the new L01 note.
- Added `runs/2026-06-25-l01-layer-circulation.md`.

Pre-existing working-tree changes were left intact:

- `docs/research/layers/2026-06-25-session-subagent-background-sandbox.md`
- `docs/research/layers/L05-tool-harness.md`
- `docs/research/opencode/2026-06-25-model-switching.md`
- `runs/2026-06-25-session-subagent-background-sandbox.md`

## Findings

- L01 should classify text, slash commands, shell commands, prompt-template
  commands, attachments, mentions, skills, and control metadata before P00
  starts a turn.
- The local prototype still uses a minimal `TurnInput.content` shape, which is
  fine for the fake-provider vertical slice but should not become the durable
  input contract.
- The next rotation target is `L02-active-context.md`, not another immediate
  implementation spike.

## Verification

- Checked frontmatter and required headings by reading the created files.
- Checked that the L01 index link points at an existing file.
- Checked `git status --short --untracked-files=all`.

No code behavior changed, so no runtime test was required for this pass.

## Next Step

Continue layer circulation with `docs/research/layers/L02-active-context.md`.
Focus on how accepted L01 input plus session history becomes provider-facing
messages, and keep implementation changes deferred unless the layer pass finds
a small contract gap that blocks the research sequence.
