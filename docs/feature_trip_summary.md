# Functional Specification: Trip Summary Page

**Status: ✅ IMPLEMENTED**

## 1. Overview
After a trip ends, users should see a summary of their shared listening experience. This provides a satisfying closure to the trip and shows what songs were listened to, how many participants joined, and the trip duration.

## 2. Architecture

### 2.1 Server Endpoint (`GET /api/trip-summary/:roomId`)
- Returns aggregated trip data from the room's event log
- Data includes: `roomId`, `createdAt`, `duration`, participant list, tracks played/added counts
- Room data persists in memory until the 4-hour cleanup interval

### 2.2 Client Flow
1. User clicks "ออกจากทริป" (Leave Trip)
2. Instead of immediate redirect, `showTripSummary` state is set to `true`
3. `TripSummary` component fetches data from `/api/trip-summary/:roomId`
4. Displays stat cards (songs played, songs added, duration, participants)
5. Shows participant list with roles
6. "กลับหน้าหลัก" button clears local storage and redirects

## 3. UI Design
- 2x2 stat grid with icons (Music, BarChart, Clock, Users)
- Participant list with connection dots and role labels
- Loading spinner during fetch
- Error state with fallback "go home" button
- Responsive: adjusts padding and font sizes on mobile

## 4. Files Modified
- `server/index.js`: `/api/trip-summary/:roomId` endpoint
- `src/components/TripSummary.tsx`: New component
- `src/App.tsx`: Leave flow integration with `showTripSummary`/`tripRoomId` state
- `src/styles.css`: `.trip-summary`, `.trip-stats-grid`, `.trip-stat-card`, etc.
