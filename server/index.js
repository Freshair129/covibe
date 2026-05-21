import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";

const PORT = Number(process.env.COVIBE_SERVER_PORT || 8787);
const rooms = new Map();
const clients = new Map();

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not_found" }));
});

const wss = new WebSocketServer({ server });

function makeRoom(hostId, hostName) {
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

function currentPosition(room) {
  if (!room.playback.isPlaying) return room.playback.positionMs;
  return room.playback.positionMs + (Date.now() - room.playback.updatedAt) * room.playback.rate;
}

function publicRoom(room) {
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

function send(ws, message) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(message));
  }
}

function broadcast(roomId, message) {
  for (const [clientId, client] of clients.entries()) {
    if (client.roomId === roomId) {
      send(client.ws, message);
    }
  }
}

function broadcastState(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.lastActiveAt = Date.now();
  broadcast(roomId, { type: "room_state", room: publicRoom(room) });
}

function appendLog(room, event) {
  room.log.push({ ...event, at: Date.now() });
  if (room.log.length > 120) room.log.shift();
}

function upsertParticipant(room, participantId, patch) {
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

function setPlayback(room, patch) {
  room.playback = {
    ...room.playback,
    ...patch,
    updatedAt: Date.now()
  };
}

function requireRoom(ws, roomId) {
  const room = rooms.get(roomId);
  if (!room) {
    send(ws, { type: "error", message: "ไม่พบห้องนี้ หรือห้องหมดอายุแล้ว" });
    return null;
  }
  return room;
}

function sendToParticipant(roomId, participantId, message) {
  for (const client of clients.values()) {
    if (client.roomId === roomId && client.participantId === participantId) {
      send(client.ws, message);
    }
  }
}

wss.on("connection", (ws) => {
  const clientId = randomUUID();
  clients.set(clientId, { ws, roomId: null, participantId: clientId });
  send(ws, { type: "hello", clientId, serverTime: Date.now() });

  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      send(ws, { type: "error", message: "ข้อความไม่ถูกต้อง" });
      return;
    }

    const client = clients.get(clientId);
    if (!client) return;

    if (data.type === "create_room") {
      const participantId = data.participantId || clientId;
      const room = makeRoom(participantId, data.displayName);
      rooms.set(room.roomId, room);
      clients.set(clientId, { ws, roomId: room.roomId, participantId });
      send(ws, {
        type: "room_created",
        room: publicRoom(room),
        participantId
      });
      broadcastState(room.roomId);
      return;
    }

    if (data.type === "join_room") {
      const room = requireRoom(ws, String(data.roomId || "").toUpperCase());
      if (!room) return;
      const participantId = data.participantId || clientId;
      upsertParticipant(room, participantId, {
        role: data.role === "rider" ? "rider" : "passenger",
        displayName: data.displayName || "Passenger"
      });
      clients.set(clientId, { ws, roomId: room.roomId, participantId });
      send(ws, {
        type: "room_joined",
        room: publicRoom(room),
        participantId
      });
      appendLog(room, { type: "join", participantId });
      broadcastState(room.roomId);
      return;
    }

    const roomId = data.roomId || client.roomId;
    const room = requireRoom(ws, roomId);
    if (!room) return;
    const actorId = data.participantId || client.participantId;
    upsertParticipant(room, actorId, {});

    if (data.type === "add_track") {
      const track = {
        id: data.track?.id || randomUUID(),
        source: "youtube",
        sourceId: data.track?.sourceId,
        title: data.track?.title || "YouTube track",
        thumbnailUrl: data.track?.thumbnailUrl || "",
        durationMs: data.track?.durationMs || 0,
        addedBy: actorId,
        addedAt: Date.now()
      };

      if (!track.sourceId) {
        send(ws, { type: "error", message: "ต้องมี YouTube video id" });
        return;
      }

      if (!room.currentTrack) {
        room.currentTrack = track;
        setPlayback(room, { isPlaying: false, positionMs: 0 });
      } else {
        room.queue.push(track);
      }
      appendLog(room, { type: "queue_add", actorId, trackId: track.id });
      broadcastState(room.roomId);
      return;
    }

    if (data.type === "remove_track") {
      room.queue = room.queue.filter((track) => track.id !== data.trackId);
      appendLog(room, { type: "queue_remove", actorId, trackId: data.trackId });
      broadcastState(room.roomId);
      return;
    }

    if (data.type === "chat_message") {
      const body = String(data.body || "").trim().slice(0, 500);
      if (!body) return;
      const participant = room.participants[actorId];
      const message = {
        id: randomUUID(),
        roomId: room.roomId,
        senderId: actorId,
        senderName: participant?.displayName || "Guest",
        body,
        createdAt: Date.now()
      };
      room.chatMessages.push(message);
      if (room.chatMessages.length > 80) room.chatMessages.shift();
      appendLog(room, { type: "chat_message", actorId, messageId: message.id });
      broadcast(room.roomId, { type: "chat_message", message });
      broadcastState(room.roomId);
      return;
    }

    if (data.type === "voice_status") {
      upsertParticipant(room, actorId, { voiceEnabled: Boolean(data.enabled) });
      appendLog(room, { type: "voice_status", actorId, enabled: Boolean(data.enabled) });
      broadcast(room.roomId, {
        type: "voice_status",
        participantId: actorId,
        enabled: Boolean(data.enabled)
      });
      broadcastState(room.roomId);
      return;
    }

    if (data.type === "voice_signal") {
      const targetId = String(data.targetId || "");
      if (!targetId || !room.participants[targetId]) return;
      sendToParticipant(room.roomId, targetId, {
        type: "voice_signal",
        fromId: actorId,
        signal: data.signal
      });
      return;
    }

    if (data.type === "play") {
      setPlayback(room, {
        isPlaying: true,
        positionMs: Number.isFinite(data.positionMs)
          ? Math.max(0, data.positionMs)
          : currentPosition(room)
      });
      appendLog(room, { type: "play", actorId, positionMs: room.playback.positionMs });
      broadcastState(room.roomId);
      return;
    }

    if (data.type === "pause") {
      setPlayback(room, {
        isPlaying: false,
        positionMs: Number.isFinite(data.positionMs)
          ? Math.max(0, data.positionMs)
          : currentPosition(room)
      });
      appendLog(room, { type: "pause", actorId, positionMs: room.playback.positionMs });
      broadcastState(room.roomId);
      return;
    }

    if (data.type === "seek") {
      setPlayback(room, {
        positionMs: Math.max(0, Number(data.positionMs) || 0)
      });
      appendLog(room, { type: "seek", actorId, positionMs: room.playback.positionMs });
      broadcastState(room.roomId);
      return;
    }

    if (data.type === "skip") {
      room.currentTrack = room.queue.shift() || null;
      setPlayback(room, { isPlaying: Boolean(room.currentTrack), positionMs: 0 });
      appendLog(room, { type: "skip", actorId, trackId: room.currentTrack?.id });
      broadcastState(room.roomId);
      return;
    }

    if (data.type === "sync_report") {
      const expectedMs = currentPosition(room);
      const actualMs = Math.max(0, Number(data.positionMs) || 0);
      const driftMs = Math.round(actualMs - expectedMs);
      const latencyMs = Math.max(0, Date.now() - Number(data.clientSentAt || Date.now()));
      upsertParticipant(room, actorId, { driftMs, latencyMs });
      send(ws, {
        type: "sync_target",
        serverTime: Date.now(),
        expectedMs,
        driftMs,
        isPlaying: room.playback.isPlaying
      });
      broadcastState(room.roomId);
      return;
    }

    if (data.type === "ping") {
      send(ws, { type: "pong", clientSentAt: data.clientSentAt, serverTime: Date.now() });
    }
  });

  ws.on("close", () => {
    const client = clients.get(clientId);
    clients.delete(clientId);
    if (!client?.roomId) return;
    const room = rooms.get(client.roomId);
    if (!room) return;

    const participant = room.participants[client.participantId];
    if (participant) {
      participant.connected = false;
      participant.voiceEnabled = false;
      participant.lastSeenAt = Date.now();
    }
    broadcastState(room.roomId);
  });
});

setInterval(() => {
  const cutoff = Date.now() - 1000 * 60 * 60 * 4;
  for (const [roomId, room] of rooms.entries()) {
    if (room.lastActiveAt < cutoff) rooms.delete(roomId);
  }
}, 1000 * 60 * 10);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`CoVibe realtime server listening on http://localhost:${PORT}`);
});
