# Guided Knowledge System (GKS)

The `.gks` directory serves as the **Guided Knowledge System** for the CoVibe Benchmark environment. It contains a standardized set of Obsidian/Vault-compatible Markdown templates.

These templates enforce strict documentation structures, ensuring that architectural decisions, data flows, incident reports, and standard operating procedures (SOPs) are captured consistently across the project.

## 📂 Template Taxonomy

| Template ID | Purpose | Typical Use Case |
| :--- | :--- | :--- |
| **`ALGO--`** | Algorithm Design | Documenting complex logic (e.g., Drift Correction math). |
| **`ENTITY--`** | Data Models | Defining schemas for `metrics.json`, `events.jsonl`, etc. |
| **`FLOW--`** | Architecture & Data Flow | Visualizing step-by-step processes (e.g., `FLOW--BENCHMARK.md`). |
| **`FRAMEWORK--`**| Foundational Rules | Defining overarching standards (like EABS-01). |
| **`GUARD--`** | Safety & Constraints | Documenting limits (e.g., Thermal limits, VRAM restrictions). |
| **`INC--`** | Incident Reports | Post-mortems for crashes or TDR driver resets. |
| **`ISSUE--`** | Bug Tracking | Detailed bug reports requiring RCA. |
| **`PARAMS--`** | Configuration Sets | Storing optimal model parameters (Temp, Top_P, Context). |
| **`PROTOCOL--`** | Standard Operating Procedures | Step-by-step instructions for tasks (e.g., Setup MSI Afterburner). |
| **`RISK--`** | Risk Assessments | Documenting potential hazards (e.g., Emoji Crash, Infinite Loops). |
| **`RUNBOOK--`** | Emergency/Ops Guides | How to recover a failed benchmark or restart a crashed GPU. |
| **`SAFETY--`** | Operational Hazards | Specific safety guidelines (e.g., Max Power Draw rules). |
| **`SKILL--`** | Agent Capabilities | Defining specific tasks or workflows the AI Agent is authorized to perform. |

## 🚀 Usage Rules

1.  **Immutability:** Do not alter the frontmatter fields (`tier`, `phase`, `status`, etc.) without authorization.
2.  **Cross-linking:** Always use the `crosslinks` section to connect related documents (e.g., link an `INC--` to a `GUARD--`).
3.  **Naming Convention:** When creating a new document, copy the relevant template and name it `[TYPE]--[NAME].md` (e.g., `PROTOCOL--GPU-TUNING.md`).
