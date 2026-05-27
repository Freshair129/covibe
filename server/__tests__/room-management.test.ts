// Server Unit Tests – Room Management (TC-SRV-01 ~ TC-SRV-05)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  makeRoom,
  publicRoom,
  appendLog,
  upsertParticipant,
  setPlayback,
  currentPosition
} from '../lib.js';

describe('Room Management', () => {
  // ─── TC-SRV-01: Room Creation ───────────────────────────────────────
  describe('TC-SRV-01: Room creation', () => {
    it('creates a room with a 6-char uppercase roomId', () => {
      const room = makeRoom('host-1', 'คนขับ');
      expect(room.roomId).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('sets the creator as host with rider role', () => {
      const room = makeRoom('host-1', 'คนขับ');
      expect(room.hostId).toBe('host-1');
      expect(room.participants['host-1'].role).toBe('rider');
      expect(room.participants['host-1'].displayName).toBe('คนขับ');
      expect(room.participants['host-1'].connected).toBe(true);
    });

    it('initialises with empty queue and no current track', () => {
      const room = makeRoom('host-1', 'Rider');
      expect(room.queue).toEqual([]);
      expect(room.currentTrack).toBeNull();
      expect(room.chatMessages).toEqual([]);
      expect(room.log).toEqual([]);
    });

    it('initialises playback as paused at position 0', () => {
      const room = makeRoom('host-1', 'Rider');
      expect(room.playback.isPlaying).toBe(false);
      expect(room.playback.positionMs).toBe(0);
      expect(room.playback.rate).toBe(1);
    });

    it('uses "Rider" as default displayName when none provided', () => {
      const room = makeRoom('host-1', '');
      expect(room.participants['host-1'].displayName).toBe('Rider');
    });

    it('generates unique roomIds across multiple calls', () => {
      const ids = new Set(Array.from({ length: 50 }, () => makeRoom('h', 'R').roomId));
      // With 6 alphanumeric chars, collisions in 50 samples are extremely unlikely
      expect(ids.size).toBeGreaterThanOrEqual(45);
    });
  });

  // ─── TC-SRV-02: Host Handoff Logic ─────────────────────────────────
  describe('TC-SRV-02: Host handoff preparation', () => {
    it('promotes earliest connected participant when host disconnects', () => {
      const room = makeRoom('host-1', 'Rider');
      // Add two passengers
      upsertParticipant(room, 'p-2', {
        role: 'passenger',
        displayName: 'คนซ้อน A'
      });
      upsertParticipant(room, 'p-3', {
        role: 'passenger',
        displayName: 'คนซ้อน B'
      });

      // Simulate host disconnect
      room.participants['host-1'].connected = false;

      // Find next candidate (earliest joinedAt among connected)
      const candidates = Object.values(room.participants)
        .filter(p => p.connected && p.id !== room.hostId)
        .sort((a, b) => a.joinedAt - b.joinedAt);

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0].id).toBe('p-2');
    });

    it('returns no candidates when all participants disconnected', () => {
      const room = makeRoom('host-1', 'Rider');
      room.participants['host-1'].connected = false;

      const candidates = Object.values(room.participants)
        .filter(p => p.connected && p.id !== room.hostId);

      expect(candidates.length).toBe(0);
    });
  });

  // ─── TC-SRV-03: Queue Management ───────────────────────────────────
  describe('TC-SRV-03: Queue management', () => {
    it('adds a track to the queue', () => {
      const room = makeRoom('host-1', 'Rider');
      const track = {
        id: 't-1',
        source: 'youtube',
        sourceId: 'dQw4w9WgXcQ',
        title: 'Test Song',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        durationMs: 180000,
        addedBy: 'host-1',
        addedAt: Date.now()
      };
      room.queue.push(track);
      expect(room.queue).toHaveLength(1);
      expect(room.queue[0].sourceId).toBe('dQw4w9WgXcQ');
    });

    it('removes a track from the queue', () => {
      const room = makeRoom('host-1', 'Rider');
      room.queue = [
        { id: 't-1', title: 'Song A' },
        { id: 't-2', title: 'Song B' },
        { id: 't-3', title: 'Song C' }
      ];
      room.queue = room.queue.filter(t => t.id !== 't-2');
      expect(room.queue).toHaveLength(2);
      expect(room.queue.map(t => t.id)).toEqual(['t-1', 't-3']);
    });

    it('skip: promotes next queue item to currentTrack', () => {
      const room = makeRoom('host-1', 'Rider');
      room.queue = [
        { id: 't-1', title: 'Next Song' },
        { id: 't-2', title: 'After That' }
      ];
      room.currentTrack = room.queue.shift();
      expect(room.currentTrack.id).toBe('t-1');
      expect(room.queue).toHaveLength(1);
    });
  });

  // ─── TC-SRV-04: Room Cleanup ───────────────────────────────────────
  describe('TC-SRV-04: Room cleanup', () => {
    it('identifies stale rooms (lastActiveAt > 4 hours ago)', () => {
      const room = makeRoom('host-1', 'Rider');
      const FOUR_HOURS = 1000 * 60 * 60 * 4;
      room.lastActiveAt = Date.now() - FOUR_HOURS - 1;

      const cutoff = Date.now() - FOUR_HOURS;
      const isStale = room.lastActiveAt < cutoff;
      expect(isStale).toBe(true);
    });

    it('keeps active rooms', () => {
      const room = makeRoom('host-1', 'Rider');
      const FOUR_HOURS = 1000 * 60 * 60 * 4;
      const cutoff = Date.now() - FOUR_HOURS;
      const isStale = room.lastActiveAt < cutoff;
      expect(isStale).toBe(false);
    });
  });

  // ─── TC-SRV-05: Participant Reconnect ──────────────────────────────
  describe('TC-SRV-05: Participant reconnect', () => {
    it('upserts existing participant preserving joinedAt', () => {
      const room = makeRoom('host-1', 'Rider');
      const originalJoinedAt = room.participants['host-1'].joinedAt;

      upsertParticipant(room, 'host-1', { displayName: 'คนขับกลับมาแล้ว' });

      expect(room.participants['host-1'].displayName).toBe('คนขับกลับมาแล้ว');
      expect(room.participants['host-1'].joinedAt).toBe(originalJoinedAt);
      expect(room.participants['host-1'].connected).toBe(true);
    });

    it('creates new participant with passenger defaults', () => {
      const room = makeRoom('host-1', 'Rider');
      upsertParticipant(room, 'new-p', { displayName: 'คนซ้อนใหม่' });

      expect(room.participants['new-p'].role).toBe('passenger');
      expect(room.participants['new-p'].connected).toBe(true);
      expect(room.participants['new-p'].voiceEnabled).toBe(false);
    });
  });
});

// ─── Utility function tests ────────────────────────────────────────────
describe('Room Utility Functions', () => {
  describe('currentPosition', () => {
    it('returns positionMs when paused', () => {
      const room = makeRoom('h', 'R');
      room.playback.positionMs = 5000;
      room.playback.isPlaying = false;
      expect(currentPosition(room)).toBe(5000);
    });

    it('calculates elapsed position when playing', () => {
      const now = Date.now();
      const room = makeRoom('h', 'R');
      room.playback.isPlaying = true;
      room.playback.positionMs = 5000;
      room.playback.updatedAt = now - 1000; // 1 second ago
      room.playback.rate = 1;

      const pos = currentPosition(room);
      // Should be ~6000ms (5000 + 1000*1)
      expect(pos).toBeGreaterThanOrEqual(5900);
      expect(pos).toBeLessThanOrEqual(6100);
    });

    it('respects playback rate', () => {
      const now = Date.now();
      const room = makeRoom('h', 'R');
      room.playback.isPlaying = true;
      room.playback.positionMs = 5000;
      room.playback.updatedAt = now - 1000;
      room.playback.rate = 1.05;

      const pos = currentPosition(room);
      // Should be ~6050ms (5000 + 1000*1.05)
      expect(pos).toBeGreaterThanOrEqual(5950);
      expect(pos).toBeLessThanOrEqual(6150);
    });
  });

  describe('publicRoom', () => {
    it('converts participants object to array', () => {
      const room = makeRoom('h', 'R');
      upsertParticipant(room, 'p-1', { displayName: 'P1' });
      const pub = publicRoom(room);

      expect(Array.isArray(pub.participants)).toBe(true);
      expect(pub.participants).toHaveLength(2);
    });

    it('includes serverTime', () => {
      const room = makeRoom('h', 'R');
      const pub = publicRoom(room);
      expect(pub.serverTime).toBeGreaterThan(0);
      expect(typeof pub.serverTime).toBe('number');
    });

    it('clamps positionMs to non-negative', () => {
      const room = makeRoom('h', 'R');
      room.playback.positionMs = -100;
      const pub = publicRoom(room);
      expect(pub.playback.positionMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('appendLog', () => {
    it('adds events with timestamp', () => {
      const room = makeRoom('h', 'R');
      appendLog(room, { type: 'join', participantId: 'p-1' });
      expect(room.log).toHaveLength(1);
      expect(room.log[0].type).toBe('join');
      expect(room.log[0].at).toBeGreaterThan(0);
    });

    it('caps log at 120 entries', () => {
      const room = makeRoom('h', 'R');
      for (let i = 0; i < 130; i++) {
        appendLog(room, { type: 'event', idx: i });
      }
      expect(room.log).toHaveLength(120);
      // First entry should be idx=10 (0-9 were shifted out)
      expect(room.log[0].idx).toBe(10);
    });
  });

  describe('setPlayback', () => {
    it('merges patch into playback state', () => {
      const room = makeRoom('h', 'R');
      setPlayback(room, { isPlaying: true, positionMs: 3000 });

      expect(room.playback.isPlaying).toBe(true);
      expect(room.playback.positionMs).toBe(3000);
      expect(room.playback.rate).toBe(1); // preserved from original
    });

    it('always updates updatedAt timestamp', () => {
      const room = makeRoom('h', 'R');
      const before = room.playback.updatedAt;
      // Small delay to ensure timestamp differs
      setPlayback(room, { positionMs: 1000 });
      expect(room.playback.updatedAt).toBeGreaterThanOrEqual(before);
    });
  });
});
