# Feature: Queue Management (add / remove / reorder)

## 1. Overview
The Queue Management system allows users in a CoVibe room to collaboratively manage the upcoming tracks. This ensures a continuous music experience for both the Rider and the Passenger.

## 2. Functional Specification
- **Add Track:** Users can add a YouTube video to the queue by providing a URL or video ID.
- **Automatic Playback:** If the room is currently empty, adding the first track will automatically set it as the `currentTrack` and start the session.
- **Remove Track:** Users can remove any track from the queue.
- **Reorder Queue:** Users can change the order of tracks in the queue (Move Up / Move Down).
- **Real-time Sync:** All changes to the queue are broadcasted to all participants immediately.
- **Auto-Advance:** When the `currentTrack` ends, the server automatically promotes the first track in the `queue` to be the new `currentTrack`.

## 3. Technical Architecture

### State Model (Server-side)
The `room` object in `server/index.js` maintains the queue state:
```typescript
interface Room {
  roomId: string;
  currentTrack: Track | null;
  queue: Track[];
  playback: {
    isPlaying: boolean;
    positionMs: number;
    lastUpdateAt: number;
  };
  // ... other fields
}

interface Track {
  id: string;          // Unique ID for the queue instance
  source: "youtube";
  sourceId: string;    // YouTube Video ID
  title: string;
  thumbnailUrl: string;
  durationMs: number;
  addedBy: string;     // Participant ID
  addedAt: number;
}
```

### WebSocket Messages

#### `add_track`
**Sent by:** Client
**Payload:** `{ type: "add_track", track: { sourceId, title, thumbnailUrl, ... } }`
**Logic:** Server generates a unique `id` for the track and appends it to `room.queue`. If `room.currentTrack` is null, it populates it instead.

#### `remove_track`
**Sent by:** Client
**Payload:** `{ type: "remove_track", trackId: string }`
**Logic:** Server filters `room.queue` to remove the track with the matching `trackId`.

#### `reorder_queue`
**Sent by:** Client
**Payload:** `{ type: "reorder_queue", trackIds: string[] }`
**Logic:** Server reconstructs `room.queue` based on the provided list of IDs to match the new order.

#### `skip`
**Sent by:** Client (usually Rider) or triggered by track end.
**Payload:** `{ type: "skip" }`
**Logic:** Server moves the first track from `room.queue` to `room.currentTrack`.

## 4. Implementation Details

### Client-side (React)
- `App.tsx`: Manages the input for adding tracks and renders the queue list with Up/Down/Remove buttons.
- `YouTubeDeck.tsx`: Monitors the `ENDED` state of the YouTube player. If the user is a `rider`, it sends the `skip` message to the server to advance the queue.

### Server-side (Node.js)
- `server/index.js`: Handles the message types described above and calls `broadcastState` to sync all clients.

## 5. Validation Plan
- [ ] Verify adding a track updates the UI for all participants.
- [ ] Verify removing a track works and doesn't affect other tracks.
- [ ] Verify reordering moves the track to the correct position.
- [ ] Verify that when a song ends, the next one starts automatically.
- [ ] Verify that passengers can also manage the queue (unless restricted).

## 6. RCA (Root Cause Analysis) for Known Issues
*None currently identified. The feature is being formally documented to move from `missing` to `stable` documentation state.*
