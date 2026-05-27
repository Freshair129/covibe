# Runbook & Test Specification: CoVibe AI Battle Arena

**Version:** 1.0
**Reference Standard:** EABS-01 v2.0
**Target Environment:** Local (RTX 3060) + Cloud (ThaiLLM/Gemini)

---

## 1. Test Specification (The "What")
This section defines the parameters of the current benchmark campaign.

### 1.1 Competitor Roster
- **Local Arena:** Sushi RL (9B), Qwopus 3.5 (9B), Qwen 3 (14B), Qwen 3.5 (4B), Chinda (4B), Gemma 4 (3.4B), Llama 3.2 (1B).
- **Cloud Arena:** Pathumma 3.0, Typhoon-S, Thalle 0.2, OpenThaiGPT 7.2, Gemini 2.0 Flash.

### 1.2 The Mission Matrix
| Round | Level | Task Source | Payload | Goal |
| :--- | :--- | :--- | :--- | :--- |
| **R1** | L1_BASE | `tasks/L1_BASE/async_retry_ts.txt` | 8K | Baseline Speed & Type Safety |
| **R2** | L2_LOGIC | `tasks/L2_LOGIC/circuit_breaker_ts.txt` | 16K | Architectural Reasoning |
| **R3** | L3_DOMAIN | `tasks/L3_DOMAIN/vitest_unit_test_gen.txt`| 16K | CoVibe Context Understanding |
| **R4** | L4_STRESS | `tasks/L4_STRESS/reasoning_stress_test.txt`| 32K | VRAM & Logic Stability |

---

## 2. Operational Runbook (The "How")
Follow these steps strictly to execute a successful "Battle Arena" run.

### Step 1: Pre-flight Checklist (Hardware)
- [ ] Open **MSI Afterburner**.
- [ ] Set **Core Clock Offset** to `-104 MHz`.
- [ ] Set **Power Limit** to `90%`.
- [ ] Ensure **Logging** is active to `D:\hw_log\HardwareMonitoring.hml`.
- [ ] Verify **Link Integrity** by running `fix_ollama_links.ps1.md` in Admin shell.

### Step 2: Resource Preparation
- [ ] Run `python scripts/generate_payloads.py` to refresh context ammunition.
- [ ] Verify all tasks exist in `benchmark/tasks/`.

### Step 3: Battle Execution
- [ ] Run the Orchestrator:
  ```bash
  python scripts/great_orchestrator.py
  ```
- [ ] **Monitor Terminal:** Look for "❤" heartbeat and Sneak Peeks to detect loops.
- [ ] **Thermal Watch:** If GPU Temp > 71°C, stop immediately.

### Step 4: Data Post-Processing
- [ ] **Organize:** Run `python scripts/organize_results.py` to move results into Enterprise Hierarchy.
- [ ] **Slice Logs:** Run `python scripts/slice_hw_logs.py` to correlate Afterburner data with AI performance.

### Step 5: Dashboard Refresh
- [ ] Open `covibe_ai_benchmark_dashboard.html`.
- [ ] Verify the new data is correctly hydrated into the **Battle Matrix** and **Champion Cards**.

---

## 3. Success Criteria
- [X] 0 Hardware Crashes (No TDR).
- [X] <think> tags removed from all Purified Artifacts.
- [X] Each model has a matching `hardware_telemetry.csv` in its folder.
- [X] Dashboard v17.0+ correctly renders real-data gauges.

**RUNBOOK END.**
