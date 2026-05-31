# ADR: Selecting SRS Architecture for CoVibe Intelligent Retrieval

**Status:** PROPOSED
**Date:** 2026-05-31
**Architect:** Rwang (อาหวัง)

## 1. Context
Current RAG (Retrieval-Augmented Generation) systems often fail in software engineering because they treat code as mere text. In the CoVibe Command Center, LLM agents need high-fidelity access to both documentation (Semantic) and the current state of the codebase (Symbols).

## 2. Decision
We will implement the **SRS Pipeline** (Semantic -> Rerank -> Symbol Link) as the core retrieval engine for the Genesis Block DB.

### Technical Stack:
*   **Embeddings:** `jina-embeddings-v5-text` (for NL) and `jina-code-embeddings` (for Source Code).
*   **Reranker:** `jina-reranker-v3` for neural-based ranking refinement.
*   **Vector Store:** HNSW (Hierarchical Navigable Small Worlds) for efficient O(log N) search.
*   **Linking:** Deterministic Symbol Matching against GKS Symbol Tables (AST/Call Graph).

## 3. Rationale
*   **Semantic Search** acts as a fast broad filter.
*   **Neural Reranking** reduces noise by 40-60% compared to pure vector search.
*   **Symbol Linking** ensures "Zero Hallucination" of code definitions by fetching the *live* file content.

## 4. Consequences
*   **Performance:** Higher latency for query (~200-500ms additional for Reranking).
*   **Solution:** Implement **Semantic Caching** to serve frequent technical queries instantly.
