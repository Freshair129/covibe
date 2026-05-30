---
id: SKILL--BENCHMARK-ORCHESTRATION
tier: master
created_at: 2026-05-29T03:11:52.721+07:00
updated_at: 2026-05-30T18:15:00+07:00
phase: 5
type: skill
status: active
vault_id: covibe
title: AI Agent Benchmark Execution Skill
tags: [skill, agent, workflow]
domain: ai-agent
crosslinks:
  used_by: []
  references: [FLOW--BENCHMARK, EABS-01]
linked_symbols: []
---

# SKILL — Benchmark Orchestration

## Capability
This skill enables the AI Developer Agent to autonomously orchestrate and monitor an EABS-01 compliant benchmark run, verify the results, and collect telemetry either via real-time WebSocket interactions on the dashboard or standard command-line tools.

## Execution Sequence

### Method A: WebSocket-driven Orchestration (Real-time Dashboard)
1. **Pre-flight Check:** Ensure the WebSocket server on port `8787` is active and the telemetry source (`D:\hw_log\HardwareMonitoring.hml` or `benchmark/telemetry_logs/`) is readable.
2. **Trigger:** Send a WebSocket message of type `start_benchmark_run` containing the payload configuration (`provider`, `model_id`, `prompt`) to the server.
3. **Monitor Logs:** Stream process stdout/stderr logs in real-time by listening to `benchmark_log` WebSocket events.
4. **Monitor Telemetry:** Stream system sensor metrics by listening to `live_hardware_sample` events for dashboard rendering.
5. **Safety Guard:** Monitor hardware safety thresholds (`GPU_Temp >= 88°C` or `GPU_Power >= 165W`). If limits are exceeded, trigger the 120s cooldown.
6. **Finalize:** Once the run completes (indicated by `benchmark_status`), wait for the 10-second post-run telemetry cooldown.

### Method B: CLI-driven Orchestration (Legacy Fallback)
1. **Pre-flight:** The agent verifies that `D:\hw_log\HardwareMonitoring.hml` exists and is writable.
2. **Execute:** The agent runs `python scripts/run_csb_01.py` using `run_shell_command` with `is_background: true`.
3. **Monitor:** The agent occasionally checks the background process status.
4. **Verify:** Once complete, the agent runs `python scripts/verify_csb_01.py` to unit test the outputs.
5. **Slice:** The agent runs `python scripts/slice_hw_logs.py` to map hardware logs to the generated results.
6. **Report:** The agent updates the topic and informs the user of completion.
