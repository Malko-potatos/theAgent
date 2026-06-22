---
type: Folder Guide
title: Harness Code
description: Fake providers, fake tools, adapters, and local test harness utilities.
tags: [folder/src-harness, code/harness]
status: draft
change_policy: curated
---

# Harness Code

Use this folder for executable support code around the runtime.

Examples:

- fake model provider
- fake tool executor
- in-memory event log
- JSONL trajectory store for local replay experiments
- local adapter shims

Harness code may support tests and experiments, but it must not hide runtime decisions that belong in `src/runtime/`.
