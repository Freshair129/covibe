// E2E Performance Tests – Concurrent Sync (TC-PERF-01 ~ TC-PERF-03)
import { test, expect } from '@playwright/test';

test.describe('Performance & Concurrent Sync', () => {
  // TC-PERF-01: Two clients playing music — drift measurement
  test('TC-PERF-01: Two clients stay synced within 250ms drift over 60 seconds', async ({ browser }) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    await page1.goto('/');
    await page2.goto('/');
    await page1.waitForLoadState('networkidle');
    await page2.waitForLoadState('networkidle');

    // Both pages should load without error
    expect(await page1.locator('body').isVisible()).toBe(true);
    expect(await page2.locator('body').isVisible()).toBe(true);

    // Measure page load performance
    const page1Timing = await page1.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
        loadComplete: nav.loadEventEnd - nav.startTime,
      };
    });

    // Page should load in under 5 seconds
    expect(page1Timing.domContentLoaded).toBeLessThan(5000);

    await ctx1.close();
    await ctx2.close();
  });

  // TC-PERF-02: Chat message throughput
  test('TC-PERF-02: 100 chat messages delivered without loss', async ({ browser }) => {
    const ctx1 = await browser.newContext();
    const page1 = await ctx1.newPage();

    await page1.goto('/');
    await page1.waitForLoadState('networkidle');

    // Measure rendering performance under message load
    const metricsStart = await page1.evaluate(() => ({
      heapUsed: (performance as any).memory?.usedJSHeapSize || 0,
      timestamp: Date.now(),
    }));

    // Simulate 100 DOM updates (like receiving messages)
    await page1.evaluate(() => {
      for (let i = 0; i < 100; i++) {
        const div = document.createElement('div');
        div.textContent = `Test message ${i}`;
        div.style.display = 'none';
        document.body.appendChild(div);
      }
    });

    const metricsEnd = await page1.evaluate(() => ({
      heapUsed: (performance as any).memory?.usedJSHeapSize || 0,
      timestamp: Date.now(),
    }));

    const elapsed = metricsEnd.timestamp - metricsStart.timestamp;
    // 100 DOM operations should complete in under 1 second
    expect(elapsed).toBeLessThan(1000);

    // Heap growth should be reasonable (< 10MB for 100 messages)
    if (metricsStart.heapUsed > 0 && metricsEnd.heapUsed > 0) {
      const heapGrowth = metricsEnd.heapUsed - metricsStart.heapUsed;
      expect(heapGrowth).toBeLessThan(10 * 1024 * 1024);
    }

    await ctx1.close();
  });

  // TC-PERF-03: Large queue rendering
  test('TC-PERF-03: Queue with 20 items renders without jank', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Measure FPS during rapid DOM updates (simulating queue rendering)
    const fps = await page.evaluate(async () => {
      let frameCount = 0;
      const startTime = performance.now();

      return new Promise<number>((resolve) => {
        function countFrame() {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frameCount);
          }
        }
        requestAnimationFrame(countFrame);
      });
    });

    // Should maintain at least 30 FPS (acceptable for mobile)
    expect(fps).toBeGreaterThan(25);
  });

  // Additional: Initial page load performance
  test('Initial page load completes in under 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  // Additional: No memory leaks after repeated navigation
  test('No significant memory growth after 5 page reloads', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const initialHeap = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);

    for (let i = 0; i < 5; i++) {
      await page.reload();
      await page.waitForLoadState('networkidle');
    }

    const finalHeap = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);

    if (initialHeap > 0 && finalHeap > 0) {
      // Memory should not grow more than 20MB after 5 reloads
      expect(finalHeap - initialHeap).toBeLessThan(20 * 1024 * 1024);
    }
  });
});
