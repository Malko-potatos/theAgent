---
type: Folder Guide
title: Runtime
description: Core agent loop implementation.
tags: [folder/src-runtime, code/runtime]
status: draft
change_policy: curated
---

# Runtime

Use this folder for the core loop:

```text
run_turn -> agent_loop -> build_context -> run_step -> classify_step
```

The runtime should not depend on a specific UI, terminal, browser, or provider SDK object.
