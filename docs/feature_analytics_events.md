# Functional Specification: Basic Analytics Events

**Status: ✅ IMPLEMENTED**

## 1. Overview
Track key user interactions to understand usage patterns and system performance. All data stays on the CoVibe server — no external analytics services (no GA, no Mixpanel).

## 2. Architecture

### 2.1 Client-Side (`src/utils/analytics.ts`)
- `trackEvent(send, eventName, metadata?)` — fires events through the existing WebSocket
- Silently fails if send fails — analytics should never break the app
- Includes `clientTimestamp` and truncated `userAgent` in metadata

### 2.2 Server-Side (`server/index.js`)
- Handles `analytics_event` WebSocket message type
- Stores events in `analyticsStore` Map keyed by `roomId`
- Capped at 500 events per room to prevent memory issues
- Exposes `GET /api/analytics/:roomId` for dashboard consumption

### 2.3 Events Tracked
| Event | Trigger | Metadata |
|---|---|---|
| `room_create` | User creates a new room | — |
| `room_join` | User joins existing room | `roomCode` |
| `track_add` | User adds a track (via URL input) | `sourceId` |
| `playback_play` | User presses Play | — |
| `playback_pause` | User presses Pause | — |
| `saver_toggle` | User activates OLED saver | `enabled: true` |
| `leave_room` | User clicks Leave Trip | `roomId` |

## 3. Files Modified
- `src/utils/analytics.ts`: New utility module
- `server/index.js`: `analytics_event` handler + `/api/analytics/:roomId` endpoint
- `src/App.tsx`: `trackEvent()` calls at key interaction points
