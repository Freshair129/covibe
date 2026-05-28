# CoVibe Benchmark Changelog

## [2.1.0] - 2026-05-28 - Restructure Revision

### Added
- Created `benchmark-kits/` to consolidate `tasks/` and `ammunition/` (payloads).
- Created `benchmark-run/` as a dedicated, isolated directory for all generated test results and artifacts.
- Created `telemetry_logs/` to centralize all hardware monitoring logs (HWiNFO, MSI Afterburner, LibreHardwareMonitor).
- Renamed `template/` to `templates/` to standardise schema definitions.

### Changed
- **EABS-01 Version Update:** Bumped version to 2.1.0 to reflect the new directory hierarchy.
- **Orchestrator (`run_csb_01.py`):** Updated all hardcoded paths to point to the new `benchmark-kits/` and `benchmark-run/` directories.
- **Verifier (`verify_csb_01.py`):** Updated target directories to scan `benchmark-run/` and moved the `tmp_verify` sandbox inside `benchmark-run/` to keep the root clean.
- **Slicer (`slice_hw_logs.py`):** Updated log source paths to prioritize the new `telemetry_logs/` directory before falling back to absolute system paths.

---

## 🔄 Workflow & Data Flow Comparison

### 📉 Old Architecture (v2.0.1 and prior)
- **Data Flow:** Tasks and Payloads were read from the root `benchmark/tasks` and `G:/covibe/payloads`. Results were dumped directly into `benchmark/results/` or scattered model folders. Hardware logs were pulled directly from `D:\hw_log\`.
- **Workflow:** Scripts were tightly coupled to the root directory. Temporary verification files cluttered the main benchmark space.

### 📈 New Architecture (v2.1.0)
- **Data Flow:**
  1. `run_csb_01.py` reads definitions from `benchmark-kits/`.
  2. Inference outputs and artifacts are strictly written to `benchmark-run/<model_name>/<level>/`.
  3. `slice_hw_logs.py` reads raw hardware data from `telemetry_logs/` and outputs `samples.jsonl` into the specific `benchmark-run/` trace folders.
  4. `verify_csb_01.py` operates entirely within `benchmark-run/`, building its sandbox there and updating the local `metrics.json`.
- **Workflow:** Clean separation of concerns. Developers modify tests in `benchmark-kits/` and analyze outputs exclusively in `benchmark-run/`.

### ⚖️ Pros & Cons of the New Structure

**Pros:**
- **Enterprise Cleanliness:** Total separation of source code (kits/scripts) from generated data (runs/logs).
- **Traceability & Portability:** Centralizing hardware logs into `telemetry_logs/` means the entire benchmark dataset can be zipped and moved without breaking references.
- **Safe Sandboxing:** Moving `tmp_verify` into `benchmark-run/` prevents accidental deletion of source files during cleanup phases.

**Cons:**
- **Path Complexity:** Scripts now require deeper, more complex path resolutions (e.g., `../../benchmark-kits/tasks/...`).
- **Migration Overhead:** Existing external tools or dashboards pointing to the old `benchmark/results/` directory will need to be updated to point to `benchmark-run/`.
