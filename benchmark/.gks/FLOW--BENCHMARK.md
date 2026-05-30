---
id: FLOW--BENCHMARK
tier: process                  
created_at: 2026-05-28T12:45:00.000+07:00
phase: 3                     
type: flow
status: active                  
vault_id: covibe
title: EABS-01 Benchmark Execution and Telemetry Flow
domain: benchmark
tags: [data-flow, process-flow, telemetry]
crosslinks:
  participants: [benchmark-kits, benchmark-run, telemetry_logs, run_csb_01.py, verify_csb_01.py, slice_hw_logs.py, Ollama]              
  references: [EABS-01]                
  preceded_by: []               
  followed_by: []               
---

# FLOW — EABS-01 Benchmark Execution and Telemetry Flow

## Trigger

Initiated manually by a developer running `python scripts/run_csb_01.py` after completing pre-flight hardware tuning (Method A or B).

## Workflow Sequence (Process Level)

```text
[ COVIBE BENCHMARK WORKFLOW & DOCUMENTATION LIFE CYCLE ]

Phase 1: PRE-TEST (Preparation)
+-----------------------+     +-------------------------------+
| Stage 1: Payload Gen  | --> | Document 1: BD-TP Plan        |
| (จัดเตรียมโจทย์ทดสอบ)      |     | ([runid]-PLAN-[proj].md)      |
+-----------------------+     +-------------------------------+
                                              |
                                              v
Phase 2: ACTIVE-TEST (Execution)
+-----------------------+     +-------------------------------+
| Stage 2: Monitoring   | --> | Stage 3: Runtime Execution    |
| (เปิดตัวเก็บ Telemetry)   |     | (รัน great_orchestrator.py)   |
+-----------------------+     +-------------------------------+
                                              |
                                              v
                              +-------------------------------+
                              | Document 2: ER-VFS Runbook    |
                              | ([runid]-RUN-[proj].md)       |
                              +-------------------------------+
                                              |
                                              v
Phase 3: POST-TEST (Analysis & Sign-Off)
+-----------------------+     +-------------------------------+     +-------------------------------+
| Stage 4: Slicing      | --> | Stage 5 & 6: Aggregation/Ana  | --> | Document 3: TBR-RCA Report    |
| (หั่นเก็บ telemetry)    |     | (สรุป metrics.json)            |     | ([runid]-REPORT-[proj].md)    |
+-----------------------+     +-------------------------------+     +-------------------------------+
                                                                                    |
                                                                                    v
                                                                    +-------------------------------+
                                                                    | Document 4: PR-SO Sign-Off    |
                                                                    | ([runid]-SIGNOFF-[proj].md)   |
                                                                    +-------------------------------+
```

## Data Flow Sequence (System Level)

```text
[ DATA FLOW DIAGRAM (v2.1.0) ]

(SOURCE DATA)                               (ORCHESTRATOR)
benchmark-kits/tasks/L*.txt  -----\
benchmark-kits/ammunition/*.txt --+-------> [run_csb_01.py] =======> (OLLAMA API)
templates/*.json             -----/              |                         |
                                                 |                         |
                           (Writes Timestamps)   |   (Writes Gen-Code)     |
                                                 v                         v
                                    +--------------------------------------------+
                                    | benchmark-run/<model_name>/<runid>/        |
                                    |  ├── metadata.json                         |
                                    |  ├── metrics.json (ได้ค่า TPS เบื้องต้น)     |
                                    |  ├── artifacts/                            |
                                    |  │    └── response.txt                     |
                                    |  └── documents/                            |
                                    |       ├── [runid]-PLAN-[PROJECT_NAME].md   |
                                    |       └── [runid]-RUN-[PROJECT_NAME].md    |
                                    +--------------------------------------------+
                                                 |                         |
(HARDWARE SENSORS)                               |                         |
MSI Afterburner / HWiNFO                         |                         |
       |                                         v                         v
       v                                [slice_hw_logs.py]         [verify_csb_01.py]
telemetry_logs/                                  |                         |
       |                                         |                         |
       \-----------------------------------> (writes)                  (updates)
                                                 |                         |
                                                 v                         v
                                    +--------------------------------------------+
                                    | benchmark-run/<model_name>/<runid>/        |
                                    |  ├── traces/                               |
                                    |  │    └── samples.jsonl (HW Telemetry)     |
                                    |  └── documents/                            |
                                    |       ├── [runid]-REPORT-[PROJECT].md      |
                                    |       └── [runid]-SIGNOFF-[PROJECT].md     |
                                    +--------------------------------------------+
```

## Failure modes

- **Model Load Failure (Error 500):** Often caused by VRAM fragmentation. Recovery: `run_csb_01.py` attempts a `keep_alive: 0` clear before loading. If it fails during inference, the script logs the error, waits for thermal cooldown, and proceeds to the next task/model.
- **Verification Extraction Failure:** If the model hallucinates or fails to output a markdown code block, `verify_csb_01.py` skips execution, logs an extraction error, and assigns a score of 0.0.
- **Telemetry Missing:** If `slice_hw_logs.py` cannot find the MSI Afterburner `.hml` log, it gracefully defaults to empty telemetry traces and warns the user without crashing the pipeline.

## See also

- `CoVibe-ENTERPRISE-BENCHMARK-STANDARD.md` (EABS-01 v2.1.0)
