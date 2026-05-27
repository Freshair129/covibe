# Logic Spec: Canvas Aspect Ratio Bug Fix

## [ROOT CAUSE]
When switching tabs (via `switchTab`) or toggling preview modes (via `togglePreviewMode`), the dashboard removes the CSS `.hidden` class (which sets `display: none`) from the target container, making it visible. 

Immediately after removing `.hidden`, the code synchronously calls `resizeCanvas()`, which queries the canvas's size via `canvas.getBoundingClientRect()`. 

Since the browser has not yet completed the layout reflow (style calculation and grid/flex layout adjustment) for the newly visible elements, the returned dimensions are either `0` or fallback to the canvas's default fallback size (300x150 pixels). 

The canvas's internal pixel dimensions (`canvas.width` and `canvas.height`) are then set to this incorrect size. As the CSS grid subsequently expands the canvas element to fill its container (via `.w-full .h-full`), the browser stretches the low-resolution pixel buffer, resulting in a blurry, distorted waveform and a broken aspect ratio.

## Proposed Solution (Logic Changes)
To resolve this, we must defer the execution of `resizeCanvas()` until the next layout macro-task has completed and the elements have acquired their true visible dimensions.

We will wrap the `resizeCanvas()` calls in a `requestAnimationFrame()` or `setTimeout(..., 0)` block in two functions:

1. **In `switchTab(tabName)`**:
   ```javascript
   if (tabName === 'simulator') {
       requestAnimationFrame(() => {
           resizeCanvas();
       });
   }
   ```

2. **In `togglePreviewMode(showCode)`**:
   ```javascript
   } else {
       // ... show sandbox wrappers ...
       requestAnimationFrame(() => {
           resizeCanvas();
       });
   }
   ```
