# ADR: Integrating Graph-ML Models into the SRS Pipeline (SRS-G)

**Status:** PROPOSED
**Date:** 2026-05-31
**Architect:** Rwang (อาหวัง)

## 1. Context
While the SRS (Semantic-Rerank-Symbol) pipeline provides high precision, it lacks understanding of the "Topological Context" (how code parts are physically connected). Complex bugs often involve long chains of dependencies that pure text search misses.

## 2. Decision
We will evolve the SRS pipeline into **SRS-G** by integrating a **Graph Intelligence Zoo**. 

### New Components:
*   **Graph Reasoning:** Use `GraphsGPT-8W` to analyze GKS Call Graphs.
*   **Sub-graph Reranking:** Use `Graphormer` to rank code snippets not just by text content, but by their position in the architecture.
*   **Mode Toggle:** Allow the system to switch between "Dense Vector" (Fast) and "Graph-Augmented" (Deep Reasoning).

## 3. Rationale
*   **Precision:** Graph models can identify "hidden" dependencies that regular embeddings might overlook (e.g., side effects in a distant module).
*   **Future Proofing:** Prepares the system for full-scale **GraphRAG** implementation.

## 4. Consequences
*   **Complexity:** Managing 171+ potential models. 
*   **Strategy:** Curate a "Top 4" selection in the UI for immediate use, while maintaining a registry for the full zoo.
