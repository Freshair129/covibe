// Custom Playwright fixture: provides a rider page and a passenger page
// pre-configured for CoVibe E2E testing
import { test as base, expect, Page } from '@playwright/test';

type CoVibeFixtures = {
  riderPage: Page;
  passengerPage: Page;
};

export const test = base.extend<CoVibeFixtures>({
  riderPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/');
    await use(page);
    await context.close();
  },
  passengerPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/');
    await use(page);
    await context.close();
  },
});

export { expect };

/**
 * Helper: Create a room from the rider page and return the room code.
 */
export async function createRoom(riderPage: Page, name = 'ทดสอบ คนขับ'): Promise<string> {
  // Fill display name
  const nameInput = riderPage.locator('input[placeholder*="ชื่อ"], input[placeholder*="name"]').first();
  if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nameInput.fill(name);
  }

  // Click "Create Room" button
  const createBtn = riderPage.getByRole('button', { name: /สร้างห้อง|create/i });
  await createBtn.click();

  // Wait for room code to appear
  const roomCode = riderPage.locator('[data-testid="room-code"], .room-code, text=/[A-Z0-9]{6}/');
  await roomCode.first().waitFor({ timeout: 10_000 });
  
  // Extract room code from URL or element
  const url = riderPage.url();
  const match = url.match(/room=([A-Z0-9]{6})/);
  return match ? match[1] : '';
}

/**
 * Helper: Join a room from the passenger page using a room code.
 */
export async function joinRoom(passengerPage: Page, roomCode: string, name = 'ทดสอบ คนซ้อน'): Promise<void> {
  await passengerPage.goto(`/?room=${roomCode}`);
  
  // Fill display name if visible
  const nameInput = passengerPage.locator('input[placeholder*="ชื่อ"], input[placeholder*="name"]').first();
  if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nameInput.fill(name);
  }

  // Click join button if present
  const joinBtn = passengerPage.getByRole('button', { name: /เข้าห้อง|join/i });
  if (await joinBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await joinBtn.click();
  }

  // Wait for room state to load
  await passengerPage.waitForTimeout(2000);
}
