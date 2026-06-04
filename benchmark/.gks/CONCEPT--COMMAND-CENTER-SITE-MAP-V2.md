# CONCEPT--COMMAND-CENTER-SITE-MAP-V2
**Status:** PROPOSED | **Priority:** CRITICAL

## 1. Vision Statement
Implement a hierarchical navigation system for the CoVibe Command Center that balances strategic overview, knowledge management, and low-level technical observability. The UI SHALL adhere to the "Modern Glass" design language and support all existing benchmark and graph features.

## 2. Site Map Hierarchy (Refined)

### **Domain A: Project Overview**
*Top Nav Item 1 | Icon: ti-layout-dashboard*
*   **A1: Dashboard:** System health, Token ROI, Active Agent status. (Icon: `pie-chart`)
*   **A2: Manager Board:** Roadmap tracking, Phase/Sprint status. (Icon: `layout-kanban`)
*   **A3: Plugins:** Extension registry and capability management. (Icon: `plug`)
*   **A4: Agent:** Agent Roster, Model configurations, System Prompts. (Icon: `robot`)

### **Domain B: Genesis Knowledge System (GKS)**
*Top Nav Item 2 | Icon: ti-brain*
*   **B1: Code Structure:** Tree-sitter powered codebase hierarchy. (Icon: `hierarchy-2`)
*   **B2: Business Logic:** Protocol definitions, Flow charts, RCA logs. (Icon: `file-code`)
*   **B3: Codebase Graph:** Multi-view interactive nodes (AST, Call Graph, Data Flow). (Icon: `binary-tree-2`)

### **Domain C: Genesis Block DB**
*Top Nav Item 3 | Icon: ti-database*
*   **C1: Obsidian View:** Atomic knowledge query and markdown browsing. (Icon: `notes`)
*   **C2: Vector Store:** HNSW Visualization and semantic search logs. (Icon: `binary-tree`)
*   **C3: GraphRAG:** Relationship-based knowledge retrieval visualizer. (Icon: `vector-triangle`)

### **Domain D: AI Benchmark**
*Top Nav Item 4 | Icon: ti-trending-up*
*   **D1: Execution:** Model selection, Power/Clock tuning, Run control. (Icon: `player-play`)
*   **D2: Telemetry:** Reactor animation, Trend analysis matrix, Heatmap. (Icon: `activity`)
*   **D3: Reports:** EABS-01 Campaign summaries and Compliance logs. (Icon: `file-analytics`)

## 3. UI/UX Interaction Principles
*   **Domain Persistence:** Selecting a Parent Domain updates the Sidebar but preserves the central "Main View" until a Sub-item is clicked.
*   **Contextual Styles:**
    *   `Overview`: Primary Accent (Emerald)
    *   `GKS`: Intelligence Accent (Indigo/Blue)
    *   `Benchmark`: Performance Accent (Orange/Amber)
*   **A11y:** Every input SHALL have a corresponding label or aria-label.

## 4. Next Step: Implementation
- Refactor `domainRegistry` object in `codev_dashboard.html`.
- Add placeholder sections for `Plugins` and `GraphRAG`.
- Finalize "Modern Glass" Sidebar CSS with 8px rhythm spacing.
