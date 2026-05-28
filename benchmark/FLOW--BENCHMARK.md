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
[ COVIBE BENCHMARK WORKFLOW (v2.1.0) ]

+-------------------+     +---------------------+     +-------------------+
| 1. CONFIGURATION  | --> | 2. ORCHESTRATION    | --> | 3. EXECUTION      |
+-------------------+     +---------------------+     +-------------------+
| จัดเตรียมโจทย์/    |     | รัน run_csb_01.py   |     | Ollama API รันงาน |
| Payload เอาไว้ใน  |     | - เคลียร์ VRAM      |     | - Load Model      |
| benchmark-kits/   |     | - Warmup Model      |     | - Generate Code   |
+-------------------+     | - ยิง Prompt ไป API |     +-------------------+
                          +---------------------+              |
                                                               v
+-------------------+     +---------------------+     +-------------------+
| 6. ANALYSIS       | <-- | 5. TELEMETRY SYNC   | <-- | 4. VERIFICATION   |
+-------------------+     +---------------------+     +-------------------+
| นำผลลัพธ์ที่สมบูรณ์ |     | รัน slice_hw_logs.py|     | รัน verify_csb_01 |
| ใน benchmark-run/ |     | ดึง Log ความร้อน/ไฟ  |     | ดึงโค้ดไปรัน Vitest |
| ไปแสดงบน Dashboard|     | แมปเวลาเข้าแต่ละ Task|     | เพื่อให้คะแนน Score |
+-------------------+     +---------------------+     +-------------------+
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
                                    | benchmark-run/<model_name>/<task_level>/   |
                                    |  ├── metadata.json                         |
                                    |  ├── metrics.json (ได้ค่า TPS เบื้องต้น)     |
                                    |  └── artifacts/                            |
                                    |       └── response.txt                     |
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
                                    | benchmark-run/<model_name>/<task_level>/   |
                                    |  ├── traces/                               |
                                    |  │    └── samples.jsonl (HW Telemetry)     |
                                    |  └── metrics.json (+ quality.score)        |
                                    +--------------------------------------------+
```

## Failure modes

- **Model Load Failure (Error 500):** Often caused by VRAM fragmentation. Recovery: `run_csb_01.py` attempts a `keep_alive: 0` clear before loading. If it fails during inference, the script logs the error, waits for thermal cooldown, and proceeds to the next task/model.
- **Verification Extraction Failure:** If the model hallucinates or fails to output a markdown code block, `verify_csb_01.py` skips execution, logs an extraction error, and assigns a score of 0.0.
- **Telemetry Missing:** If `slice_hw_logs.py` cannot find the MSI Afterburner `.hml` log, it gracefully defaults to empty telemetry traces and warns the user without crashing the pipeline.

## See also

- `CoVibe-ENTERPRISE-BENCHMARK-STANDARD.md` (EABS-01 v2.1.0)
