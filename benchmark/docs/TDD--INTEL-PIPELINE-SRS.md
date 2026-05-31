# TDD: CoVibe Command Center - Genesis Block DB Refit

## 1. Overview
This document defines the implementation of the **SRS Intelligent Pipeline** and the UI reorganization of **Domain C (Genesis Block DB)** within the CoVibe Command Center.

## 2. Architectural Components

### 2.1 Domain C: Genesis Block DB (Analytics-First)
The current flat `database-view` and `vector-view` will be merged into a modular dashboard:
*   **Explorer Hub (C1):** Table view of symbols and knowledge blocks.
*   **Processing Lab (C2):** Embedding model selection (Jina/Voyage) and Semantic Chunking preview.
*   **Retrieval Studio (C3):** SRS pipeline debugger (Search -> Rerank results).
*   **Symbol Linker (C4):** Live bridge between Docs and Code (AST integration).
*   **Visualizer (C5):** HNSW Vector Space (Preserved from original).

### 2.2 Functional Requirements
*   **FR-01:** User shall be able to switch between different embedding models dynamically.
*   **FR-02:** System shall display "Similarity Score" before and after Neural Reranking.
*   **FR-03:** System shall provide a "Cache Hit" HUD showing latency savings.
*   **FR-04:** System shall render a live code preview when hovering over linked symbols.

## 3. Implementation Plan (Steps)
1.  **UI Core Refactor:** Update `codev_dashboard.html` navigation to include the 5 sub-modules in Domain C.
2.  **Logic injection:** Implement the `switchDomain('gdb')` and associated `switchSubTab` functions.
3.  **SRS Simulation:** Create the JS logic to simulate the 3-stage pipeline (Broad Search -> Neural Rerank -> Code Link).
4.  **Preservation:** Migrate the existing HNSW Cytoscape canvas into the new C5 tab without breaking edges.

## 4. Acceptance Criteria
*   [ ] Navigation between C1 -> C5 is seamless.
*   [ ] "Cache Hit Rate" indicator updates based on query frequency.
*   [ ] Code preview panel correctly pulls data from the Symbol Table.
