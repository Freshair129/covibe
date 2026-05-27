# Functional Specification: Host Handoff Fallback

**Status: ✅ IMPLEMENTED**

## 1. Overview
When the rider (host) disconnects from the WebSocket, playback control becomes orphaned — no one can skip, pause, or add tracks. This feature automatically promotes the first connected passenger to become the new host after a grace period.

## 2. Logic Design

### 2.1 Disconnect Detection
- Server monitors `ws.on("close")` events
- When the disconnected participant is the current `hostId`, a 15-second timer starts
- If the host reconnects within 15 seconds, the timer is cancelled (no handoff occurs)

### 2.2 Host Promotion
- After 15 seconds, the server calls `promoteNextHost(room)`
- The first connected participant (sorted by `joinedAt`) becomes the new host
- Their role is changed to `"rider"`
- A `host_changed` broadcast is sent to all clients
- The room's `hostId` is updated

### 2.3 Client Notification
- `useRealtime` hook handles `host_changed` message
- Sets a `hostNotification` string (e.g., "🔄 แพรว เป็นผู้ควบคุมเพลงแล้ว")
- Notification auto-clears after 6 seconds
- Displayed as an amber toast with slide-down animation

## 3. Files Modified
- `server/index.js`: `promoteNextHost()` function, timer logic in `ws.on("close")`
- `src/types/index.ts`: `host_changed` ServerMessage type
- `src/hooks/useRealtime.ts`: `hostNotification` state and handler
- `src/App.tsx`: Toast display for `hostNotification`
- `src/styles.css`: `.host-notification` styles with `@keyframes slideDown`
