---
id: INC--QWOPUS-500-ERROR
tier: process
created_at: 2026-05-29T03:11:52.721+07:00
phase: 5
type: inc
status: stable
vault_id: covibe
title: Qwopus 3.5 9B Model 500 Internal Server Error
tags: [post-mortem, ollama, vram]
domain: benchmark
crosslinks:
  used_by: []
  references: [ISSUE--VRAM-FRAGMENTATION]
linked_symbols: []
---

# INC — Qwopus 3.5 9B Model 500 Internal Server Error

## Incident Summary
During the CSB-01 batch execution, the model `hf.co/Jackrong/Qwopus3.5-9B-Coder-GGUF:Q4_K_M` consistently failed to load, returning a `500 Internal Server Error` and `0.0 TPS`.

## Timeline
- **Trigger:** Auto-execution of `run_csb_01.py`.
- **Detection:** Console logs showed immediate failure.
- **Investigation:** Running interactively (`ollama run qwopus-fix`) revealed `unable to load model`.

## Root Cause Analysis
1. **Experimental Architecture:** The model uses `qwen35` experimental features requiring a vision projector (`mmproj.gguf`) missing from the local Ollama instance.
2. **VRAM Fragmentation:** Previous models were not explicitly unloaded, leaving insufficient contiguous memory for the 9B model's KV cache.

## Resolution
1. Deleted the corrupted model blob.
2. Added `keep_alive: 0` explicit unloading to `run_csb_01.py` to prevent future fragmentation.
