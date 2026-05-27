# Functional Specification: Buffer State Handling & Slow Internet Notification

**Status: ✅ IMPLEMENTED**

## 1. Overview
In mobile environments (Rider mode), network stability is often compromised. When the YouTube player buffers, it desynchronizes the shared listening experience. This feature provides clear feedback to the user when buffering occurs and specifically warns them if the buffering is persistent due to slow internet.

## 2. Logic Design

### 2.1 Buffer Detection
The `YouTubeDeck` component monitors the YouTube IFrame player state via the `onStateChange` event.
- **State: BUFFERING (3)**: The player is waiting for data.
- **State: PLAYING (1)**: The player has resumed playback.

### 2.2 Slow Internet Detection
A "Slow Internet" condition is defined as the player being in a `BUFFERING` state for more than a specific threshold.
- **Threshold:** 5.0 seconds.
- **Implementation:** 
    - When `playerState` enters `"buffering"`, start a `setTimeout`.
    - If the timeout fires, set `isSlowNetwork = true`.
    - If `playerState` leaves `"buffering"` (becomes `"playing"`, `"paused"`, etc.), clear the timeout and set `isSlowNetwork = false`.

## 3. UI/UX Design

### 3.1 Buffering Overlay
A `.buffer-layer` overlay is added to the `.video-frame`. It is only visible when `playerState === "buffering"`.

**Elements:**
- **Icon:** `RotateCw` (with a spinning animation).
- **Text:** 
    - Default: "กำลังโหลดเพลง..." (Loading song...)
    - If `isSlowNetwork`: "สัญญาณอินเทอร์เน็ตอ่อน... กำลังพยายามเชื่อมต่อใหม่" (Weak internet signal... attempting to reconnect)

## 4. Implementation

### Files Modified
- `src/components/YouTubeDeck.tsx`: `isSlowNetwork` state, buffer detection `useEffect`, overlay JSX
- `src/styles.css`: `.buffer-layer`, `.slow-network`, `@keyframes spin-loader`

## 🛠️ Source Implementation
- **Sync Logic:** [src/utils/sync.ts](../../src/utils/sync.ts)
- **Realtime Hook:** [src/hooks/useRealtime.ts](../../src/hooks/useRealtime.ts)

