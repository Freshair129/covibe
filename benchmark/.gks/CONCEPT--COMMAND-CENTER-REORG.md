---
id: CONCEPT--COMMAND-CENTER-REORG
tier: genesis
created_at: 2026-05-31T14:45:00+07:00
last_updated: 2026-05-31T16:15:00+07:00
phase: 1
type: concept
status: stable
enforcement_state: active
vault_id: covibe
title: CoVibe Agent Command Center Reorganization
tags: [architecture, navigation, gks, graph-ai]
domain: benchmark
aliases: [CONCEPT, COMMAND-CENTER-REORG]
---

# CONCEPT--COMMAND-CENTER-REORG

## 1. Vision Statement (Strategic Intent)
Establish a professional, scalable, and hierarchical "Agent Command Center" for CoVibe. Transition from a flat navigation model to a Domain-based architecture (Top Nav + Sidebar) to support growing complexity, specifically integrating **Graph Machine Learning** and preserving core technical features (AST, Call Graph, Telemetry).

## 2. Requirements (EARS Format)
*   **[R1] DOMAIN NAVIGATION:** WHEN the user selects a Parent Domain from the Top Navigation, THEN the system SHALL update the Glass Sidebar with relevant Sub-domain items.
*   **[R2] COMPONENT PRESERVATION:** WHEN the UI is refactored, THEN the system SHALL integrate existing AST and Call Graph features into the "Genesis Knowledge System" domain without loss of functionality.
*   **[R3] GRAPH-AI INTEGRATION:** THE system SHALL provide a dedicated "Model Zoo" for Graph-based reasoning models (e.g., GraphsGPT, Graphormer) to support high-fidelity codebase analysis.
*   **[R4] VISUAL IDENTITY:** THE system SHALL implement a "Modern Glass" aesthetic using backdrop blurs, consistent padding (8px rhythm), and high-contrast dark mode.

## 3. Atomic Geography
*   **Domain A (Overview):** Dashboard, Manager Board, Agent Roster.
*   **Domain B (GKS):** Code Structure, AST/Call Graphs, Flow Charts.
*   **Domain C (GDB):** Explorer Hub, Processing Lab (Graph Zoo), Retrieval Studio (SRS-G), Symbol Linker, Vector Store.
*   **Domain D (Benchmark):** Telemetry Reactor, Trend Analysis, Reports.
