# metrics.json — Complete Benchmark & Hardware Monitoring Schema

```json
{
  "$schema_version": "1.0.0",
  "$generated_at": "2026-05-27T00:47:37.064Z",

  "benchmark": {
    "id": "bench_20260527_0001",
    "task": "TASK-8K",
    "suite": "Strandset-Rust",
    "scenario": "single_inference",
    "status": "completed",
    "quality_result": "PASS",
    "quality_score": 0.54321,

    "start_time": "2026-05-27T00:46:53.739Z",
    "end_time": "2026-05-27T00:47:37.064Z",
    "duration_seconds": 43.32,

    "warmup_run": false,
    "seed": 42,
    "repetition_index": 1,
    "tags": [
      "rust",
      "8k-context",
      "gpu-inference"
    ]
  },

  "model": {
    "name": "gemma4-rust-coder-latest",
    "family": "Gemma",
    "variant": "Rust-Coder",
    "version": "latest",
    "source": "huggingface",
    "model_url": "https://huggingface.co/MassivDash/Gemma-4-Rust-Coder",

    "format": "GGUF",
    "quantization": "Q4_K_M",
    "precision": "int4",
    "architecture": "transformer",

    "parameter_count": null,
    "context_length": 8192,
    "embedding_length": null,

    "tokenizer": {
      "name": "sentencepiece",
      "vocab_size": null,
      "bos_token": true,
      "eos_token": true
    }
  },

  "dataset": {
    "name": "Fortytwo-Network/Strandset-Rust-v1",
    "dataset_url": "https://huggingface.co/datasets/Fortytwo-Network/Strandset-Rust-v1",
    "split": "test",
    "sample_id": "TASK-8K",
    "sample_count": 1,
    "language": "rust"
  },

  "runtime": {
    "runtime": "ollama",
    "runtime_version": "0.6.0",

    "backend": "llama.cpp",
    "backend_version": "b5123",

    "api_mode": "local",
    "endpoint": "http://localhost:11434",

    "platform": "windows",
    "os_version": "Windows 11",
    "kernel_version": null,

    "containerized": false,
    "container_engine": null,

    "process": {
      "pid": 12345,
      "command": "ollama run gemma4-rust-coder-latest",
      "threads": 16,
      "batch_size": 512,
      "gpu_layers": 99,
      "parallel": 1
    }
  },

  "token_metrics": {
    "input_tokens": 20,
    "output_tokens": 20,
    "total_tokens": 40,

    "prompt_eval_tokens": 20,
    "generation_tokens": 20,

    "tokens_per_second": 103.06,
    "prompt_tokens_per_second": 150.00,
    "generation_tokens_per_second": 103.06,

    "time_to_first_token_ms": 245,
    "latency_ms": 43320,

    "throughput": {
      "min_tps": 91.12,
      "max_tps": 114.55,
      "avg_tps": 103.06,
      "p50_tps": 101.10,
      "p95_tps": 112.02,
      "p99_tps": 114.00
    }
  },

  "sampling": {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "repeat_penalty": 1.1,
    "presence_penalty": 0.0,
    "frequency_penalty": 0.0,
    "mirostat": 0,
    "stop_sequences": []
  },

  "hardware": {
    "machine": {
      "hostname": "DESKTOP-01",
      "manufacturer": "Custom Build",
      "motherboard": "ASUS ROG",
      "bios_version": "1.0.0"
    },

    "cpu": {
      "name": "AMD Ryzen 9 7950X",
      "vendor": "AMD",
      "architecture": "Zen4",
      "physical_cores": 16,
      "logical_cores": 32,
      "base_clock_mhz": 4500,
      "boost_clock_mhz": 5700,

      "usage": {
        "start_percent": 12.0,
        "end_percent": 18.0,
        "min_percent": 8.0,
        "min_percent_at": "2026-05-27T00:46:59.000Z",
        "max_percent": 76.0,
        "max_percent_at": "2026-05-27T00:47:22.000Z",
        "avg_percent": 42.3
      },

      "temperature": {
        "start_c": 42.0,
        "end_c": 63.0,
        "min_c": 39.0,
        "min_c_at": "2026-05-27T00:46:53.739Z",
        "max_c": 72.0,
        "max_c_at": "2026-05-27T00:47:15.000Z",
        "avg_c": 61.2
      },

      "power": {
        "start_w": 45.0,
        "end_w": 96.0,
        "min_w": 38.0,
        "min_w_at": "2026-05-27T00:46:54.000Z",
        "max_w": 142.0,
        "max_w_at": "2026-05-27T00:47:18.000Z",
        "avg_w": 91.6
      },

      "clock": {
        "start_mhz": 4200,
        "end_mhz": 5100,
        "min_mhz": 3900,
        "min_mhz_at": "2026-05-27T00:46:58.000Z",
        "max_mhz": 5500,
        "max_mhz_at": "2026-05-27T00:47:20.000Z",
        "avg_mhz": 4950
      }
    },

    "gpu": {
      "name": "NVIDIA RTX 4090",
      "vendor": "NVIDIA",
      "driver_version": "576.02",
      "vram_total_mb": 24564,

      "utilization": {
        "start_percent": 0,
        "end_percent": 72,
        "min_percent": 0,
        "min_percent_at": "2026-05-27T00:46:53.739Z",
        "max_percent": 99,
        "max_percent_at": "2026-05-27T00:47:08.000Z",
        "avg_percent": 81.5
      },

      "temperature": {
        "start_c": 39,
        "end_c": 58,
        "min_c": 39,
        "min_c_at": "2026-05-27T00:46:53.739Z",
        "max_c": 67,
        "max_c_at": "2026-05-27T00:47:18.000Z",
        "avg_c": 59.1
      },

      "hotspot_temperature": {
        "start_c": 48,
        "end_c": 71,
        "min_c": 48,
        "min_c_at": "2026-05-27T00:46:53.739Z",
        "max_c": 83,
        "max_c_at": "2026-05-27T00:47:20.000Z",
        "avg_c": 72.2
      },

      "memory_usage": {
        "start_mb": 2200,
        "end_mb": 12400,
        "min_mb": 2200,
        "min_mb_at": "2026-05-27T00:46:53.739Z",
        "max_mb": 14320,
        "max_mb_at": "2026-05-27T00:47:12.000Z",
        "avg_mb": 12780
      },

      "memory_clock": {
        "start_mhz": 405,
        "end_mhz": 10501,
        "min_mhz": 405,
        "min_mhz_at": "2026-05-27T00:46:53.739Z",
        "max_mhz": 10501,
        "max_mhz_at": "2026-05-27T00:47:05.000Z",
        "avg_mhz": 9540
      },

      "core_clock": {
        "start_mhz": 210,
        "end_mhz": 2730,
        "min_mhz": 210,
        "min_mhz_at": "2026-05-27T00:46:53.739Z",
        "max_mhz": 2895,
        "max_mhz_at": "2026-05-27T00:47:10.000Z",
        "avg_mhz": 2680
      },

      "power": {
        "start_w": 22,
        "end_w": 295,
        "min_w": 22,
        "min_w_at": "2026-05-27T00:46:53.739Z",
        "max_w": 412,
        "max_w_at": "2026-05-27T00:47:11.000Z",
        "avg_w": 318
      },

      "fan_speed": {
        "start_rpm": 0,
        "end_rpm": 1450,
        "min_rpm": 0,
        "min_rpm_at": "2026-05-27T00:46:53.739Z",
        "max_rpm": 2100,
        "max_rpm_at": "2026-05-27T00:47:24.000Z",
        "avg_rpm": 1620
      },

      "pcie": {
        "generation": "PCIe 4.0",
        "link_width": "x16",
        "rx_throughput_mb": {
          "max": 2400,
          "avg": 1600
        },
        "tx_throughput_mb": {
          "max": 1100,
          "avg": 740
        }
      }
    },

    "ram": {
      "total_mb": 65536,

      "usage": {
        "start_mb": 10240,
        "end_mb": 16800,
        "min_mb": 10240,
        "min_mb_at": "2026-05-27T00:46:53.739Z",
        "max_mb": 18200,
        "max_mb_at": "2026-05-27T00:47:21.000Z",
        "avg_mb": 15400
      },

      "temperature": {
        "start_c": 36,
        "end_c": 44,
        "min_c": 36,
        "min_c_at": "2026-05-27T00:46:53.739Z",
        "max_c": 49,
        "max_c_at": "2026-05-27T00:47:25.000Z",
        "avg_c": 43
      }
    },

    "storage": {
      "device": "Samsung 990 PRO",
      "interface": "NVMe",

      "temperature": {
        "start_c": 41,
        "end_c": 52,
        "min_c": 41,
        "min_c_at": "2026-05-27T00:46:53.739Z",
        "max_c": 58,
        "max_c_at": "2026-05-27T00:47:28.000Z",
        "avg_c": 50
      },

      "read_speed_mb_s": {
        "max": 5200,
        "avg": 1800
      },

      "write_speed_mb_s": {
        "max": 2400,
        "avg": 740
      }
    }
  },

  "energy": {
    "estimated_total_energy_wh": 5.24,

    "gpu_energy_wh": 3.84,
    "cpu_energy_wh": 1.12,
    "system_energy_wh": 5.24,

    "peak_system_power_w": 612,
    "avg_system_power_w": 438
  },

  "quality": {
    "score": 0.54321,
    "passed": true,

    "metrics": {
      "syntax_correctness": 0.91,
      "compilation_success": 1.0,
      "unit_test_pass_rate": 0.62,
      "semantic_similarity": 0.55
    }
  },

  "sampling_timeline": {
    "interval_ms": 1000,
    "samples_collected": 43,

    "source": "LibreHardwareMonitor",
    "export_format": "HML"
  },

  "validation": {
    "schema_valid": true,
    "missing_fields": [],
    "warnings": [],
    "errors": []
  }
}
```

---

# Recommended Rules

## Required Statistical Fields

Every measurable metric SHOULD contain:

```json
{
  "start": 0,
  "end": 0,
  "min": 0,
  "min_at": "timestamp",
  "max": 0,
  "max_at": "timestamp",
  "avg": 0
}
```

---

# Recommended Metric Categories

## Performance
- TPS
- latency
- TTFT
- throughput
- token generation

## Thermal
- CPU temp
- GPU temp
- hotspot temp
- VRAM temp
- SSD temp
- RAM temp

## Power
- CPU watt
- GPU watt
- system watt
- energy usage

## Memory
- VRAM usage
- RAM usage
- KV cache
- swap usage

## Clocks
- GPU core clock
- GPU memory clock
- CPU clock

## Utilization
- CPU usage
- GPU usage
- memory controller
- PCIe bandwidth

---

# Important Design Advice

## DO NOT flatten everything

BAD:

```json
"max_gpu_temp": 72
```

GOOD:

```json
"temperature": {
  "max_c": 72,
  "avg_c": 61
}
```

Because future metrics explode fast.

---

# Recommended Future-Proof Additions

## Multi-GPU

```json
"gpus": [
  {},
  {}
]
```

---

## Time-Series Raw Samples

```json
"timeseries": {
  "gpu_temp": [
    {
      "timestamp": "...",
      "value": 62
    }
  ]
}
```

---

## Benchmark Reproducibility

```json
"environment": {
  "git_commit": "abc123",
  "docker_image": "benchmark:v1",
  "cuda_version": "12.8",
  "driver_version": "576.02"
}
```

---

# Best Practice

Separate into 3 files in production:

```text
metrics.json        -> summarized metrics
samples.jsonl       -> raw per-second samples
metadata.json       -> static environment info
```

This scales MUCH better for:
- dashboards
- Grafana
- ClickHouse
- DuckDB
- TimescaleDB
- Prometheus
- analytics pipelines
- ML performance regression tracking

