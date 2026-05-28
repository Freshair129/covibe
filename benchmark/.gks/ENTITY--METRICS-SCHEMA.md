---
id: ENTITY--METRICS-SCHEMA
tier: genesis
created_at: 2026-05-29T03:11:52.721+07:00
phase: 3
type: entity
status: active
vault_id: covibe
title: EABS-01 Metrics JSON Schema
tags: [schema, telemetry, benchmark]
domain: benchmark
crosslinks:
  used_by: [run_csb_01.py, verify_csb_01.py]
  references: [FRAMEWORK--EABS-01]
linked_symbols: []
---

# ENTITY — EABS-01 Metrics JSON Schema

## Schema Definition

This entity defines the strict structure of `metrics.json` generated after every model benchmark run.

```json
{
  "benchmark_id": "bench_20260527_001",
  "status": "completed|failed",
  "task_id": "string",
  "context_length": 8192,
  "started_at": "ISO-8601",
  "ended_at": "ISO-8601",
  "duration_seconds": 43.32,
  "tokens": {
    "input": "number",
    "output": "number",
    "total": "number"
  },
  "throughput": {
    "avg_tps": "number"
  },
  "gpu": {
    "max_temp_c": "number",
    "avg_temp_c": "number",
    "max_power_w": "number",
    "avg_power_w": "number"
  },
  "quality": {
    "passed": "boolean",
    "rank": "elite|good|poor",
    "score": "number"
  }
}
```

## Validation Rules
- `started_at` and `ended_at` MUST be present for hardware telemetry slicing.
- `quality.score` is updated post-run by the verification script.
