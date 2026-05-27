# Logic Spec: Tailwind CLI Setup for HTML Dashboard

This document outlines the step-by-step logic and configuration required to compile static Tailwind CSS styles for the HTML dashboard ([covibe_ai_benchmark_dashboard_style2.html](file:///g:/covibe/benchmark/covibe_ai_benchmark_dashboard_style2.html)) using Tailwind v4.3.0, replacing the dynamic Play CDN.

## Proposed Changes

### 1. Create Base Tailwind Stylesheet
We will create a new CSS input file at `benchmark/input.css` containing:
```css
@import "tailwindcss";

/* Any custom overrides or utilities can be added here */
```

### 2. Update HTML Dashboard
Modify [covibe_ai_benchmark_dashboard_style2.html](file:///g:/covibe/benchmark/covibe_ai_benchmark_dashboard_style2.html) to:
- **Remove** the JavaScript JIT compiler script:
  ```html
  <script src="https://cdn.tailwindcss.com"></script>
  ```
- **Add** a link to the pre-compiled CSS stylesheet:
  ```html
  <link rel="stylesheet" href="covibe_ai_benchmark_dashboard_style2.css">
  ```
- **Move** the custom inline configurations (such as custom slate color or animations if they are not in v4 defaults) into the base stylesheet or use inline styles. Note: Tailwind v4 has standard `slate-950` and animations built-in, so standard classes will work natively.

### 3. Add Build Script to package.json
We will append a command script in [package.json](file:///g:/covibe/package.json) to easily trigger compiling of the dashboard stylesheet:
```json
"build:dashboard": "tailwindcss -i benchmark/input.css -o benchmark/covibe_ai_benchmark_dashboard_style2.css"
```

### 4. Build Command
To generate the static CSS file, we will execute:
```bash
npm run build:dashboard
```
This generates a compiled `covibe_ai_benchmark_dashboard_style2.css` in the `benchmark/` folder.
