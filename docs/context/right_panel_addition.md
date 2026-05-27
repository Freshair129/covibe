# Functional Spec: Right Panel Addition to Simulator Tab

This document outlines the functional and structural design to add a Right Panel to the simulator tab inside [covibe_ai_benchmark_dashboard_style2.html](file:///g:/covibe/benchmark/covibe_ai_benchmark_dashboard_style2.html).

---

## 1. Grid Structure & Layout Adjustment

Currently, the simulator tab container ([line 170](file:///g:/covibe/benchmark/covibe_ai_benchmark_dashboard_style2.html#L170)) is configured with a 4-column system on large displays:

```html
<section id="tab-content-simulator" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
```

Currently, the children elements take up only 3 columns:
- **Left Panel (Control & Telemetry)**: `lg:col-span-1` (Takes 1 column width)
- **Middle Panel (Sandbox / Preview)**: `md:col-span-2` (Takes 2 columns width)
- **Empty Space**: 1 column is currently empty on large screens (`lg:`).

### Proposed Grid Configuration
We will add a new **Right Panel** utilizing the remaining 1 column space:
- **Left Panel**: Keep `lg:col-span-1` / `md:col-span-1`
- **Middle Panel**: Keep `md:col-span-2` / `lg:col-span-2`
- **Right Panel (New)**: Use `lg:col-span-1` / `md:col-span-1` (taking the 4th column)

---

## 2. Right Panel Features & Design

To match the premium dark/glassmorphic aesthetics of the dashboard, the Right Panel will include:

1. **Simulation Tuning (การปรับแต่งระดับลึก)**:
   - Interactive slider for **Context Window Limit** (2KB to 16KB) that updates live and triggers the VRAM Capacity safety limit system.
   - Interactive slider for **Temperature (ความสุ่ม)** (0.1 to 1.5) to simulate AI creativity.
2. **Dynamic Run Logger (ประวัติการรันสัญญาณ)**:
   - A live feed container styled as a mini terminal log showing generated audio signals, latency, and latency metrics matching the active champion engine.

### Mockup Structure for Right Panel:

```html
<!-- RIGHT PANEL: DETAILED TUNING & LOGS -->
<div class="lg:col-span-1 space-y-6">
    <!-- Card 1: Advanced Control Tuning -->
    <div class="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-5">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <!-- Icon SVG -->
            ตัวแปรระดับลึก (Tuning parameters)
        </h3>
        
        <!-- Context Limit Range Slider -->
        <div class="space-y-2">
            <div class="flex justify-between text-[11px] font-mono">
                <span class="text-slate-400">Context Limit:</span>
                <span id="slider-context-val" class="text-cyan-400 font-bold">2,048 Tokens</span>
            </div>
            <input type="range" id="param-context-slider" min="2048" max="16384" step="2048" value="2048"
                class="w-full accent-cyan-400 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer">
        </div>

        <!-- Temp Range Slider -->
        <div class="space-y-2">
            <div class="flex justify-between text-[11px] font-mono">
                <span class="text-slate-400">Temperature:</span>
                <span id="slider-temp-val" class="text-indigo-400 font-bold">0.7</span>
            </div>
            <input type="range" id="param-temp-slider" min="0.1" max="1.5" step="0.1" value="0.7"
                class="w-full accent-indigo-400 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer">
        </div>
    </div>

    <!-- Card 2: Micro Execution Log -->
    <div class="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <!-- Icon SVG -->
            Execution Trace / Live Log
        </h3>
        <div id="right-panel-logs" class="bg-slate-950 p-4 border border-slate-900 rounded-xl h-[280px] font-mono text-[10px] text-slate-400 space-y-2 overflow-y-auto">
            <!-- Dynamically populated live debug strings -->
            <div class="text-slate-500">[System] Dashboard Standby. Ready for signal simulation...</div>
        </div>
    </div>
</div>
```

---

## 3. Script Updates & Interaction Logic

To make the sliders and log work interactively:
1. **Context/Temp Sliders**: Add JavaScript event listeners in `<script>` block to update the value text dynamically.
2. **Log Integration**: Connect the play audio simulation to feed lines into the live log (e.g. `"[Info] Synth frequency generated at A2"`, `"[Hardware] VRAM spike monitored"`, etc.).

---

## 4. Verification Plan

1. **Visual Alignment**: Verify layout side-by-side on desktop display screens.
2. **Interactive Controls**: Test slide handlers to ensure text updates correctly.
3. **PWA Responsiveness**: Check that the Right Panel stacks beautifully under the middle sandbox when resizing screen width below `md:`.
