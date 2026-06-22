---
type: Script Guide
title: Scripts
description: Local helper scripts for repeatable Codex harness work.
tags: [folder/scripts, harness/automation]
status: draft
change_policy: curated
---

# Scripts

This folder contains local helper scripts for repeatable research and harness work.

## Available Scripts

- [analyze-layer.sh](analyze-layer.sh): create a repeatable layer-analysis workspace for one repository and one architecture layer.

Scripts must follow [AGENTS.md](/AGENTS.md) and [docs/harness/policy.md](/docs/harness/policy.md). They may create files inside `work/`, `runs/`, and `docs/research/`, but they must not mutate external services or destructive state without explicit user approval.
