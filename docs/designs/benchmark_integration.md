# Functional Specification: Benchmark View Integration

## 1. Overview
The user requested to integrate the benchmark dashboard UI from `covibe_ai_benchmark_dashboard_style2.html` into `codev_dashboard.html`'s **Benchmark view** while moving its top horizontal navigation bar (`glass-nav` containing Dashboard, Gap Analysis, Simulator, Agent Management, ทำเนียบแชมเปี้ยน) to the main left sidebar (`left-sidebar`) of `codev_dashboard.html`.

This spec details how the layout, switching logic, and styling will be adjusted to achieve a unified layout.

---

## 2. Structural & Layout Changes

### 2.1. Main Left Sidebar (`left-sidebar` in `codev_dashboard.html`)
To prevent clutter, the left sidebar will render different contents depending on the active main view:
- **Roadmap View:**
  - Displays the Roadmap Progress, Project Status metrics, and the Agent/Config/Monitor tabs.
- **Benchmark View:**
  - Displays the Benchmark Navigation menu (with Dashboard, Gap Analysis, Simulator, Agent Management, and ทำเนียบแชมเปี้ยน buttons) and the Benchmark Hardware footnote.
- **Other Views:**
  - Left sidebar remains hidden.

This is implemented by wrapping original content in a `#left-sidebar-roadmap` container and adding a new `#left-sidebar-benchmark` container, then toggling their classes.

### 2.2. Benchmark Panel (`benchmark-view` in `codev_dashboard.html`)
- Remove the inner `<aside class="w-[200px] ...">` block (Left Benchmark Sidebar) from inside `#benchmark-view`.
- The main content pane (the remaining child in `#benchmark-view`) will expand to `flex-1` and occupy the full viewport width next to the main `left-sidebar`.

---

## 3. Logic & JavaScript Changes

### 3.1. Main View Switcher (`switchMainView`)
Update the function `switchMainView(view)`:
- When `view === 'roadmap'`:
  - Show `#left-sidebar` (remove `hidden`).
  - Show `#left-sidebar-roadmap` (remove `hidden`).
  - Hide `#left-sidebar-benchmark` (add `hidden`).
- When `view === 'benchmark'`:
  - Show `#left-sidebar` (remove `hidden`).
  - Hide `#left-sidebar-roadmap` (add `hidden`).
  - Show `#left-sidebar-benchmark` (remove `hidden`).
- For other views (`canvas`, `callgraph`, `database`, `vector`):
  - Hide `#left-sidebar` (add `hidden`).

### 3.2. Sub-Tab Switcher (`switchTab`)
Update `switchTab(tabName)`:
- Keep the active style updates on buttons inside `#left-sidebar-benchmark` instead of the old internal aside.

---

## 4. Verification Plan

### 4.1. Manual Verification
- Access the `http://localhost:8787/dashboard` in a browser.
- Click the "Benchmark" view tab in the top header.
- Confirm that the main left sidebar transitions to show the Benchmark Navigation options and the sub-sidebar inside the main benchmark area is gone.
- Click the navigation buttons inside the sidebar (e.g. Gap Analysis, Simulator, Agent Management, Overview) and verify that the correct sub-tabs are displayed in the main pane.
