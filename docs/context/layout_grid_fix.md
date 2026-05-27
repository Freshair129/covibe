# Root Cause Analysis (RCA) & Design Spec: Layout Displacement Fix (Option B - Telemetry on Right)

This document details the layout fix chosen (Option B) for the CoVibe AI Benchmark dashboard [covibe_ai_benchmark_dashboard_style2.html](file:///g:/covibe/benchmark/covibe_ai_benchmark_dashboard_style2.html).

---

## 1. Root Cause Analysis (RCA)

### 1. Stray `</div>` closing tag
When the Telemetry card was duplicated under `<!-- RIGHT PANEL: DETAILED TUNING & LOGS -->`, the HTML tags were closed as follows:
```html
            <!-- Telemetry / HARDWARE MONITORS -->
            <div class="bg-slate-900/40 ...">
               ...
            </div>
            </div> <!-- Stray closing tag! -->
```
The second `</div>` tag at line 466 is stray. It prematurely closes the parent grid container (`<section id="tab-content-simulator" ...>`). As a result, the subsequent Right Panel wrapper `div` (`<div class="lg:col-span-1 space-y-6">`) is rendered outside the grid flow.

### 2. Column Flow Misalignment
The copied Telemetry card was placed directly under the grid instead of inside the Right Panel's wrapper `div`. This forced the grid to treat the Telemetry card as a separate column, exceeding the 4-column system budget.

---

## 2. Chosen Solution (Option B - Telemetry on Right)

We will move the Telemetry card from the Left Panel to the Right Panel so that the Left Panel only contains the Model Selector, and the Right Panel groups all Telemetry, Tuning parameters, and Live Logs in a single column.

### Implementation Details:
1. **Remove Telemetry from Left Panel**: Delete the Telemetry block at lines 198–253.
2. **Remove stray `</div>`**: Delete the stray tag at line 466.
3. **Group in Right Panel**: Place the Telemetry block inside the Right Panel wrapper (`<div class="lg:col-span-1 space-y-6">`) before the Tuning parameters card.

#### Code Structure:
- **Left Panel (col-span-1)**:
  - Model Selector Card
- **Middle Panel (col-span-2)**:
  - Live Sandbox Preview (h-[590px])
- **Right Panel (col-span-1)**:
  - Telemetry Card (moved here)
  - Tuning Card
  - Live Log Card

---

## 3. Verification Plan

1. Verify that the grid uses exactly 3 direct child panels (Left, Mid, Right) matching `col-span-1`, `col-span-2`, and `col-span-1` layout.
2. Ensure there are no stray `</div>` tags.
3. Run `npm run build:dashboard` to rebuild CSS layout.
4. Verify responsiveness and styling in the browser.
