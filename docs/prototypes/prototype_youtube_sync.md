# Functional Specification: Synchronized YouTube IFrame Player Prototype

## 1. Overview
The goal of this prototype is to demonstrate the core synchronization logic for the YouTube IFrame Player across two or more clients using WebSockets. This isolated prototype will verify the reliability of play/pause/seek synchronization and the effectiveness of drift correction.

## 2. Architecture

### 2.1 Participants
- **Host (Rider):** The primary controller of the playback state. Their local player's state is considered the "source of truth."
- **Listener (Passenger):** Follows the host's playback state. Their local player is automatically adjusted to match the host.

### 2.2 Communication Flow (WebSocket)
1. **Action Trigger:** Host performs an action (Play, Pause, or Seek).
2. **Broadcast:** Client sends a message to the WebSocket server (`play`, `pause`, or `seek`).
3. **Distribution:** The server broadcasts the state change to all other participants in the same room.
4. **Action Execution:** Listeners receive the message and call the corresponding YouTube IFrame API methods (`playVideo()`, `pauseVideo()`, `seekTo()`).

## 3. Sync Logic & Drift Correction

### 3.1 Periodic Reporting
Every 3 seconds, all clients send a `sync_report` containing their current playback position (`positionMs`).

### 3.2 Smooth Local Playback (Refinement)
To prevent jumpy UI and ensure accurate sync between server updates, the client will:
- Maintain a local `derivedPositionMs` that increments every frame/millisecond if `isPlaying` is true.
- Use `requestAnimationFrame` or a high-frequency `setInterval` to update the local timer.

### 3.3 Latency Compensation
When receiving `room_state` from the server, the client will adjust the `expectedPositionMs`:
- **Adjusted Position = `serverPositionMs` + `(clientLatency / 2)`**
- This compensates for the time taken for the message to travel from the server to the client.

### 3.4 Correction Strategies
- **< 250ms:** No action (Ignore drift to maintain smooth playback).
- **250ms - 800ms:** Adjust `playbackRate` (e.g., set to 0.95x or 1.05x temporarily) to gradually close the gap.
- **> 800ms:** Force `seekTo()` to the correct position.

## 4. Prototype Implementation Plan

### 4.1 UI Components
- **Control Bar:** Buttons for Play, Pause, and a Seek slider (Visible to Host).
- **Player Container:** A `div` for the YouTube IFrame.
- **Status Overlay:** Displays current drift and sync status for debugging.

### 4.2 Files to Create/Modify
- `src/prototypes/YouTubeSync.tsx`: New prototype component.
- `src/App.tsx`: (Optional) Add a route or toggle to access the prototype.
- `server/index.js`: Ensure existing WebSocket handlers support the prototype's messages.
