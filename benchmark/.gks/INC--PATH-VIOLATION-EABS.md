---
id: INC--PATH-VIOLATION-EABS-01
status: resolved
severity: major
created_at: 2026-05-30T19:00:00+07:00
resolved_at: 2026-05-30T19:15:00+07:00
title: EABS-01 Directory Hierarchy Violation
tags: [incident, eabs-01, pathing, rca]
---

# INCIDENT: EABS-01 Directory Hierarchy Violation

## [PROBLEM STATEMENT]
Agent created benchmark planning documents directly under `benchmark-run/` instead of following the mandatory nested structure: `benchmark-run/<model-name>/<runid>/documents/`. This led to a "Messy Root" and broke the automated aggregation pipeline.

## [ROOT CAUSE]
1.  **Heuristic Bias:** Agent prioritized execution speed and visibility over strict compliance with the EABS-01 architecture.
2.  **Manual Path Hardcoding:** Failure to use a standardized path-builder or validation script before file creation.
3.  **Governance Negligence:** Standards were documented but not verified against the actual `write_file` operation.

## [IMPACT]
- Broken data traceability.
- Failure of future automated scripts expecting the standard hierarchy.
- Pollution of the benchmark root directory.

## [RESOLUTION / MITIGATION]
1.  **Cleanup:** Deleted the orphaned file at the root.
2.  **Restructuring:** Re-created the document in the correct path: `benchmark-run/sushirl-latest/RUN-260530-sushi-001/documents/`.
3.  **Rule Hardening:** Added a mandatory **"Path Validation Rule"** to `GEMINI.md` to prevent future violations.

## [LEARNINGS]
Documentation is not self-enforcing for AI Agents. Explicit "Pre-flight Validation" turns must be executed before any filesystem mutation.
