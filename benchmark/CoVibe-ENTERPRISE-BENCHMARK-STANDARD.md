# CoVibe Enterprise AI Benchmark Standard (EABS-01)

**Document ID:** EABS-01  
**Version:** 2.0 Enterprise Revision  
**Status:** MANDATORY  
**Classification:** Internal Infrastructure Standard  
**Scope:** AI Model Benchmarking, Runtime Telemetry, Hardware Observability, Token Analytics, Resource Governance, and Regression Intelligence.

---

# 0. Core Philosophy

The benchmark platform MUST optimize for:

```text
reproducibility
observability
stability
traceability
thermal sustainability
latency consistency
energy efficiency
long-term analytics
```

Peak TPS alone is NOT considered a valid enterprise benchmark metric.

The benchmark system MUST preserve:

- raw telemetry
- raw runtime logs
- raw prompts
- raw responses
- token traces
- event timelines
- runtime metadata

Aggregated summaries MUST NEVER replace raw source telemetry.

Raw telemetry is the source of truth.

---

# 1. Production Directory Structure

All benchmark executions MUST follow the structure below.

```text
benchmark-run/
├── metadata.json
├── metrics.json
├── samples.jsonl
├── events.jsonl
├── token_trace.jsonl
├── failures.jsonl
├── artifacts/
│   ├── prompt.txt
│   ├── response.txt
│   ├── purified_response.txt
│   ├── logs.txt
│   ├── stderr.log
│   ├── runtime_stdout.log
│   └── raw_hardware.hml
└── traces/
    ├── gpu.csv
    ├── cpu.csv
    ├── memory.csv
    ├── power.csv
    └── tokens.csv
```

---

# 2. Data Hierarchy Standard

## 2.1 metadata.json (Immutable Context)

Stores static benchmark environment metadata.

### Required Fields

```json
{
  "benchmark_id": "bench_20260527_001",
  "run_id": "run_a91ff2",
  "session_id": "sess_001",
  "experiment_id": "exp_q4km_ctx8k",
  "machine_id": "machine_rtx3060_01",
  "created_at": "2026-05-27T00:46:53.739Z",
  "model": {
    "name": "gemma4-rust-coder",
    "family": "Gemma",
    "license": "MIT",
    "base_model": "google/gemma-4-E4B-it",
    "variant": "Rust-Coder",
    "source": "huggingface",
    "model_url": "https://huggingface.co/MassivDash/Gemma-4-Rust-Coder",
    "format": "GGUF",
    "quantization": "Q4_K_M",
    "parameter_size": "9B",
    "context_length": 8192,
    "tags": ["gguf", "llama.cpp", "unsloth", "rust", "coding"],
    "ollama_manifest": {
      "schemaVersion": 2,
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "config": {
        "mediaType": "application/vnd.container.image.v1+json",
        "digest": "sha256:4b4c3c807d092e41ccd2bcd9738b8a6478ecf6b4452ae67d42daca7c03f26439",
        "size": 453
      },
      "layers": [
        {
          "mediaType": "application/vnd.ollama.image.model",
          "digest": "sha256:559e43668ae5331cb8e6767e702eb71ba20834a5b88698ae71f216cc507bae21",
          "size": 3427873376,
          "from": "C:\\Users\\freshair\\.ollama\\models\\blobs\\sha256-559e43668ae5331cb8e6767e702eb71ba20834a5b88698ae71f216cc507bae21"
        },
        {
          "mediaType": "application/vnd.ollama.image.template",
          "digest": "sha256:31ea3e7b79889810fe53bd592aa395f43a0e37dc6c424bd1d8893d6f00f59b6d",
          "size": 96
        },
        {
          "mediaType": "application/vnd.ollama.image.params",
          "digest": "sha256:424fc810c3b53ae57cabd25d06b6111ade3db8bbc31e33b107d1ae929cbf6918",
          "size": 120
        }
      ]
    }
  },
  "dataset": {
    "name": "Fortytwo-Network/Strandset-Rust-v1",
    "dataset_url": "https://huggingface.co/datasets/Fortytwo-Network/Strandset-Rust-v1",
    "split": "test",
    "category": "rust-coding",
    "sample_id": "TASK-8K"
  },
  "runtime": {
    "runtime": "ollama",
    "runtime_version": "0.6.0",
    "backend": "llama.cpp",
    "backend_version": "b5123",
    "serving_mode": "single-user",
    "execution_mode": "local"
  },
  "environment": {
    "os": "Windows 10",
    "python_version": "3.12",
    "cuda_version": "12.8",
    "driver_version": "576.02",
    "timezone": "UTC+7 ICT(Indochina-Time-Bangkok)"
  }
}
```

---

## 2.2 metrics.json (Aggregated Summary)

Stores summarized benchmark metrics.

Used for:

- dashboards
- regression detection
- leaderboards
- comparisons
- ranking
- analytics

### Required Statistical Fields

Every measurable metric MUST support:

```json
{
  "min": 0,
  "max": 0,
  "avg": 0,
  "p50": 0,
  "p90": 0,
  "p95": 0,
  "p99": 0,
  "stddev": 0
}
```

---

## Example metrics.json

```json
{
  "benchmark_id": "bench_20260527_001",

  "status": "completed",

  "task_id": "task_001",
  "question_category": "coding",
  "context_length": 8192,

  "duration_seconds": 43.32,

  "tokens": {
    "input": 20,
    "output": 20,
    "total": 40
  },

  "throughput": {
    "avg_tps": 103.06,
    "min_tps": 91.11,
    "max_tps": 114.22,
    "p95_tps": 112.88,
    "p99_tps": 114.01
  },

  "latency": {
    "ttft_ms": 245,
    "inter_token_latency_ms": {
      "avg": 8.2,
      "p95": 12.1,
      "p99": 14.8
    }
  },

  "gpu": {
    "max_temp_c": 67,
    "avg_temp_c": 59.1,

    "max_power_w": 412,
    "avg_power_w": 318,

    "max_vram_mb": 14320,
    "avg_vram_mb": 12780
  },

  "efficiency": {
    "tokens_per_watt": 0.82,
    "joules_per_token": 1.92
  },

  "quality": {
    "passed": true,
    "rank": "good",
    "score": 0.54321
  }
}
```

---

## 2.3 samples.jsonl (Raw Telemetry)

Stores append-only time-series telemetry.

### Format

One JSON object per line.

```json
{"ts":"2026-05-27T00:46:53.739Z","gpu_temp":39,"gpu_power":22}
{"ts":"2026-05-27T00:46:54.739Z","gpu_temp":41,"gpu_power":88}
```

---

## 2.4 events.jsonl (Event Timeline)

Stores execution lifecycle events.

### Required Events

- benchmark_started
- model_loaded
- prefill_started
- first_token
- generation_started
- generation_finished
- benchmark_completed
- benchmark_failed
- thermal_throttle
- kv_cache_full
- runtime_warning
- runtime_crash

### Example

```json
{"ts":"2026-05-27T00:46:53.739Z","event":"benchmark_started"}
{"ts":"2026-05-27T00:46:57.233Z","event":"first_token"}
```

---

## 2.5 token_trace.jsonl (Per-Token Telemetry)

Stores token generation latency.

### Example

```json
{"token_index":1,"latency_ms":245}
{"token_index":2,"latency_ms":8}
```

---

## 2.6 failures.jsonl (Failure Taxonomy)

Stores structured failure reports.

### Example

```json
{
  "type": "thermal_throttle",
  "severity": "warning",
  "recoverable": true
}
```

---

# 3. Token Telemetry Standard

The orchestrator MUST expose token-level metrics.

## Required Metrics

```json
{
  "input_tokens": 1200,
  "output_tokens": 400,
  "total_tokens": 1600,

  "prompt_tokens_per_second": 850,
  "generation_tokens_per_second": 125,

  "time_to_first_token_ms": 245
}
```

---

# 4. Hardware Observability Standard

## GPU Metrics

Mandatory:

- temperature
- hotspot temperature
- power draw
- VRAM usage
- utilization
- fan speed
- memory clock
- core clock
- PCIe throughput

---

## CPU Metrics

Mandatory:

- utilization
- package temperature
- package power
- core clock

---

## RAM Metrics

Mandatory:

- RAM usage
- RAM temperature

---

## Storage Metrics

Mandatory:

- SSD temperature
- read throughput
- write throughput

---

# 5. KV Cache Observability

Required for all context benchmarks.

```json
{
  "kv_cache": {
    "allocated_mb": 8192,
    "used_mb": 7120,
    "utilization": 0.86
  }
}
```

---

# 6. Scheduler & Queue Telemetry

Required for concurrent runtimes.

```json
{
  "scheduler": {
    "queue_depth": 8,
    "active_requests": 4,
    "batch_size": 16
  }
}
```

---

# 7. Hardware Governance & Safety

## 7.1 RTX 3060 12GB Context Rules

### Small Models (< 7B)

Allowed up to 32K context.

### Medium Models (8B – 13B)

Allowed up to 32K with enforced power limits.

### Large Models (>= 14B)

STRICTLY LIMITED to 8K context locally without CPU offloading.

---

## 7.2 Thermal Governance

### Mandatory Tuning

```text
Core Clock Offset: -104MHz
Power Limit: 90%
```

---

## 7.3 Thermal Stop Rule

If GPU temperature reaches 71°C:

```text
suspend execution for 120 seconds
```

---

## 7.4 Power Governance

Sustained GPU loads above 150W MUST trigger cooldown between model swaps.

---

# 8. Anti-Pattern Mitigation

## 8.1 Infinite Reasoning Loop

### Mandatory Protections

```text
num_predict <= 2500
```

### Required Stop Sequences

```json
[
  "<|im_end|>",
  "### END",
  "```\n\n",
  "Explanation:"
]
```

### Mandatory Timeout

```text
300 seconds
```

---

## 8.2 Think Syntax Purification

Raw responses MUST be preserved.

Purified responses MUST remove:

```text
<think>...</think>
```

### Mandatory Regex

```python
re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL).strip()
```

---

# 9. Encoding Safety Standard

All Python runners MUST explicitly use:

```python
encoding="utf-8"
```

Windows terminals MUST force UTF-8 mode.

---

# 10. Runtime Classification Standard

Every benchmark MUST identify runtime architecture.

```json
{
  "runtime_class": {
    "runtime": "ollama",
    "backend": "llama.cpp",
    "serving_mode": "single-user",
    "execution_mode": "local"
  }
}
```

---

# 11. Sampling Governance Standard

## Mandatory Rules

```json
{
  "sampling_interval_ms": 1000,
  "clock_source": "monotonic",
  "timestamp_format": "ISO-8601 UTC"
}
```

---

## Recommended Sampling Intervals

| Workload | Interval |
|---|---|
| Inference | 500ms – 1s |
| Training | 100ms – 250ms |
| Debugging | 50ms |

---

# 12. Multi-GPU Futureproofing

All GPU schemas MUST support arrays.

```json
{
  "gpus": [
    {
      "gpu_id": 0,
      "name": "RTX 4090"
    }
  ]
}
```

---

# 13. Enterprise Observability Stack

| Layer | Primary Tool | Secondary |
|---|---|---|
| GPU Telemetry | NVIDIA DCGM | NVIDIA-SMI |
| System Metrics | Prometheus Node Exporter | LibreHardwareMonitor |
| Deep Monitoring | HWiNFO | LibreHardwareMonitor |
| Distributed Tracing | OpenTelemetry | Langfuse |
| Dashboard | Grafana | Plotly |
| Time-Series Database | ClickHouse | DuckDB |
| Local Benchmarking | MSI Afterburner | LibreHardwareMonitor |

---

# 14. Benchmarking Workflow

## Stage 1 — Payload Generation

```text
generate_payloads.py
```

---

## Stage 2 — Monitoring Activation

Enable:

```text
MSI Afterburner logging
LibreHardwareMonitor collector
```

---

## Stage 3 — Runtime Execution

Execute:

```text
great_orchestrator.py
```

Modes:

- local sequential
- async cloud
- distributed runtime

---

## Stage 4 — Telemetry Slicing

Convert raw telemetry:

```text
raw_hardware.hml
→ samples.jsonl
```

---

## Stage 5 — Aggregation

Generate:

```text
metrics.json
```

---

## Stage 6 — Analytics

Push into:

```text
DuckDB
ClickHouse
Grafana
```

---

# 15. Enterprise Benchmarking Architecture

```text
Inference Runtime
    ↓
Telemetry Collector
    ↓
OpenTelemetry / Prometheus
    ↓
Time-Series Database
    ↓
Aggregation Pipeline
    ↓
Analytics API
    ↓
Grafana / Dashboard
```

---

# 16. Final Enterprise Principle

Benchmarking quality is measured by:

```text
consistency
traceability
efficiency
stability
thermal sustainability
```

NOT by peak TPS alone.

---

**END OF DOCUMENT**

