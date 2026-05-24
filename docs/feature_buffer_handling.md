# Functional Specification: Buffer State Handling & Slow Internet Notification

## 1. Overview
In mobile environments (Rider mode), network stability is often compromised. When the YouTube player buffers, it desynchronizes the shared listening experience. This feature aims to provide clear feedback to the user when buffering occurs and specifically warn them if the buffering is persistent due to slow internet.

## 2. Logic Design

### 2.1 Buffer Detection
The `YouTubeDeck` component will monitor the YouTube IFrame player state via the `onStateChange` event.
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
A new overlay (`.buffer-layer`) will be added to the `.video-frame`. It will only be visible when `playerState === "buffering"`.

**Elements:**
- **Icon:** `RotateCw` (with a spinning animation).
- **Text:** 
    - Default: "กำลังโหลด..." (Loading...)
    - If `isSlowNetwork`: "สัญญาณอ่อน... กำลังพยายามเชื่อมต่อ" (Weak signal... attempting to connect)

### 3.2 Status Bar Update
The `.player-status` section will be updated to show the current network/buffer status more clearly.
- "YouTube พร้อม | [สถานะ]"
- If buffering: "YouTube กำลังโหลด... [เวลาที่รอ]"

## 4. Technical Implementation Plan

### 4.1 CSS Changes (`src/styles.css`)
- Add `.buffer-layer` styles: absolute positioning, semi-transparent background, centered content.
- Add `@keyframes spin` for the loader icon.
- Style for slow network warning text (e.g., orange color).

### 4.2 React Changes (`src/App.tsx`)
- In `YouTubeDeck`:
    - Add `const [isSlowNetwork, setIsSlowNetwork] = useState(false);`.
    - Add `useEffect` to handle the 5s timer.
    - Update JSX to include the `.buffer-layer`.
    - Use `RotateCw` icon from `lucide-react`.

---
**Please review and approve this documentation. I will generate the code once approved.**
