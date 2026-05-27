# Standard Operating Procedure (SOP): AI Benchmark Protocol (CoVibe Ecosystem)

**Status:** APPROVED & BATTLE-TESTED
**Target Audience:** Autonomous AI Agents / Human Supervisors
**Context:** This is a fully self-contained document. If you are an AI Agent tasked with running benchmarks for the CoVibe project, you MUST follow these protocols strictly to prevent hardware crashes, infinite generation loops, and encoding errors.

---

## 1. Objective and Architecture
To accurately evaluate Local LLMs vs. Cloud APIs (ThaiLLM & Gemini) simultaneously without crashing the host machine.
- **Architecture:** Local models run sequentially (one at a time) to manage VRAM. Cloud APIs are fired asynchronously in parallel with the local execution to measure network latency vs local raw throughput.

---

## 2. Hardware Constraints & Pre-flight Tuning (CRITICAL)
The host machine runs an **i7-8700K and RTX 3060 (12GB VRAM)**.

### 2.1 The TDR Barrier
Running large models (14B+) or extreme context windows (32K) can trigger a Timeout Detection and Recovery (TDR) crash, resulting in a black screen.
- **Required Action:** Before initiating tests, the host MUST use MSI Afterburner to set:
  - **Core Clock:** -104 MHz
  - **Power Limit:** 90%

### 2.2 Thermal & Power Rules
- **Safe Zone:** < 65°C
- **Danger Zone:** > 71°C or Power Draw > 152W.
- **Cool-down Policy:** The orchestrator script MUST include a mandatory 10 to 120-second `time.sleep()` between local model swaps to dissipate heat.

---

## 3. Known Incidents & Software Hardening
If you are writing or executing Python benchmarking scripts (`great_orchestrator.py`), you must implement these three safeguards:

### 3.1 Incident 1: "The Infinite Loop"
- **Problem:** Models (especially RL-tuned models like Sushi) can get stuck in a reasoning loop, generating 1000+ lines of redundant text until VRAM is exhausted.
- **Solution (Loop Guard):** Ollama API requests must explicitly pass `num_predict: 2500` and specific stop tokens (e.g., `["<|im_end|>", "### END"]`). Furthermore, the HTTP request must have a strict timeout (e.g., `timeout=300`).

### 3.2 Incident 2: "The CP1252 Emoji Crash"
- **Problem:** When an AI generates a high-plane Unicode character (like '😀'), the default Windows terminal encoding (CP1252) crashes the Python script.
- **Solution (UTF-8 Force):** Scripts must force UTF-8 at the OS level:
  ```python
  import sys, codecs
  if sys.platform == "win32":
      sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
  ```

### 3.3 Incident 3: "The Think-Tag Pollution"
- **Problem:** Reinforcement Learning models prepend their logic with `<think>...</think>`. This pollutes regex extractors and token counts.
- **Solution (Reasoning Strip):** Apply regex post-processing: `re.sub(r"<think>.*?</think>", "", response, flags=re.DOTALL)` before calculating final logic accuracy.

---

## 4. Benchmark Task Bank & Testkit Assembly
To ensure modularity, tasks are separated from the orchestrator logic. Agents must assemble a **Benchmark-Testkit** by following this registry.

### 4.1 Task Registry (`benchmark/tasks/`)
- **L1_BASE:** Core SWE utilities and boilerplate.
- **L2_LOGIC:** Algorithmic and architectural challenges.
- **L3_DOMAIN:** Project-specific CoVibe logic (Vitest, YouTube API).
- **L4_STRESS:** Maximum context and reasoning pressure tests.
- **L5_INCIDENTS:** Real-world RCA scenarios based on actual project failures (e.g., CSP blocks, Encoding crashes). Used to test the "Seniority" and "Debugging" capabilities of an agent.

### 4.2 Testkit Assembly Protocol
When creating a new benchmark run, the agent must:
1. Select one or more **Tasks** from the registry.
2. Pair each task with a corresponding **Payload** from `payloads/` (8K, 16K, or 32K).
3. Update the `metadata.json` to reflect the chosen task-kit combination.
4. Execute via the orchestrator, pointing to the external task files.

---

## 5. Telemetry & Data Synthesis Pipeline (Enterprise Structure)

You must not rely on estimated hardware metrics. You must adopt the "Structured Telemetry Pattern" for all runs.

### 5.1 Directory Structure
Each benchmark task must be stored in the following hierarchy:
```text
benchmark/<model_id>/<task_id>/
├── metadata.json       # Immutable environment info (Hardware, Runtime, Drivers)
├── metrics.json        # Summary metrics (Avg TPS, Max Temp, Power, Quality Score)
├── samples.jsonl       # Time-series telemetry (GPU, CPU, Memory per second)
├── events.jsonl        # Timeline of execution (Load, Generation, Finish)
└── artifacts/          # Raw data for auditing
    ├── prompt.txt      # The exact prompt sent
    ├── response.txt    # The raw AI response
    └── logs.txt        # Combined terminal/script output
```

### 5.2 Data Collection
- **Primary Tool:** MSI Afterburner Hardware Monitor (`D:\hw_log\HardwareMonitoring.hml`).
- **Deep Monitoring Tools:** For advanced diagnostics, use **HWiNFO** or **Libre Hardware Monitor** (`G:\HWiNFO`).

### 5.3 The Slicing & Synthesis Process
1. The Orchestrator records exact start/end timestamps.
2. The `slice_hw_logs.py` script generates `samples.jsonl` by mapping timestamps to Afterburner/HWiNFO data.
3. Summary statistics from `samples.jsonl` are aggregated into `metrics.json`.
4. Environment details are captured into `metadata.json` at the start of the session.

### 5.4 Presentation
Results must be integrated into **Dashboard v17.0+**, enabling interactive Deep Dive cards with real-time gauges and time-series trend charts.

