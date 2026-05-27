# Functional Specification: PWA Connectivity & Playback Constraints

## 1. Overview
CoVibe as a PWA faces strict limitations on mobile browsers (iOS Safari & Android Chrome) regarding media playback, background execution, and screen sleep. This document identifies these constraints and defines the logic to mitigate them.

## 2. Constraints Identification

### 2.1 YouTube Autoplay Restriction
- **Constraint**: Browsers block any video/audio playback that is not initiated by a user gesture (tap/click). This prevents the "Sync" feature from working immediately upon joining a room.
- **Current Logic**: 
  - `YouTubeDeck` displays an `unlock-layer` overlay if `needsUnlock` is true.
  - User must tap "แตะเพื่อเปิดเสียงบนเครื่องนี้" to trigger `player.playVideo()` and `player.setVolume()`.
- **Status**: ✅ Implemented.

### 2.2 Background Execution & Throttling
- **Constraint**: 
  - **iOS**: Freezes JavaScript execution 5-15 seconds after the app is backgrounded or the screen is locked. This disconnects WebSockets and stops playback sync.
  - **Android**: Throttles timers to 1 minute, causing massive sync drift.
- **Current Logic**:
  - `useRealtime` uses `Page Visibility API` (`visibilitychange`) to trigger a reconnect and sync catch-up when the user returns to the app.
  - **OLED Saver Mode**: A black overlay that stays active while the screen is on, preventing the OS from backgrounding the app if the user keeps the screen on.
- **Status**: ⚠️ Partially Implemented (Catch-up works, but screen still sleeps).

### 2.3 Screen Wake Lock
- **Constraint**: Mobile screens automatically sleep/lock after a period of inactivity, which leads to the background execution issues mentioned above.
- **Proposed Logic**:
  - Use the `Screen Wake Lock API` to request a lock when the user enters a room and starts playback.
  - Automatically re-request the lock if it's released (e.g., when the tab becomes visible again).
- **Status**: ❌ Not Implemented.

## 3. Implementation Plan (Wake Lock)

### 3.1 Logic for `useWakeLock` hook
1. Check for `navigator.wakeLock` support.
2. `request()` a lock when `enabled` is true.
3. Listen for `release` event to update state.
4. Listen for `visibilitychange` to re-acquire the lock when returning to the tab.

### 3.2 Integration
- Integrate `useWakeLock` into `App.tsx`.
- Enable Wake Lock automatically when a user is in a room and `saver` (OLED Saver) is active, or generally when playback is active.

---
Please review and approve this documentation. I will generate the code (implementing `useWakeLock` and updating `App.tsx`) once approved.
