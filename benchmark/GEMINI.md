# CoVibe AI Developer Agent Guide (GEMINI.md)

Welcome to the CoVibe Benchmarking control directory. 

> [!IMPORTANT]
> **MANDATORY PRE-RUN RULE:** 
> Before executing ANY benchmark tasks, writing any orchestrator scripts, or analyzing telemetry, you MUST first read and adhere to the official Single Source of Truth (SSOT) document:
> * **SSOT Document Path:** [CoVibe-ENTERPRISE-BENCHMARK-STANDARD.md](./CoVibe-ENTERPRISE-BENCHMARK-STANDARD.md)
>
> You are required to read that file at the start of your benchmark session.

## Core Directives
1. **Guided Knowledge System (.gks):** This directory utilizes a standardized vault structure located in `.gks/`. Future agents MUST consult the templates (ALGO, FLOW, ISSUE, RUNBOOK, etc.) in `.gks` before making architectural decisions or investigating hardware limits. See `.gks/README.md` for the taxonomy.
2. **SSOT Policy:** Do not refer to duplicate files or memory context. All folder hierarchies (`benchmark-kits/`, `benchmark-run/`, `telemetry_logs/`), schema validations (`metadata.json`, `metrics.json`, `samples.jsonl`), pre-flight hardware tuning, and thermal cooldown policies are governed strictly by the SSOT and `.gks` documents.
3. **Safety Gates:** Run underclocks and lock GPU clocks before initiating local model inference as documented in the SSOT (or `PROTOCOL--HW-TUNING.md`).
4. **Loop & Encoding Guards:** Enforce maximum tokens, stop tokens, and forced UTF-8 output streams in your runner code to mitigate risks (see `RISK--EMOJI-CRASH.md`).
