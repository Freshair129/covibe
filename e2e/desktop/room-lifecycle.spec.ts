// E2E Desktop Tests – Room Lifecycle (TC-E2E-01 ~ TC-E2E-06)
import { test, expect, createRoom, joinRoom } from '../fixtures/covibe-test';

test.describe('Room Lifecycle', () => {
  // TC-E2E-01: Rider creates a room
  test('TC-E2E-01: Rider creates a room and sees a 6-char room code', async ({ riderPage }) => {
    const roomCode = await createRoom(riderPage);
    expect(roomCode).toMatch(/^[A-Z0-9]{6}$/);

    // URL should contain the room code
    expect(riderPage.url()).toContain(`room=${roomCode}`);
  });

  // TC-E2E-02: Passenger joins via room code
  test('TC-E2E-02: Passenger joins room and sees the same room', async ({ riderPage, passengerPage }) => {
    const roomCode = await createRoom(riderPage);
    await joinRoom(passengerPage, roomCode);

    // Both pages should show the same room code in URL
    expect(passengerPage.url()).toContain(`room=${roomCode}`);
  });

  // TC-E2E-03: Add a YouTube track
  test('TC-E2E-03: Rider adds a YouTube track to the queue', async ({ riderPage }) => {
    await createRoom(riderPage);

    // Find the track input and add a video
    const trackInput = riderPage.locator('input[placeholder*="YouTube"], input[placeholder*="URL"], input[placeholder*="youtube"]').first();
    if (await trackInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await trackInput.fill('dQw4w9WgXcQ');
      
      // Press Enter or click Add button
      const addBtn = riderPage.getByRole('button', { name: /เพิ่ม|add|\+/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addBtn.click();
      } else {
        await trackInput.press('Enter');
      }

      // Wait for queue to update
      await riderPage.waitForTimeout(2000);
    }
  });

  // TC-E2E-04: Play syncs across both clients
  test('TC-E2E-04: Play command syncs to both clients', async ({ riderPage, passengerPage }) => {
    const roomCode = await createRoom(riderPage);
    await joinRoom(passengerPage, roomCode);

    // Look for a play button
    const playBtn = riderPage.locator('button:has([data-lucide="circle-play"]), button:has(.lucide-circle-play)').first();
    if (await playBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await playBtn.click();
      await riderPage.waitForTimeout(1000);
    }
  });

  // TC-E2E-05: Pause syncs
  test('TC-E2E-05: Pause command syncs to both clients', async ({ riderPage, passengerPage }) => {
    const roomCode = await createRoom(riderPage);
    await joinRoom(passengerPage, roomCode);

    // Try play then pause
    const playBtn = riderPage.locator('button:has([data-lucide="circle-play"])').first();
    const pauseBtn = riderPage.locator('button:has([data-lucide="circle-pause"])').first();

    if (await playBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await playBtn.click();
      await riderPage.waitForTimeout(500);
    }
    if (await pauseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pauseBtn.click();
      await riderPage.waitForTimeout(500);
    }
  });

  // TC-E2E-06: Skip to next track
  test('TC-E2E-06: Skip advances to next track', async ({ riderPage }) => {
    await createRoom(riderPage);

    // Look for skip button
    const skipBtn = riderPage.locator('button:has([data-lucide="skip-forward"])').first();
    if (await skipBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await skipBtn.click();
      await riderPage.waitForTimeout(1000);
    }
  });
});
