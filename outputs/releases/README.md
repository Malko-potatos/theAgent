---
type: Folder Guide
title: Release Outputs
description: Human-readable release notes, manifests, checksums, and verification summaries.
tags: [folder/outputs-releases, release, final-output]
status: draft
change_policy: curated
---

# Release Outputs

Use this folder for release-facing metadata, not raw build folders.

Recommended structure:

```text
outputs/releases/v0.1.0/
  release-notes.md
  artifact-manifest.md
  checksums.txt
  verification-summary.md
```

Keep large binaries, packaged apps, dependency folders, and generated build directories outside git unless the user explicitly asks to track them.
