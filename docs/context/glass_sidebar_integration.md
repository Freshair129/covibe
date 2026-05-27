# Functional Spec: Modern Glass Sidebar Integration

This document outlines the design and integration plan to replace the top header tab navigation with the **Modern Glass Sidebar** in [covibe_ai_benchmark_dashboard_style2.html](file:///g:/covibe/benchmark/covibe_ai_benchmark_dashboard_style2.html).

---

## 1. Structure & Layout Adjustments

Currently, the dashboard uses a top-header tab navigation system. We will replace this with a premium hover-expanding glass sidebar on the left.

### 1. HTML Markup Additions:
- Add glowing background orbs (`.orb`) inside the `<body>` to create the glassmorphism backdrop.
- Insert the `<nav class="sidebar">` markup on the left.
- Map the navigation items to the dashboard's tabs:
  - **ห้องทดสอบ** (`fas fa-terminal`) -> `switchTab('simulator')`
  - **ทำเนียบแชมเปี้ยน** (`fas fa-award`) -> `switchTab('overview')`
  - **วิเคราะห์ช่องว่าง** (`fas fa-chart-pie`) -> `switchTab('gap-analysis')`
  - **ฝึกอบรม & พัฒนา** (`fas fa-users-cog`) -> `switchTab('training')`
- Wrap the `<header>`, `<main>`, and `<footer>` inside a `.content-wrapper` container.
- Shift the content wrapper to the right by `80px` padding. When the sidebar is hovered, transition the padding to `260px` (on viewports >= 768px) to prevent overlapping with the expanded sidebar.

### 2. Styling Additions (Tailwind CSS Input):
We will append the custom CSS classes from the sidebar project to [benchmark/input.css](file:///g:/covibe/benchmark/input.css) to build them statically:
- Original CSS variables:
  ```css
  :root {
      --bg-body: #121212;
      --glass-bg: rgba(30, 30, 30, 0.6);
      --glass-border: rgba(255, 255, 255, 0.1);
      --primary: #00ff88;
      --text-muted: #888;
  }
  ```
- `.content-wrapper` (padding-left `80px`, transition layout shift).
- `.sidebar:hover ~ .content-wrapper` (increase padding-left to `260px` on desktop).
- `.sidebar` (fixed height/width, backdrop-filter, transition, flex container).
- `.sidebar:hover` (expand width from `80px` to `260px`).
- `.brand` logo styling.
- `.nav-list`, `.nav-item`, `.nav-link` (neon hover/active shadow glow using `--primary`).
- `.orb` background shapes with blur filters.

---

## 2. JavaScript Navigation Hook

We will update the `switchTab(tabName)` function to toggle the `.active` class on the sidebar nav-links in sync with tab switches.

```javascript
// Remove 'active' from all sidebar links and add to selected
document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.classList.remove('active');
});
const activeLink = document.getElementById(`tab-btn-${tabName}`);
if (activeLink) activeLink.classList.add('active');
```

---

## 3. Verification Plan

1. Verify that clicking sidebar items correctly switches tabs with smooth transition animations.
2. Verify that the sidebar expands on hover and collapses back.
3. Compile styles with `npm run build:dashboard`.
4. Ensure no elements overlap on tablet and mobile viewports.
