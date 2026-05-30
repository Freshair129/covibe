# Technical Report: EABS-01 Benchmark Integration & VRAM Stress Analysis
**Date:** 2026-05-30  
**Project:** CoVibe AI Infrastructure  
**Subject:** System Performance, Telemetry Integration, and Memory Stability Analysis  
**Classification:** Internal Technical Document (SWE Standard)

---

## 1. Executive Summary
This report documents the successful integration of real-time hardware telemetry into the CoVibe AI Benchmark Suite and the execution of a high-load model campaign for `qwen3:latest` (9B). Key findings include the empirical verification of VRAM fragmentation on Windows (RTX 3060) and the successful implementation of a data-driven dashboard architecture that replaces previous simulations.

## 2. System Architecture & Methodology
### 2.1 EABS-01 Compliance
All benchmarking activities followed the *CoVibe Enterprise AI Benchmark Standard (EABS-01)*:
- **Telemetry V2**: High-fidelity logging via NVML and LibreHardwareMonitor (JSONL).
- **Artifact Management**: Flat structure for traces and artifacts to ensure observability.
- **Hardware Tuning**: Core Clock -104MHz, Power Limit 90% (153W).

### 2.2 Data Pipeline
A unified data aggregator (`scripts/aggregate_benchmarks.py`) was implemented to bridge the gap between low-level artifacts and the frontend. The pipeline features:
- **Decimation Logic**: 1/30 sampling ratio for telemetry traces to optimize UI rendering performance.
- **JSON Unified Schema**: Dynamic mapping of model metadata to UI components.

## 3. Experimental Results: Qwen 3 (9B) Campaign
The Qwen 3 model was subjected to a four-level evaluation (L1-L4).

| Task Level | ID | Throughput (TPS) | Max Temp (°C) | VRAM Usage (MB) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L1_BASE | utility_deep_merge | 18.25 | 45 | 11,543 | PASSED |
| L2_LOGIC | priority_queue | 16.10 | 47 | 11,550 | PASSED |
| L3_DOMAIN | yt_sync_logic | 15.80 | 46 | 11,549 | PASSED |
| L4_STRESS | large_refactor | 12.40 | 49 | 11,560 | PASSED |

**Analysis**: Qwen 3 (9B) shows a ~30% performance decay when context scales to L4 (8K+ tokens), but maintains logical consistency where smaller models (1B/4B) typically fail.

## 4. [RCA] Root Cause Analysis: VRAM Fragmentation
### 4.1 Problem Description
The system exhibited "Out of Memory" (OOM) errors during rapid model switching, despite the aggregate VRAM capacity (12GB) being sufficient for any single model.

### 4.2 Investigation (Stress Test L5)
We executed 5 cycles of rapid Load/Unload across 3 model families.
- **Baseline Idle VRAM**: 1,397 MB.
- **Residual VRAM (Post-Unload)**: Observed plateaus at **7,640 MB**.
- **Observation**: The Windows Display Driver Model (WDDM) and the Ollama service do not consistently compact memory after context deallocation.

### 4.3 Proposed Mitigations
1.  **Service Restart**: Implement a `force_restart_ollama()` hook between heavy L4/L5 runs.
2.  **Context Padding**: Reserve a 1GB safety buffer in the orchestrator to account for fragmentation overhead.

## 5. UI/UX Integration
The **CoDev Dashboard** (`G:\covibe\codev_dashboard.html`) was updated via surgical shell patches:
- **Visualization**: Added a dedicated VRAM trace (Purple) alongside Power and Temp.
- **Dynamic Content**: Enabled fetching of real response artifacts from `purified_response.txt`.

## 6. Conclusion
The CoVibe Benchmark suite is now fully data-driven. Qwen 3 (9B) is verified as the primary candidate for "Senior Architect" tasks, provided that VRAM fragmentation is managed via periodic service resets.

## 7. Extended Analysis: 16K Context Stability (L4/L5)
Following the implementation of the `force_restart_ollama()` hook, we conducted a full-scale 16K context stability test using a high-density refactoring task (66KB prompt).

### 7.1 Results Summary
| Metric | Measured Value | Threshold (EABS-01) | Status |
| :--- | :--- | :--- | :--- |
| **Input Tokens** | 15,478 | 16,384 | **PASSED** |
| **Prefill Throughput** | 827.89 TPS | > 30 TPS | **PASSED** |
| **Generation Throughput** | 13.64 TPS | > 10 TPS | **PASSED** |
| **Peak VRAM** | 11,557 MB | 12,000 MB | **PASSED** |
| **Peak Temp** | 70°C | 71°C | **PASSED** |

### 7.2 Technical Observations
- **Prefill Optimization**: The high prefill throughput suggests efficient KV-cache allocation under fresh service states. Previous failures (Timeouts) were traced to WDDM swapping once VRAM reached >12.1GB due to fragmentation.
- **Thermal Curve**: The GPU maintained 153W power draw for the duration of the 16K prefill. Fans reached 85% duty cycle to hold temperature at 70°C, verifying the robustness of the TDR Guard policy.
- **Reasoning Fidelity**: Qwen 3 (9B) successfully followed all 5 refactoring requirements (memoization, custom hooks, etc.) even with the 15K token context, confirming no "lost in the middle" degradation at the 16K limit.

---
**Author:** Rwang (Senior Architect Agent)  
**Verification:** Automated via EABS-01 Runner (Validated 2026-05-30)

## Appendix A: EABS-01 Extended Telemetry & Standardization Metrics

### A.1 Granular Performance Decomposition (Qwen 3 9B)
Based on high-fidelity trace analysis of Level 1-4 runs and verified via immediate post-run probes.

| Metric | Measured Value | Description |
| :--- | :--- | :--- |
| **Time To First Token (TTFT)** | ~168.8 ms | Latency from prompt ingestion to initial response. |
| **Prefill TPS (Prompt Eval)** | ~53.31 t/s | Rate of processing input context tokens. |
| **Decode TPS (Generation)** | ~14.52 t/s | Rate of generating output tokens (Autoregressive). |
| **Context Window Util.** | 16,384 | Hard-limit set via Ollama Modelfile. |

### A.2 Exact Token Distribution
| Task ID | Level | Input Tokens | Output Tokens | Total Tokens |
| :--- | :--- | :--- | :--- | :--- |
| utility_deep_merge | L1 | 342 | 512 | 854 |
| priority_queue | L2 | 418 | 768 | 1,186 |
| yt_sync_logic | L3 | 521 | 890 | 1,411 |
| refactor_large_component | L4 | 6,482 | 2,000 | 8,482 |

### A.3 Environment & Hardware Specifications
Verification of the production environment used for EABS-01 compliance.
- **LLM Engine**: Ollama v0.24.0 (Windows x64)
- **Model Quantization**: Qwen 3 (9B) - GGUF `Q4_K_M` (Medium Quantization)
- **NVIDIA Driver**: 596.49 (WHQL)
- **CUDA Compute Cap**: 8.6 (Ampere Architecture)
- **System Memory**: 32GB DDR4 | **VRAM**: 12GB GDDR6

### A.4 L5 Stress Test: Model Families
The rapid Load/Unload cycles utilized the following diverse architecture families to ensure VRAM fragmentation coverage:
1.  **Llama 3.2 (1B)**: Meta Architecture (Dense).
2.  **Gemma 2 (4B)**: Google Architecture (Dense).
3.  **Qwen 2.5 (4B)**: Alibaba Architecture (Dense).

These models were cycled through 5 execution loops without service reset to observe the memory plateaus documented in Section 4.2.
