// ---------------------------------------------------------------------------
// server/lib.js – Extracted pure functions for testability
// These functions contain zero side-effects (no I/O, no global state)
// ---------------------------------------------------------------------------

const SUMMARY_START = "<!-- USAGE-SUMMARY-START -->";
const SUMMARY_END = "<!-- USAGE-SUMMARY-END -->";

/**
 * Parse a daily usage summary from markdown content.
 * Extracts JSON from a fenced code block between USAGE-SUMMARY markers.
 */
export function parseDailySummary(content) {
  const s = content.indexOf(SUMMARY_START);
  const e = content.indexOf(SUMMARY_END);
  if (s === -1 || e === -1 || e < s) return null;
  const block = content.slice(s + SUMMARY_START.length, e);
  const m = block.match(/```json\s*([\s\S]*?)\s*```/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

/**
 * Create a new room state object.
 */
export function makeRoom(hostId, hostName) {
  const roomId = Math.random().toString(36).slice(2, 8).toUpperCase();
  const now = Date.now();

  return {
    roomId,
    hostId,
    createdAt: now,
    lastActiveAt: now,
    participants: {
      [hostId]: {
        id: hostId,
        role: "rider",
        displayName: hostName || "Rider",
        connected: true,
        joinedAt: now,
        lastSeenAt: now,
        driftMs: 0,
        latencyMs: 0,
        voiceEnabled: false
      }
    },
    currentTrack: null,
    queue: [],
    chatMessages: [],
    playback: {
      isPlaying: false,
      positionMs: 0,
      updatedAt: now,
      rate: 1
    },
    log: []
  };
}

/**
 * Update the last active timestamp of a room.
 */
export function markActivity(room) {
  room.lastActiveAt = Date.now();
}

/**
 * Calculate the current playback position accounting for elapsed time and rate.
 */
export function currentPosition(room) {
  if (!room.playback.isPlaying) return room.playback.positionMs;
  return room.playback.positionMs + (Date.now() - room.playback.updatedAt) * room.playback.rate;
}

/**
 * Build a public (client-safe) view of a room.
 */
export function publicRoom(room) {
  return {
    roomId: room.roomId,
    hostId: room.hostId,
    serverTime: Date.now(),
    participants: Object.values(room.participants),
    currentTrack: room.currentTrack,
    queue: room.queue,
    chatMessages: room.chatMessages,
    playback: {
      ...room.playback,
      positionMs: Math.max(0, currentPosition(room))
    }
  };
}

/**
 * Append an event to the room log (capped at 120 entries).
 */
export function appendLog(room, event) {
  room.log.push({ ...event, at: Date.now() });
  if (room.log.length > 120) room.log.shift();
}

/**
 * Insert or update a participant in a room.
 */
export function upsertParticipant(room, participantId, patch) {
  const now = Date.now();
  const existing = room.participants[participantId] || {
    id: participantId,
    role: "passenger",
    displayName: "Passenger",
    connected: true,
    joinedAt: now,
    lastSeenAt: now,
    driftMs: 0,
    latencyMs: 0,
    voiceEnabled: false
  };

  room.participants[participantId] = {
    ...existing,
    ...patch,
    connected: true,
    lastSeenAt: now
  };
}

/**
 * Update playback state with a patch.
 */
export function setPlayback(room, patch) {
  room.playback = {
    ...room.playback,
    ...patch,
    updatedAt: Date.now()
  };
}

/**
 * ISO 8601 duration parser (PT1H2M3S -> ms).
 */
export function parseDuration(iso) {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return ((parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0)) * 1000;
}

export { SUMMARY_START, SUMMARY_END };
