---
type: Folder Guide
title: Verification Code
description: Independent checks for runtime events, turn reports, and artifact integrity.
tags: [folder/src-verification, code/verification]
status: draft
change_policy: curated
---

# Verification Code

Use this folder for checks that can inspect runtime results from the outside.

Good examples:

- event log validators
- trajectory sequence and pairing validators
- turn report validators
- permission matrix checks
- replay consistency checks

Verification should not rely only on the same function that produced the result.
