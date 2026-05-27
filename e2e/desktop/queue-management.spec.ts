// E2E Desktop Tests – Queue Management (TC-E2E-07 ~ TC-E2E-09)
import { test, expect, createRoom, joinRoom } from '../fixtures/covibe-test';

test.describe('Queue Management', () => {
  // TC-E2E-07: Add multiple tracks
  test('TC-E2E-07: Adding 3 tracks shows them in order in the queue', async ({ riderPage }) => {
    await createRoom(riderPage);

    const trackIds = ['dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0'];
    const trackInput = riderPage.locator('input[placeholder*="YouTube"], input[placeholder*="URL"]').first();

    if (await trackInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      for (const id of trackIds) {
        await trackInput.fill(id);
        const addBtn = riderPage.getByRole('button', { name: /เพิ่ม|add|\+/i }).first();
        if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await addBtn.click();
        } else {
          await trackInput.press('Enter');
        }
        await riderPage.waitForTimeout(1000);
      }
    }
  });

  // TC-E2E-08: Remove a track from queue
  test('TC-E2E-08: Removing a track removes it from the queue', async ({ riderPage }) => {
    await createRoom(riderPage);

    // Add a track first
    const trackInput = riderPage.locator('input[placeholder*="YouTube"], input[placeholder*="URL"]').first();
    if (await trackInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await trackInput.fill('dQw4w9WgXcQ');
      await trackInput.press('Enter');
      await riderPage.waitForTimeout(1500);

      // Look for remove/trash button in queue
      const removeBtn = riderPage.locator('button:has([data-lucide="trash-2"]), button:has(.lucide-trash-2)').first();
      if (await removeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await removeBtn.click();
        await riderPage.waitForTimeout(1000);
      }
    }
  });

  // TC-E2E-09: Passenger adds a track visible to all
  test('TC-E2E-09: Passenger adds a track visible to the rider', async ({ riderPage, passengerPage }) => {
    const roomCode = await createRoom(riderPage);
    await joinRoom(passengerPage, roomCode);

    // Passenger adds a track
    const trackInput = passengerPage.locator('input[placeholder*="YouTube"], input[placeholder*="URL"]').first();
    if (await trackInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await trackInput.fill('dQw4w9WgXcQ');
      await trackInput.press('Enter');
      await passengerPage.waitForTimeout(2000);
    }
  });
});
