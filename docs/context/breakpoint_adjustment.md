# Logic Spec: Grid Breakpoint Adjustment from lg to md

This document outlines the change logic to make the dashboard side-by-side layout responsive on medium-sized screens (viewports between 768px and 1024px) in [covibe_ai_benchmark_dashboard_style2.html](file:///g:/covibe/benchmark/covibe_ai_benchmark_dashboard_style2.html).

## [ROOT CAUSE]
The dashboard uses the `lg:` breakpoint (which triggers at `1024px` and above) to define its side-by-side grid layout:
- Parent: `lg:grid-cols-6` (or `lg:grid-cols-3`)
- Left Child: `lg:col-span-1`
- Right Child: `lg:col-span-2`

If the browser window width is less than `1024px` (e.g. on smaller screens, non-maximized browser windows, or tablets), these `lg:` classes are ignored, falling back to the default `grid-cols-1` configuration. This causes the Left Panel (Model Selector & Telemetry) and Right Panel (Sandbox) to stack vertically, taking up 100% width each and wrapping the sandbox off-screen or below.

## Proposed Solution
We will lower the grid breakpoint from `lg:` (1024px) to `md:` (768px). This ensures that screens of 768px wide and above will maintain the side-by-side layout instead of collapsing into a single full-width column.

### Changes:
- **In `<section id="tab-content-simulator" ...>`**:
  Change `lg:grid-cols-6` (or `lg:grid-cols-3`) to `md:grid-cols-3` (using the 3-column system is cleaner for a 1:2 layout).
- **In Left Panel (`<!-- LEFT PANEL: CONTROL & METRICS -->`)**:
  Change `lg:col-span-1` to `md:col-span-1`.
- **In Right Panel (`<!-- RIGHT PANEL: PREVIEW / SANDBOX -->`)**:
  Change `lg:col-span-2` to `md:col-span-2`.
