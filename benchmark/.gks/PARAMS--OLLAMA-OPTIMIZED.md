---
id: PARAMS--OLLAMA-OPTIMIZED
tier: master
created_at: 2026-05-29T03:11:52.721+07:00
phase: 3
type: params
status: active
vault_id: covibe
title: Optimized Ollama Inference Parameters
tags: [config, ollama, hyperparameters]
domain: benchmark
crosslinks:
  used_by: [run_csb_01.py]
  references: []
linked_symbols: []
---

# PARAMS — Optimized Ollama Inference

## Parameter Set (CSB-01 Standard)

These parameters are mandatory for all coding baseline benchmarks to ensure deterministic output and prevent infinite reasoning loops.

| Parameter | Value | Justification |
|---|---|---|
| `temperature` | `0.1` | Ensures highly deterministic code generation; reduces hallucination. |
| `num_ctx` | `8192` (or `32768`) | Based on EABS-01 rules for the specific model tier. |
| `num_predict` | `2500` | Prevents infinite loop generation by RL models. |
| `stop` | `["<\|im_end\|>", "### END", "```\n\n"]` | Forces the model to stop after closing the markdown code block. |
| `stream` | `true` | Required for capturing Time-to-First-Token (TTFT) and real-time TPS. |
