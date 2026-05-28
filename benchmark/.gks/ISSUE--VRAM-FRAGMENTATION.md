---
id: ISSUE--VRAM-FRAGMENTATION
tier: process
created_at: 2026-05-29T03:11:52.721+07:00
phase: 4
type: issue
status: active
vault_id: covibe
title: Ollama VRAM Fragmentation Across Batch Runs
tags: [bug, memory, ollama]
domain: benchmark
crosslinks:
  used_by: [INC--QWOPUS-500-ERROR]
  references: []
linked_symbols: []
---

# ISSUE — VRAM Fragmentation

## Description
When running multiple LLMs sequentially using the Ollama API, models are kept alive in VRAM by default for 5 minutes. If a new model is requested before the old one unloads, Ollama attempts to swap them but often fails to allocate contiguous memory for the new model's KV cache, leading to silent failures or 500 errors.

## Reproduction Steps
1. Load a 9B model (e.g., Gemma4).
2. Immediately request a 14B model (e.g., Qwen3).
3. Observe memory allocation failure in Ollama server logs.

## Mitigation
Send an explicit unload API call before any new model loads:
```json
// POST /api/generate
{
  "model": "previous_model_name",
  "keep_alive": 0
}
```
