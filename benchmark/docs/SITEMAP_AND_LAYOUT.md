# CoVibe Command Center: Site Map & UI Layout (v2.5)

**Status:** STABLE | **Date:** 2026-06-01
**Architecture Pattern:** Domain-Driven UI (Top Nav + Contextual Sidebar)

---

## 1. Site Map Hierarchy

The system is organized into **4 Parent Domains** (Top Navigation) and **16 Sub-modules** (Sidebar).

### **Domain A: Project Overview**
*Strategic management and high-level health monitoring.*
*   **A1: Dashboard:** Real-time system health, Token ROI, and Active Agent status.
*   **A2: Manager Board:** Development roadmap, phase tracking, and sprint status.
*   **A3: Plugins:** Management of extensions, tools, and system capabilities.
*   **A4: Agent Roster:** List of available models (Gemini, Qwen, Local) and brain configurations.

### **Domain B: Genesis Knowledge System (GKS)**
*Code intelligence and structural understanding.*
*   **B1: Code Structure:** Tree-sitter powered file hierarchy and class mapping.
*   **B2: Business Logic:** Functional specifications, protocol definitions, and flow charts.
*   **B3: Graph Studio:** Interactive Node Builder for manual flow design and logic mapping.
*   **B4: Codebase Graph:** Automated visualizers (AST, Call Graph, Dependency Graph).

### **Domain C: Genesis Block DB**
*Intelligence storage and retrieval analytics.*
*   **C1: Explorer Hub:** Table view of symbols, knowledge blocks, and raw data.
*   **C2: Processing Lab:** **[Graph Intelligence Zoo]** Model selection (Jina, Voyage) and chunking.
*   **C3: Retrieval Studio:** **[SRS-G Debugger]** Semantic search vs. Graph-Augmented testing.
*   **C4: Symbol Linker:** Direct bridge between documentation and live source code.
*   **C5: Vector Store:** HNSW layered visualization of semantic embeddings.

### **Domain D: AI Benchmark**
*Performance verification and hardware safety.*
*   **D1: Execution:** Model selection, underclocking control, and run triggers.
*   **D2: Telemetry:** Cyber Reactor, trend analysis matrix, and thermal heatmap.
*   **D3: Reports:** Compliance logs and Level 1-5 campaign summaries (EABS-01).

---

## 2. UI Layout Architecture

### **2.1 Global Structure**
```text
[   TOP DOMAIN NAVIGATION (Fixed 56px)   ]
------------------------------------------
[ SIDEBAR ] [                           ]
[ (256px) ] [     MAIN CONTENT AREA     ]
[  Fixed  ] [    (Scrollable Fluid)     ]
[         ] [                           ]
[---------] [                           ]
[ FOOTER  ] [                           ]
```

### **2.2 Navigation Logic**
1.  **Top Domain Bar:** Swaps the *context* of the application. Clicking a domain updates the Sidebar items immediately.
2.  **Modern Glass Sidebar:**
    *   **Context Brand:** Displays the active Domain title and icon.
    *   **Sub-Nav:** Lists actions specific to the active Domain.
    *   **Expand/Collapse:** Sidebar can be toggled between 256px and 72px width.
3.  **Main Content:** Uses a multi-section wrapper (`#roadmap-view`, `#gdb-view-container`, etc.) where visibility is managed by `switchMainView()` and `switchDomainSubTab()`.

### **2.3 Design Language (Glassmorphism)**
*   **Backdrop:** `backdrop-blur-xl` + `bg-secondary/80`.
*   **Borders:** `1px solid rgba(255, 255, 255, 0.1)`.
*   **Accents:**
    *   Overview: **Emerald** (`#10b981`)
    *   GKS: **Indigo** (`#6366f1`)
    *   Benchmark: **Orange** (`#f59e0b`)

---

## 3. Interaction Mapping
| Action | JS Function | Target ID |
|---|---|---|
| Switch Domain | `switchDomain(id)` | `.domain-tab-btn` |
| Switch Sidebar Item | `handleSubNavClick(id, el)` | `.sub-nav-item` |
| Switch Main View | `switchMainView(id)` | `#main-wrapper > div` |
| Switch GDB Sub-tab | `switchDomainSubTab(id)` | `.gdb-sub-view` |
