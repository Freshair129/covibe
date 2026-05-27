# CoVibe Great Parallel Benchmark Ultraplan (v4.0 - Final Hardened Edition)

## 🎯 Objective
Execute the definitive performance showdown between the **Full Local Roster (7 Models)** and **Cloud Elite APIs (5 Models)**. This run is meticulously designed to balance maximum stress testing (32K Context) with rigorous hardware safety (71°C TDR Guard) and precision data correlation.

## 📦 Scope & Final Roster
**Local Arena (Sequential - SSD Optimized):**
1. `sushirl:latest` (9B - The RL Engine)
2. `qwopus3.5-9b` (9B - The Challenger)
3. `qwen3:latest` (14B - Architect | **Strict 8K Boundary**)
4. `qwen3.5:4b` (4B - Speed King)
5. `chinda-qwen3-4b` (4B - Thai Expert)
6. `gemma4-rust-coder` (3.4B - Systems Specialist)
7. `llama3.2:1b` (1.3B - Micro Agent)

**Cloud Arena (Asynchronous - API Driven):**
1. `pathumma-3.0-think` (ThaiLLM)
2. `typhoon-s-instruct` (ThaiLLM)
3. `thalle-0.2-fa` (ThaiLLM)
4. `openthaigpt-7.2` (ThaiLLM)
5. `gemini-2.0-flash` (Google Cloud)

## ⚙️ Architecture & Orchestration (Hardened v2.0)

### 1. The Great Orchestrator (`scripts/great_orchestrator.py`)
- **Async Execution:** Fires Cloud API requests in parallel while Local models process one-by-one.
- **Streaming & Feedback:** Real-time progress dots for local inference.
- **Smart Cleansing:** Automatic `<think>` tag stripping and `re.sub` pre-processing.
- **Windows Safety:** Mandatory `utf-8` encoding for terminal and file I/O to prevent Emoji-induced crashes.

### 2. Extreme Telemetry Mapping
- **Log Source:** Direct extraction from `D:\hw_log\HardwareMonitoring.hml` (MSI Afterburner).
- **Correlation:** Orchestrator logs exact timestamps to slice Afterburner's 18+ metrics (Per-core CPU, MHz Clocks, Power).
- **Dashboard v17.0:** Displaying results in the newly integrated "X-Dashboard Style" per-model cards.

## 🚀 Execution Phases

### Phase 1: Pre-flight Checklist (Mandatory)
1. [ ] **Hardware Tuning:** Confirm MSI Afterburner set to -104MHz Core / 90% Power.
2. [ ] **Link Integrity:** Confirm all 17 Blobs are linked via `fix_ollama_links.ps1`.
3. [ ] **Logging:** Ensure MSI Afterburner is logging to `D:\hw_log\`.
4. [ ] **Payloads:** Run `scripts/generate_payloads.py` to refresh 8K, 16K, 32K context files.

### Phase 2: The Great Run (The 4 Rounds)
- **Round 1 (L1 - 8K):** Standard SWE Utility (Baseline Speed).
- **Round 2 (L1 - 16K):** High-payload Prototyping (VRAM Pressure).
- **Round 3 (L3 - 16K):** **Vitest Logic Generation** (Expert Reasoning Validation).
- **Round 4 (L2 - 32K):** **Max-Context Stress Test** (Exclusive to 9B models and Cloud).

### Phase 3: Final Synthesis
- Automated merge of JSON performance metrics and HML hardware logs.
- Update `docs/benchmark_report.md` to "Ultimate Master Edition".

## 🛡️ Safety & Guardrails
- **Thermal Stop:** Mandatory 2-min pause if GPU > 65°C between local runs.
- **Hard Stop:** `num_predict: 2500` applied to all Ollama calls to kill reasoning loops.
- **Timeout:** 300s strict timeout for local HTTP requests.
