# Benchmark Specification: Llama 3.2 1B Total Arena (All levels L1-L5)

**Reference ID:** BENCH-LLAMA-TOTAL-01
**Version:** 1.0
**Target Model:** `llama3.2:1b` (1.3 GB)
**Hardware Baseline:** EABS-01 Hardened (RTX 3060 12GB)

---

## 🎯 Test Objective
Conduct a comprehensive performance and stability sweep for the **Llama 3.2 1B** model across all difficulty tiers (L1 to L5) and a wide range of context windows (4K to 64K). The goal is to identify the model's performance decay and VRAM utilization as context pressure increases.

---

## 📦 Test Assembly (The Matrix)

### 1. Task Roster (All Levels)
- **L1_BASE:** `tasks/L1_BASE/async_retry_ts.txt`
- **L2_LOGIC:** `tasks/L2_LOGIC/circuit_breaker_ts.txt`
- **L3_DOMAIN:** `tasks/L3_DOMAIN/vitest_unit_test_gen.txt`
- **L4_STRESS:** `tasks/L4_STRESS/reasoning_stress_test.txt`
- **L5_INCIDENTS:**
    - `tasks/L5_INCIDENTS/regex_think_collision.txt`
    - `tasks/L5_INCIDENTS/csp_eval_block.txt`
    - `tasks/L5_INCIDENTS/windows_encoding_emoji.txt`
- **KIT INTEGRATION:** `Standard-Logic-Test` full suite.

### 2. Context Windows (The Pressure)
- **4K (Drafting):** Baseline minimal.
- **8K (Standard):** Production baseline.
- **16K (Heavy):** Standard project context.
- **32K (Extreme):** Maximum advertised local safe limit.
- **64K (Critical):** Stress test for small model KV-cache compression.

---

## ⚙️ Execution Logic (Runbook)

### Phase 1: Ammunition Prep
1.  Run `scripts/generate_payloads.py` updated to include 4K and 64K files.
2.  Verify `payloads/payload_4k.txt` and `payloads/payload_64k.txt` exist.

### Phase 2: Orchestration
1.  Initialize `system_monitor.ps1` or MSI Afterburner logging.
2.  Execute a targeted loop using `scripts/execute_campaign.py`:
    - Loop 1: Context Windows [4k, 8k, 16k, 32k, 64k]
    - Loop 2: All Tasks [L1..L5]
3.  Implement mandatory **30s cool-down** between 64K runs to prevent thermal saturation.

### Phase 3: Synthesis
1.  Run `organize_results.py` to move results to `benchmark/llama3.2-1b/`.
2.  Run `slice_hw_logs.py` to extract per-run hardware telemetry.
3.  Update Dashboard to v18.0 (Glassmorphism) with these new results.

---

## 🛡️ Success Criteria & Safety
- **TDR Guard:** Monitor for VRAM overflow on the 64K runs (Llama 3.2 1B should fit comfortably, but KV-cache grows).
- **Infinite Loop:** `num_predict: 2500` applied strictly.
- **Accuracy:** Model must maintain logic consistency even at 64K context.

**DOCUMENT END.**
