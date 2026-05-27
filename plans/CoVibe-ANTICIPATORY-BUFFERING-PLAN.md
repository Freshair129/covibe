# Functional Specification: Advanced Anticipatory Buffering

**Status: ✅ IMPLEMENTED**

## 1. Background & Motivation
In the current implementation of CoVibe (`YouTubeDeck.tsx`), the `idlePlayer` only begins loading the next track 10 seconds before the end of the current track to facilitate a crossfade. If a rider experiences a network drop during those final 10 seconds, or if they decide to manually "Skip" to the next track mid-song, they will experience a loading delay (buffering screen) because the next track was not proactively cached.

## 2. Objective
Implement **Advanced Anticipatory Buffering** to pre-load the next track in the queue immediately into the idle YouTube player, ensuring zero-latency transitions for both natural track progression (crossfade) and manual track skipping.

## 3. Logic & Architecture

### 3.1 Proactive Idle Pre-loading
- **Trigger:** Whenever `room.queue[0]` changes or the `activeDeck` successfully begins playing its track.
- **Action:** The `idlePlayer` will execute `cueVideoById(nextTrack.sourceId)` or `loadVideoById` + `pauseVideo()` silently in the background (Volume = 0).
- **Benefit:** YouTube's native engine will fetch the initial chunks of the video stream while the current song plays, neutralizing initial loading latency.

### 3.2 Instant Skip Handling
- **Current Behavior:** Skipping relies on the server updating the `currentTrack`, which triggers a fresh `loadVideoById` on the active player, causing a buffering gap.
- **New Behavior:** When a skip event occurs, if the `idlePlayer` has already anticipated and buffered the new `currentTrack`, the system immediately swaps `activeDeck` (A ↔ B) and plays the idle deck at full volume.

### 3.3 Enhanced Crossfade State Machine
- The crossfade interval logic (10s before end) will be updated. Instead of *loading* the video at T-10s, it will simply *play* the already-buffered video on the idle deck and begin the volume automation.

## 4. Implementation Steps (Plan)

1.  **Refactor `YouTubeDeck.tsx` State:**
    - Add a `bufferedNextTrackId` state to track what the idle player currently holds.
2.  **Anticipatory Effect Hook:**
    - Create a new `useEffect` that watches `room.queue[0]`.
    - If `room.queue[0]` exists and `bufferedNextTrackId !== room.queue[0].id`, instruct the `idlePlayer` to pre-load the video at volume 0 and pause.
3.  **Update Skip / Track Change Logic:**
    - Modify the main sync logic so that if the incoming `room.currentTrack.id` matches `bufferedNextTrackId`, we perform a deck swap (`setActiveDeck(idle)`) instead of reloading the same deck.
4.  **Update Crossfade Logic:**
    - Remove `idlePlayer.loadVideoById(...)` from the crossfade interval, as the video is already cued. Just call `playVideo()`.

## 5. Verification
- **Test 1:** Start a track with items in the queue. Verify via network tab that chunks for the 2nd track are downloaded immediately.
- **Test 2:** Press "Skip". Verify the transition is instantaneous without the buffering spinner.
- **Test 3:** Let the track end naturally. Verify the 10-second crossfade still executes smoothly.
