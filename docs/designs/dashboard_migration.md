# Functional Specification & Architecture: Dashboard Migration

## 1. Overview
Currently, the CoVibe backend and PWA workspace refer to `covibe_roadmap.html` as the primary development roadmap and telemetry dashboard. However, a more comprehensive, advanced command console called `codev_dashboard.html` (CoDev - Agent Command Center) has been implemented. This dashboard includes HNSW index visualization, Cytoscape call graphs, workflow canvas, database schema visualizers, and interactive terminal interfaces, making it much more suitable as the main flight control and monitor console.

This document outlines the changes to migrate the primary interface route and entry points from `covibe_roadmap.html` to `codev_dashboard.html`.

---

## 2. Goals
- Set `codev_dashboard.html` as the primary development console (served at `/dashboard` and `/`).
- Maintain backward compatibility so that any existing requests to `/roadmap` are gracefully handled (redirected to `/dashboard`).
- Update codebase documentation and system guidelines (such as `GEMINI.md`) to reflect the new layout and dashboard roles.

---

## 3. Detailed Changes

### 3.1. Route Updates in WebSocket/Web Server (`server/index.js`)
- **New Path Handler (`/dashboard`, `/dashboard/`):**
  - Read `codev_dashboard.html` and serve it with the same Content Security Policy (CSP) headers as the previous roadmap page.
- **Redirects:**
  - Update the root path `/` to redirect to `/dashboard` (status code 302).
  - Update the `/roadmap` and `/roadmap/` paths to redirect to `/dashboard` (status code 302).

### 3.2. Project Guide Documentation (`GEMINI.md`)
- Update the repository structure tree in Section 2 to describe `codev_dashboard.html` as the main Agent Command Center and `covibe_roadmap.html` as the archived/legacy roadmap.
- Update description of the telemetry dashboard in Section 1 to point to the new `/dashboard` route.

### 3.3. Script Updates (`scripts/agent_orchestrator.js`)
- Update comments that mention `covibe_roadmap.html` to point to `codev_dashboard.html`.

---

## 4. Verification Plan

### 4.1. Automated Verification
- Verify server startup via `npm run dev` or `node server/index.js`.
- Execute HTTP requests to ensure:
  - `GET /` redirects to `/dashboard` with 302 status code.
  - `GET /roadmap` redirects to `/dashboard` with 302 status code.
  - `GET /dashboard` successfully loads `codev_dashboard.html` with a 200 status code and proper Content-Security-Policy headers.

### 4.2. Manual Verification
- Open the dashboard in browser at `http://localhost:8787/dashboard` (or the relevant port) to confirm Cytoscape graph, HNSW visualizer, and telemetry panels load correctly.
- Confirm WebSocket connection can be successfully established from the dashboard to the local WebSocket server.
