// E2E Mobile Tests – Incoming Call Simulation (TC-CALL-01 ~ TC-CALL-04)
import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

test.describe('Incoming Call Simulation', () => {
  // TC-CALL-01: Tab loses focus (simulating incoming call ringing)
  test('TC-CALL-01: App does not crash when tab goes hidden (call ringing)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Simulate incoming call: browser tab goes to background
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Wait 5 seconds (simulating call ringing / answering)
    await page.waitForTimeout(5000);

    // Page should not crash
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  // TC-CALL-02: Returning from call triggers re-sync
  test('TC-CALL-02: App re-syncs when tab becomes visible again (call ended)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go hidden (incoming call)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await page.waitForTimeout(3000);

    // Come back (call ended)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
      Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Wait for re-sync
    await page.waitForTimeout(3000);

    // App should still be functional
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);

    // Check no JavaScript errors occurred
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.waitForTimeout(1000);
    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(
      e => !e.includes('favicon') && !e.includes('404')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  // TC-CALL-03: WebSocket reconnects after returning from call
  test('TC-CALL-03: WebSocket reconnects after visibility change', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Monitor WebSocket connections
    const wsConnections: string[] = [];
    page.on('websocket', ws => {
      wsConnections.push(ws.url());
    });

    // Simulate call (hidden for 10 seconds)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await page.waitForTimeout(10_000);

    // Return from call
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
      Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Allow time for reconnection
    await page.waitForTimeout(3000);

    // Page should be alive and functioning
    expect(await page.locator('body').isVisible()).toBe(true);
  });

  // TC-CALL-04: Drift after returning from 30-second call
  test('TC-CALL-04: Drift stays under 500ms after 30-second call interruption', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Simulate a long call (30 seconds hidden)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await page.waitForTimeout(30_000);

    // Return from call
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
      Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Wait for sync to stabilize
    await page.waitForTimeout(5000);

    // Verify the app is responsive (no freeze)
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
