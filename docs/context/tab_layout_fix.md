# Logic Spec: Tab Layout and Flexbox Alignment Fix

This document outlines the bug fixes for the tab selection layout issues in [covibe_ai_benchmark_dashboard_style2.html](file:///g:/covibe/benchmark/covibe_ai_benchmark_dashboard_style2.html).

## 1. Tab Text Wrapping under SVG Icon
### [ROOT CAUSE]
In `switchTab(tabName)`, the active tab button receives a layout styling containing flexbox alignment classes:
`flex items-center gap-1.5`

However, the inactive tab buttons have their CSS classes overwritten to:
`px-4 py-1.5 rounded-md text-xs font-semibold transition text-slate-400 hover:text-white`

This inactive string **lacks** the `flex items-center gap-1.5` classes, reverting the button layout to default `inline-block`. Since the first tab has a nested `<svg>` icon, the browser wraps the text to a new line underneath the icon.

### Proposed Solution
Modify the inactive class list inside `switchTab(tabName)` loop to include `flex items-center gap-1.5` so that buttons maintain their aligned layout structure when inactive:
```javascript
['simulator', 'overview', 'gap-analysis'].forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    btn.className = 'px-4 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 text-slate-400 hover:text-white';
});
```

---

## 2. Container Proportions Shift Between Tabs
### [ROOT CAUSE]
The column layout grid configurations in the HTML markup differ between Tab 1 and Tab 2:
- **Tab 1 (Simulator)**: Left col uses `lg:col-span-1`, Right col (Live Sandbox) uses `lg:col-span-2` (Proportions: 1:2)
- **Tab 2 (Overview)**: Left col (Champions card) uses `lg:col-span-2`, Right col (Tuning) uses `lg:col-span-1` (Proportions: 2:1)

This causes the visually wider panel to swap sides, altering container proportions upon tab switching.

### Proposed Solution
If matching visual proportions are desired, we can equalize the grid columns for both tabs. We will ask the user which layout proportion they prefer before updating the HTML.
