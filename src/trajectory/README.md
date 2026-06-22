---
type: Folder Guide
title: Trajectory Code
description: Replay readers and projection builders for L08 trajectory evidence.
tags: [folder/src-trajectory, code/trajectory, l08]
status: draft
change_policy: curated
---

# Trajectory Code

Use this folder for L08 code that reads canonical trajectory evidence and rebuilds derived views.

Current scope:

- keep the first accepted `TrajectoryKernel` implementation
- replay JSONL trajectory fixtures
- validate replay cursor and event chain shape
- build transcript projections
- build context projections

Do not put runtime loop control, provider adapters, or storage/index policy here.
