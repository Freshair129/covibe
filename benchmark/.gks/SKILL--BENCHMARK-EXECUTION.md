---
id: SKILL--BENCHMARK-EXECUTION
tier: master
created_at: 2026-05-30T18:17:00.000+07:00
updated_at: 2026-05-30T18:23:00.000+07:00
phase: 3
type: skill
status: active
vault_id: covibe
title: AI Agent Benchmark Execution & Assertion Capability
tags: [skill, agent, workflow, execution]
domain: ai-agent
crosslinks:
  required_tools: [run_command, view_file, write_to_file]
  guardrails: [GUARD--THERMAL-LIMITS, SAFETY--HARDWARE-PRESERVATION]
  references: [EABS-01, FLOW--BENCHMARK]
  used_by: [SKILL--BENCHMARK-ORCHESTRATION]
---

# SKILL — Benchmark Execution

## When to invoke

Invoke this skill when the AI Developer Agent needs to:
1. Trigger local execution of a benchmark campaign for a specified model.
2. Read, validate, and verify the outputs of the benchmark execution (logs, metadata, metrics).
3. Handle runtime errors, Out of Memory (OOM) situations, or safety failures during execution.

## Required tools

- `run_command` — Used to execute the benchmark execution runner (`run_csb_01.py` or `great_orchestrator.py`) and verification scripts.
- `view_file` — Used to inspect generated logs and metrics for verification.
- `write_to_file` — Used to create reports, update templates, or fix script configurations.

## Behaviour

### 1. Pre-flight Validation & Setup
- **Model Check:** Confirm that the target model is loaded or available in the inference engine by querying:
  ```bash
  ollama list
  ```
- **Safety Checks:** Check that the telemetry logger path is writable and verify safety settings (Core Offset: `-104MHz`, Power Limit: `90%`).
- **Telemetry Init:** Ensure MSI Afterburner or HWiNFO logs are writing to `D:\hw_log\HardwareMonitoring.hml` or `benchmark/telemetry_logs/`.

### 2. Execute Benchmark Campaign
- **Execute Run Command:** Execute the campaign script in the workspace root directory:
  ```bash
  python scripts/run_csb_01.py <model_name>
  ```
- **Single-Task Mode (Ad-hoc Runs):** If testing a specific task, run:
  ```bash
  python scripts/great_orchestrator.py <model_name> <task_path> <payload_path>
  ```
  - **Input Path:** `benchmark/benchmark-kits/tasks/`
  - **Payload Path:** `benchmark/benchmark-kits/ammunition/`

### 3. Handle Errors and Interventions
- **TDR/Power Surge (Exit 102):** If the execution aborts due to hardware limits (GPU Temp >= 88°C or Power Draw >= 165W):
  - Halt active execution.
  - Enforce a 120-second cooling period.
  - Query sensor status to verify the temperature is below 45°C before resuming.
- **OOM / VRAM Fragmentation (Exit 103):** If the execution fails due to memory exhaustion:
  - Spawn `powershell.exe -ExecutionPolicy Bypass -File scripts/restart_ollama.ps1` to restart the inference engine.
  - Confirm VRAM is reclaimed (Residual VRAM < 1,024 MB) before initiating the next run.

### 4. Quality Assertion & Verification
- **Run Verification Suite:** Run the assertion script to check formatting and structural correctness:
  ```bash
  python scripts/verify_csb_01.py <model_name>
  ```
- **KPI Assertions:** Read the generated `metrics.json` file at `g:/covibe/benchmark/benchmark-run/<model-name>/<runid>/metrics.json` and verify the following criteria:
  - **TTFT (First Token Latency):** `< 250 ms`
  - **Decode Speed (Generation Rate):** `> 12.0 tokens/sec`
  - **VRAM Margin:** `> 1,024 MB` during the L4 stress run
  - **Error Rate (OOM/Crash):** `0.00%`

### 5. Report Slicing & Documentation
- **Slice Telemetry:** Run the slicing script to map telemetry points to the benchmark timeframes:
  ```bash
  python scripts/slice_hw_logs.py
  ```
  - **Input Log:** `D:\hw_log\HardwareMonitoring.hml`
  - **Output File:** `g:/covibe/benchmark/benchmark-run/<model-name>/<runid>/traces/samples.jsonl`
- **Publish Documents:** Copy initialized plan templates and append actual metrics to finalize the documents:
  - PLAN Document: `g:/covibe/benchmark/benchmark-run/<model-name>/<runid>/documents/[runid]-PLAN-[PROJECT_NAME].md`
  - RUN Document: `g:/covibe/benchmark/benchmark-run/<model-name>/<runid>/documents/[runid]-RUN-[PROJECT_NAME].md`
  - REPORT Document: `g:/covibe/benchmark/benchmark-run/<model-name>/<runid>/documents/[runid]-REPORT-[PROJECT_NAME].md`
  - SIGNOFF Document: `g:/covibe/benchmark/benchmark-run/<model-name>/<runid>/documents/[runid]-SIGNOFF-[PROJECT_NAME].md`

## Guardrails referenced

- **GUARD--THERMAL-LIMITS:** Restricts operations if temperature exceeds 88°C.
- **SAFETY--HARDWARE-PRESERVATION:** Governs safe underclocking (-104MHz), power limit (165W), and mandatory cooldown timing (120s).

## Output contract

Upon completion, this skill guarantees that the following file layout is created under `g:/covibe/benchmark/benchmark-run/<model-name>/<runid>/`:
1. `metadata.json` — Static system environment and runtime specs.
2. `metrics.json` — Unified benchmark results and quality assertions.
3. `samples.jsonl` — Time-series telemetry points.
4. `traces/token_trace.jsonl` & `traces/failures.jsonl` — Event sequences.
5. Markdown files under the `documents/` folder.
