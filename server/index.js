import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const PORT = Number(process.env.COVIBE_SERVER_PORT || 8787);
const rooms = new Map();
const clients = new Map();
const activeTasks = new Map();

function getEvaEnv() {
  const env = { ...process.env, EVA_NO_TUI: "1" };
  const envPath = "g:/eva-cli/.env";
  if (existsSync(envPath)) {
    try {
      const content = readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const idx = trimmed.indexOf("=");
          if (idx > 0) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            env[key] = val.replace(/^["']|["']$/g, "");
          }
        }
      }
    } catch (e) {
      console.error("Failed to read g:/eva-cli/.env:", e);
    }
  }
  return env;
}

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
    }

    if (data.type === "run_agent_task") {
      const { agent, taskId, taskText } = data;
      if (activeTasks.has(taskId)) {
        try {
          activeTasks.get(taskId).kill("SIGKILL");
        } catch (e) {}
        activeTasks.delete(taskId);
      }

      send(ws, {
        type: "agent_log",
        taskId,
        stream: "system",
        text: `Starting agent execution: "${agent}" for task: "${taskText}"`
      });

      let cp;
      if (agent === "eva") {
        cp = spawn(
          "node",
          ["g:/eva-cli/node_modules/tsx/dist/cli.mjs", "g:/eva-cli/src/entry.ts", "--auto"],
          {
            cwd: "g:/covibe",
            env: getEvaEnv()
          }
        );
        cp.stdin.write(`${taskText}\n`);
      } else if (agent === "qwen") {
        cp = spawn("python", ["g:/qwen-cli/qwen.py", taskText], {
          cwd: "g:/covibe"
        });
      } else {
        send(ws, {
          type: "agent_log",
          taskId,
          stream: "system",
          text: `Unknown agent type: "${agent}"`
        });
        send(ws, {
          type: "agent_status",
          taskId,
          status: "failed"
        });
        return;
      }

      activeTasks.set(taskId, cp);

      let outputBuffer = "";
      let hasExited = false;

      cp.stdout.on("data", (chunk) => {
        const text = chunk.toString();
        send(ws, {
          type: "agent_log",
          taskId,
          stream: "stdout",
          text
        });

        if (agent === "eva" && !hasExited) {
          outputBuffer += text;
          const occurrences = (outputBuffer.match(/Boss:/g) || []).length;
          if (occurrences >= 2) {
            hasExited = true;
            
            // 1. Send success status immediately so the UI transitions to done state
            send(ws, {
              type: "agent_status",
              taskId,
              status: "success"
            });

            // 2. Remove from activeTasks registry so that process exit/close events won't trigger status overrides
            if (activeTasks.get(taskId) === cp) {
              activeTasks.delete(taskId);
            }

            send(ws, {
              type: "agent_log",
              taskId,
              stream: "system",
              text: `Finished task execution. Terminating agent session gracefully...`
            });

            // 3. Write exit command to stdin to let the agent run loop.end() and save its episodic memory
            setTimeout(() => {
              try {
                cp.stdin.write("exit\n");
              } catch (e) {}
            }, 500);

            // 4. Force kill after 3000ms to clean up the hanging node process from event loop on Windows
            setTimeout(() => {
              try {
                cp.kill("SIGKILL");
              } catch (e) {}
            }, 3000);
          }
        }
      });

      cp.stderr.on("data", (chunk) => {
        send(ws, {
          type: "agent_log",
          taskId,
          stream: "stderr",
          text: chunk.toString()
        });
      });

      cp.on("error", (err) => {
        send(ws, {
          type: "agent_log",
          taskId,
          stream: "stderr",
          text: `Failed to spawn process: ${err.message}`
        });
      });

      cp.on("close", (code) => {
        if (activeTasks.get(taskId) === cp) {
          activeTasks.delete(taskId);
          send(ws, {
            type: "agent_status",
            taskId,
            status: code === 0 ? "success" : "failed"
          });
        }
      });

      return;
    }

    if (data.type === "cancel_agent_task") {
      const { taskId } = data;
      if (activeTasks.has(taskId)) {
        const cp = activeTasks.get(taskId);
        try {
          cp.kill("SIGKILL");
        } catch (e) {}
        activeTasks.delete(taskId);
        send(ws, {
          type: "agent_log",
          taskId,
          stream: "system",
          text: `Canceled task: "${taskId}"`
        });
        send(ws, {
          type: "agent_status",
          taskId,
          status: "canceled"
        });
      }
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
