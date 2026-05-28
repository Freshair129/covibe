---
id: SKILL--BENCHMARK-ORCHESTRATION
tier: master
created_at: 2026-05-29T03:11:52.721+07:00
phase: 5
type: skill
status: active
vault_id: covibe
title: AI Agent Benchmark Execution Skill
tags: [skill, agent, workflow]
domain: ai-agent
crosslinks:
  used_by: []
  references: [FLOW--BENCHMARK]
linked_symbols: []
---

# SKILL — Benchmark Orchestration

## Capability
This skill enables the AI Developer Agent to autonomously orchestrate an EABS-01 compliant benchmark run, verify the results, and slice the telemetry.

## Execution Sequence

1. **Pre-flight:** The agent verifies that `D:\hw_log\HardwareMonitoring.hml` exists and is writable.
2. **Execute:** The agent runs `python scripts/run_csb_01.py` using `run_shell_command` with `is_background: true`.
3. **Monitor:** The agent occasionally checks `list_background_processes`.
4. **Verify:** Once complete, the agent runs `python scripts/verify_csb_01.py` to unit test the outputs.
5. **Slice:** The agent runs `python scripts/slice_hw_logs.py` to map hardware logs to the generated results.
6. **Report:** The agent updates the topic and informs the user of completion.
