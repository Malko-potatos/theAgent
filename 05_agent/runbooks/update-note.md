---
type: Agent Runbook
title: Update Note Runbook
description: How an agent should update normalized, concept, synthesis, or runbook notes.
resource: ""
tags: [layer/l5-agent, agent/runbook, topic/verification-loop]
timestamp: "2026-06-19T00:00:00+09:00"
layer: L5
status: reviewed
change_policy: curated
source_type: runbook
captured_at: "2026-06-19T00:00:00+09:00"
source_version: initial
derived_from:
  - /00_meta/validation.md
  - /03_concepts/verification-loop.md
supports: []
aliases: [note update runbook]
confidence: high
verification:
  last_checked: "2026-06-19"
  method: dry-run
---

# When To Use

Use this when updating Layer 2, Layer 3, Layer 4, or Layer 5 notes.

# Read Order

1. Read [/05_agent/index.md](/05_agent/index.md).
2. Read the target note.
3. Read all files listed in `derived_from`.
4. Read [/00_meta/validation.md](/00_meta/validation.md).

# Allowed Edits

- Update frontmatter fields when the change affects status, tags, source trace, or verification.
- Add source links for new claims.
- Add a short entry to [/log.md](/log.md).

# Not Allowed

- Do not overwrite Layer 1 source cards.
- Do not turn interpretation into confirmed fact without a source link.

# Required Verification

- Frontmatter parses.
- Internal links resolve.
- `derived_from` paths exist.
- New claims link to source or normalized notes.
- Root log is updated.

# Update Log Target

[/log.md](/log.md)
