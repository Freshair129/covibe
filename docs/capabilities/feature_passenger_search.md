# Functional Specification: Passenger Remote Search (YouTube API)

**Status: ✅ IMPLEMENTED**

## 1. Overview
Passengers need to search for YouTube songs and add them to the shared queue without copying URLs manually. This feature provides a real-time YouTube search interface within the SearchPanel component, proxied through the CoVibe server.

## 2. Architecture

### 2.1 Server Proxy (`GET /api/youtube-search?q={query}`)
- **With `YOUTUBE_API_KEY`**: Uses YouTube Data API v3 `search.list` + `videos.list` for title, thumbnail, channel, and duration
- **Without API key**: Returns empty results with a helpful fallback message guiding users to use URL input
- **Caching**: 60-second in-memory cache keyed by lowercase query to reduce API quota usage
- **Response format**: `{ results: Track[], source: "youtube_api" | "cache" | "fallback" }`

### 2.2 Client SearchPanel
- Real `fetch()` calls to server endpoint instead of mock data
- Loading spinner during search
- Error handling (server down, API error, no API key)
- Duration display in search results (MM:SS format)
- Channel name display in search results

## 3. Files Modified
- `server/index.js`: Added `/api/youtube-search` HTTP endpoint with cache
- `src/components/SearchPanel.tsx`: Replaced `MOCK_RESULTS` with real API calls

## 4. Configuration
Set environment variable `YOUTUBE_API_KEY` with a valid YouTube Data API v3 key to enable search functionality.

## 🛠️ Source Implementation
- **UI Component:** [src/components/SearchPanel.tsx](../../src/components/SearchPanel.tsx)
- **YouTube API Integration:** [src/utils/youtube-api.ts](../../src/utils/youtube-api.ts)

