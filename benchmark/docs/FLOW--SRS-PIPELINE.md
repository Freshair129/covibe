# FLOW: The SRS (Semantic-Rerank-Symbol) Pipeline

## 1. Data Ingestion Flow (Continuous)
`Codebase` -> `Tree-sitter (AST)` -> `Symbol Table` -> `Jina Embedding` -> `HNSW Vector Store`

## 2. Retrieval Sequence (On-Query)

| Step | Component | Input | Action | Output |
|---|---|---|---|---|
| 1 | **Query Processor** | Natural Language | Normalize & Tokenize | Clean Query String |
| 2 | **Stage 1 Retrieval** | Clean Query | Vector Search (HNSW) | Top-20 Chunks (Candidate List) |
| 3 | **Stage 2 Refinement** | Query + Top-20 | Jina Reranker v3 | Top-5 Sorted Chunks (Precision List) |
| 4 | **Symbol Resolver** | Top-5 Chunks | Regex Match `@Symbol` | Matched Symbol IDs |
| 5 | **Symbol Linker** | Symbol IDs | GKS Symbol Lookup | Live Code Snippets + Line Refs |
| 6 | **Context Assembler** | Docs + Snippets | Merge with Metadata | **Final Context Window** |

## 3. Feedback Loop
`Agent Generation` -> `Success/Failure Audit` -> `Update Weights / Semantic Cache`
