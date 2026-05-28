---
id: GUARD--THERMAL-LIMITS
tier: safety
created_at: 2026-05-29T03:11:52.721+07:00
phase: 4
type: guard
status: active
vault_id: covibe
title: RTX 3060 Thermal and Power Limits
tags: [hardware, safety, gpu]
domain: infrastructure
crosslinks:
  used_by: [PROTOCOL--HW-TUNING, slice_hw_logs.py]
  references: [FRAMEWORK--EABS-01]
linked_symbols: []
---

# GUARD — RTX 3060 Thermal Limits

## Constraints

| Parameter | Threshold | Action if Exceeded |
| :--- | :--- | :--- |
| **Max Temperature** | `>= 71°C` | Immediate 120s thermal cooldown sleep in Python orchestrator. |
| **Power Draw** | `> 153W` | Log warning, verify MSI Afterburner profile is active. |
| **VRAM Usage** | `> 11.5 GB`| Unload model via API, reduce `num_ctx`. |

## Rationale
Sustained 100% load on the RTX 3060 without underclocking leads to TDR (Timeout Detection and Recovery) driver crashes, disrupting long-running batch benchmarks.

## Enforcement
Implemented via `time.sleep()` in `run_csb_01.py` and post-run warnings in `slice_hw_logs.py`.
