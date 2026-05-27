import "./instrument.js";
import {
  parseDailySummary as _parseDailySummary,
  makeRoom as _makeRoom,
  currentPosition as _currentPosition,
  publicRoom as _publicRoom,
  appendLog as _appendLog,
  upsertParticipant as _upsertParticipant,
  setPlayback as _setPlayback,
  parseDuration as _parseDuration
} from "./lib.js";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";
import { spawn, exec } from "node:child_process";
import { readFileSync, existsSync, readdirSync, openSync, statSync, readSync, closeSync } from "node:fs";
import { join, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// Use env var if set; otherwise fall back to 8990 (unlikely to be occupied)
const PORT = Number(process.env.COVIBE_SERVER_PORT || 8990);
console.log(`[Server] Listening on port ${PORT}`);
const COVIBE_ROOT = resolve("g:/covibe");
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const rooms = new Map();
const clients = new Map();
const activeTasks = new Map();
const analyticsStore = new Map(); // roomId -> events[]
const searchCache = new Map(); // query -> { results, expiresAt }
const hostHandoffTimers = new Map(); // roomId -> timer

// Real-time benchmark & telemetry states
let activeBenchmarkProcess = null;
let benchmarkInterval = null;
let mockStep = 0;

function getLatestHardwareSample(isBenchmarking) {
  const hmlPath = existsSync("D:\\hw_log\\HardwareMonitoring.hml") 
    ? "D:\\hw_log\\HardwareMonitoring.hml" 
    : (existsSync("HardwareMonitoring.hml") ? "HardwareMonitoring.hml" : null);

  if (hmlPath) {
    try {
      const fd = openSync(hmlPath, 'r');
      const stat = statSync(hmlPath);
      const bufferSize = Math.min(stat.size, 8192);
      const buffer = Buffer.alloc(bufferSize);
      readSync(fd, buffer, 0, bufferSize, stat.size - bufferSize);
      closeSync(fd);

      let text = "";
      if (buffer[0] === 0xff && buffer[1] === 0xfe) {
        text = buffer.toString('utf16le');
      } else {
        text = buffer.toString('utf8');
      }

      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      let headerLine = "";
      let latestDataLine = "";

      for (let i = lines.length - 1; i >= 0; i--) {
        const parts = lines[i].split(',');
        if (parts[0] === '80') {
          latestDataLine = lines[i];
          break;
        }
      }

      if (latestDataLine) {
        for (let i = lines.length - 1; i >= 0; i--) {
          const parts = lines[i].split(',');
          if (parts[0] === '02') {
            headerLine = lines[i];
            break;
          }
        }

        if (!headerLine) {
          const fdStart = openSync(hmlPath, 'r');
          const startBuf = Buffer.alloc(Math.min(stat.size, 8192));
          readSync(fdStart, startBuf, 0, startBuf.length, 0);
          closeSync(fdStart);
          let startText = startBuf[0] === 0xff && startBuf[1] === 0xfe ? startBuf.toString('utf16le') : startBuf.toString('utf8');
          const startLines = startText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
          for (let line of startLines) {
            if (line.split(',')[0] === '02') {
              headerLine = line;
              break;
            }
          }
        }
      }

      if (headerLine && latestDataLine) {
        const headers = headerLine.split(',').slice(2).map(h => h.trim().replace(/\s+/g, ' '));
        const cells = latestDataLine.split(',').map(c => c.trim());
        const timeCell = cells[1];
        const dataCells = cells.slice(2);

        const dataObj = { "Timestamp": timeCell };
        headers.forEach((header, idx) => {
          const valueRaw = dataCells[idx];
          if (valueRaw === 'N/A' || valueRaw === undefined) {
            dataObj[header] = null;
          } else {
            const parsedVal = parseFloat(valueRaw);
            dataObj[header] = isNaN(parsedVal) ? valueRaw : parsedVal;
          }
        });

        const findVal = (keys) => {
          for (let k of keys) {
            const foundKey = Object.keys(dataObj).find(origKey => origKey.toLowerCase().trim().includes(k.toLowerCase().trim()));
            if (foundKey && dataObj[foundKey] !== null) {
              return parseFloat(dataObj[foundKey]);
            }
          }
          return null;
        };

        let cleanTime = timeCell;
        if (cleanTime.includes(' ')) {
          cleanTime = cleanTime.split(' ')[1];
        }

        return {
          "Timestamp": cleanTime,
          "GPU_Temp": findVal(['GPU temperature', 'GPU Temp']) || 35,
          "GPU_Usage": findVal(['GPU usage', 'GPU Usage']) || 0,
          "VRAM_Used": findVal(['Memory usage', 'Memory Usage']) || 1024,
          "GPU_Power": findVal(['Power', 'GPU Power']) || 15,
          "GPU_Fan": findVal(['Fan speed', 'GPU Fan']) || 30,
          "CPU_Temp": findVal(['CPU temperature', 'CPU Temp']) || 45,
          "CPU_Usage": findVal(['CPU usage', 'CPU Usage']) || 5,
          "RAM_Used": findVal(['RAM usage', 'RAM Usage']) || 8000,
          "Core_Clock": findVal(['Core clock', 'GPU Core']) || 1500,
          "Memory_Clock": findVal(['Memory clock', 'GPU Memory']) || 7500,
          "CPU_Clock": findVal(['CPU clock', 'CPU Clock']) || 4200,
          "CPU_Power": findVal(['CPU power', 'CPU Power']) || 25
        };
      }
    } catch (err) {
      console.error("[telemetry] Failed reading HML:", err.message);
    }
  }

  const date = new Date();
  const timeStr = date.toTimeString().split(' ')[0];

  if (isBenchmarking) {
    mockStep = Math.min(mockStep + 0.1, 1);
    return {
      "Timestamp": timeStr,
      "GPU_Temp": Math.round(35 + mockStep * 33),
      "GPU_Usage": Math.round(15 + mockStep * 84),
      "VRAM_Used": Math.round(1024 + mockStep * 6500),
      "GPU_Power": Math.round(18.38 + mockStep * 134.28),
      "GPU_Fan": Math.round(42 + mockStep * 33),
      "CPU_Temp": Math.round(38 + mockStep * 27),
      "CPU_Usage": Math.round(15 + mockStep * 57),
      "RAM_Used": Math.round(15070 + mockStep * 200),
      "Core_Clock": Math.round(1500 + mockStep * 350),
      "Memory_Clock": 7500,
      "CPU_Clock": 4395,
      "CPU_Power": Math.round(16.59 + mockStep * 45)
    };
  } else {
    mockStep = Math.max(mockStep - 0.05, 0);
    return {
      "Timestamp": timeStr,
      "GPU_Temp": Math.round(35 + mockStep * 33),
      "GPU_Usage": Math.round(12.8 + mockStep * 15),
      "VRAM_Used": Math.round(1024 + mockStep * 2000),
      "GPU_Power": Math.round(18.38 + mockStep * 20),
      "GPU_Fan": Math.round(42 + mockStep * 10),
      "CPU_Temp": Math.round(38 + mockStep * 12),
      "CPU_Usage": Math.round(15 + mockStep * 10),
      "RAM_Used": Math.round(15070 + mockStep * 50),
      "Core_Clock": 1500,
      "Memory_Clock": 7500,
      "CPU_Clock": 4395,
      "CPU_Power": Math.round(16.59 + mockStep * 5)
    };
  }
}

// ---------------------------------------------------------------------------
// MSP Telemetry Aggregation
// ---------------------------------------------------------------------------

const SUMMARY_START = "<!-- USAGE-SUMMARY-START -->";
const SUMMARY_END = "<!-- USAGE-SUMMARY-END -->";

function parseDailySummary(content) {
  const s = content.indexOf(SUMMARY_START);
  const e = content.indexOf(SUMMARY_END);
  if (s === -1 || e === -1 || e < s) return null;
  const block = content.slice(s + SUMMARY_START.length, e);
  const m = block.match(/```json\s*([\s\S]*?)\s*```/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

async function getGitActivity() {
  try {
    const { stdout } = await execAsync('git log --pretty=format:"COMMIT:%ad:::%s" --date=short --numstat --summary', {
      cwd: COVIBE_ROOT,
      maxBuffer: 10 * 1024 * 1024
    });
    
    const lines = stdout.split('\n');
    const activityMap = {};
    
    let currentCommit = null;
    const commitsList = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.startsWith("COMMIT:")) {
        if (currentCommit) {
          commitsList.push(currentCommit);
        }
        
        const header = trimmed.slice(7); // Remove "COMMIT:"
        const pipeIdx = header.indexOf(":::");
        let date = "";
        let msg = "";
        if (pipeIdx !== -1) {
          date = header.slice(0, pipeIdx);
          msg = header.slice(pipeIdx + 3);
        } else {
          date = header;
          msg = "";
        }
        
        currentCommit = {
          date,
          message: msg,
          files: {},
          additions: 0,
          deletions: 0
        };
      } else if (currentCommit) {
        const createMatch = trimmed.match(/^create mode \d+ (.+)$/);
        const deleteMatch = trimmed.match(/^delete mode \d+ (.+)$/);
        
        if (createMatch) {
          const filepath = createMatch[1];
          if (filepath) {
            if (!currentCommit.files[filepath]) {
              currentCommit.files[filepath] = { additions: 0, deletions: 0 };
            }
            currentCommit.files[filepath].action = "create";
          }
        } else if (deleteMatch) {
          const filepath = deleteMatch[1];
          if (filepath) {
            if (!currentCommit.files[filepath]) {
              currentCommit.files[filepath] = { additions: 0, deletions: 0 };
            }
            currentCommit.files[filepath].action = "delete";
          }
        } else {
          // numstat line: additions deletions filepath
          const parts = trimmed.split(/\s+/);
          if (parts.length >= 3) {
            const additions = parseInt(parts[0], 10);
            const deletions = parseInt(parts[1], 10);
            const file = parts.slice(2).join(' ');
            
            if (file) {
              if (!currentCommit.files[file]) {
                currentCommit.files[file] = { additions: 0, deletions: 0 };
              }
              if (!isNaN(additions)) {
                currentCommit.files[file].additions = additions;
                currentCommit.additions += additions;
              }
              if (!isNaN(deletions)) {
                currentCommit.files[file].deletions = deletions;
                currentCommit.deletions += deletions;
              }
              if (file.includes("=>") || file.includes("}")) {
                currentCommit.files[file].action = "move";
              }
            }
          }
        }
      }
    }
    
    if (currentCommit) {
      commitsList.push(currentCommit);
    }
    
    for (const commit of commitsList) {
      const d = commit.date;
      if (!d) continue;
      
      if (!activityMap[d]) {
        activityMap[d] = {
          date: d,
          commits: 0,
          additions: 0,
          deletions: 0,
          files: new Set(),
          activity: {
            create: 0,
            fix: 0,
            update: 0,
            delete: 0,
            move: 0,
            other: 0
          }
        };
      }
      
      const record = activityMap[d];
      record.commits++;
      record.additions += commit.additions;
      record.deletions += commit.deletions;
      
      const isFixCommit = /fix|bug|issue|resolve|correct|patch/i.test(commit.message);
      const isCreateCommit = /feat|add|new|create/i.test(commit.message);
      
      for (const [filepath, fileData] of Object.entries(commit.files)) {
        record.files.add(filepath);
        
        let action = fileData.action;
        if (!action) {
          if (isFixCommit) {
            action = "fix";
          } else if (isCreateCommit) {
            action = "create";
          } else {
            action = "update";
          }
        }
        
        if (record.activity[action] !== undefined) {
          record.activity[action]++;
        } else {
          record.activity.other++;
        }
      }
    }
    
    const dailyActivity = Object.values(activityMap).map(item => ({
      date: item.date,
      commits: item.commits,
      additions: item.additions,
      deletions: item.deletions,
      files_changed: item.files.size,
      activity: item.activity
    }));
    
    return dailyActivity;
  } catch (err) {
    console.error("[git-activity] Failed to fetch git history:", err.message);
    return [];
  }
}

async function getTelemetryData() {
  const usageDir = resolve(COVIBE_ROOT, "gks", "usage");
  const out = {
    total_cost_usd: 0,
    total_input_tokens: 0,
    total_output_tokens: 0,
    total_calls: 0,
    days_covered: 0,
    by_tier: { T1: { count: 0, cost_usd: 0, input_tokens: 0, output_tokens: 0 },
               T2: { count: 0, cost_usd: 0, input_tokens: 0, output_tokens: 0 },
               T3: { count: 0, cost_usd: 0, input_tokens: 0, output_tokens: 0 } },
    daily: [],
    git_activity: [],
    updated_at: new Date().toISOString()
  };
  
  // Gather git activity concurrently
  try {
    out.git_activity = await getGitActivity();
  } catch (e) {
    console.error("[telemetry] Git activity error:", e.message);
  }

  let files;
  try {
    files = readdirSync(usageDir).filter(f => f.startsWith("USAGE--DAILY-") && f.endsWith(".md"));
  } catch { return out; }
  for (const file of files) {
    try {
      const content = await readFile(join(usageDir, file), "utf-8");
      const summary = parseDailySummary(content);
      if (!summary) continue;
      out.days_covered++;
      
      const cost = typeof summary.total_cost_usd === "number" ? summary.total_cost_usd : 0;
      const inputTokens = typeof summary.total_input_tokens === "number" ? summary.total_input_tokens : 
        (summary.by_tier ? Object.values(summary.by_tier).reduce((acc, t) => acc + (t.input_tokens || 0), 0) : 0);
      const outputTokens = typeof summary.total_output_tokens === "number" ? summary.total_output_tokens : 
        (summary.by_tier ? Object.values(summary.by_tier).reduce((acc, t) => acc + (t.output_tokens || 0), 0) : 0);
      const calls = typeof summary.call_count === "number" ? summary.call_count : 0;

      out.total_cost_usd += cost;
      out.total_input_tokens += inputTokens;
      out.total_output_tokens += outputTokens;
      out.total_calls += calls;

      if (summary.by_tier) {
        for (const tier of ["T1", "T2", "T3"]) {
          const b = summary.by_tier[tier];
          if (!b) continue;
          if (typeof b.count === "number") out.by_tier[tier].count += b.count;
          if (typeof b.cost_usd === "number") out.by_tier[tier].cost_usd += b.cost_usd;
          if (typeof b.input_tokens === "number") out.by_tier[tier].input_tokens += b.input_tokens;
          if (typeof b.output_tokens === "number") out.by_tier[tier].output_tokens += b.output_tokens;
        }
      }

      const dateMatch = file.match(/USAGE--DAILY-(\d{4}-\d{2}-\d{2})\.md/);
      const dateStr = dateMatch ? dateMatch[1] : null;
      if (dateStr) {
        out.daily.push({
          date: dateStr,
          cost_usd: cost,
          calls: calls,
          input_tokens: inputTokens,
          output_tokens: outputTokens
        });
      }
    } catch { /* skip bad files */ }
  }
  
  // Sort daily data ascending by date
  out.daily.sort((a, b) => a.date.localeCompare(b.date));
  
  return out;
}

async function broadcastTelemetry() {
  try {
    const telemetry = await getTelemetryData();
    for (const [, client] of clients.entries()) {
      send(client.ws, { type: "telemetry_update", telemetry });
    }
  } catch (err) {
    console.error("[telemetry] broadcast failed:", err.message);
  }
}

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

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }

  if (pathname === "/roadmap" || pathname === "/roadmap/") {
    try {
      const content = await readFile(join(COVIBE_ROOT, "covibe_roadmap.html"), "utf-8");
      res.writeHead(200, { 
        "content-type": "text/html",
        "Content-Security-Policy": "default-src * 'unsafe-inline' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:; connect-src * ws: wss:;"
      });
      res.end(content);
    } catch (err) {
      res.writeHead(500);
      res.end("Error loading roadmap file.");
    }
    return;
  }

  if (pathname === "/") {
    res.writeHead(302, { Location: "/roadmap" });
    res.end();
    return;
  }

  // ---------------------------------------------------------------------------
  // YouTube Search Proxy API
  // ---------------------------------------------------------------------------
  if (pathname === "/api/youtube-search") {
    const query = url.searchParams.get("q") || "";
    if (!query.trim()) {
      res.writeHead(400, { "content-type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ error: "Missing query parameter 'q'" }));
      return;
    }

    // Check cache
    const cacheKey = query.toLowerCase().trim();
    const cached = searchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      res.writeHead(200, { "content-type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ results: cached.results, source: "cache" }));
      return;
    }

    try {
      let results = [];

      if (YOUTUBE_API_KEY) {
        // Use YouTube Data API v3
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.items && searchData.items.length > 0) {
          const videoIds = searchData.items.map(item => item.id.videoId).join(",");
          const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
          const detailRes = await fetch(detailUrl);
          const detailData = await detailRes.json();

          results = (detailData.items || []).map(item => ({
            source: "youtube",
            sourceId: item.id,
            title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
            channelTitle: item.snippet.channelTitle,
            durationMs: parseDuration(item.contentDetails?.duration)
          }));
        }
      } else {
        // Fallback: use YouTube's internal search via Invidious-style scraping
        // For safety, return a helpful message to configure the API key
        res.writeHead(200, { "content-type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({
          results: [],
          source: "fallback",
          message: "YouTube API key not configured. Set YOUTUBE_API_KEY env var. Using URL/ID input for now."
        }));
        return;
      }

      // Cache for 60 seconds
      searchCache.set(cacheKey, { results, expiresAt: Date.now() + 60_000 });

      res.writeHead(200, { "content-type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ results, source: "youtube_api" }));
    } catch (err) {
      console.error("[youtube-search] Error:", err.message);
      res.writeHead(500, { "content-type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ error: "YouTube search failed", message: err.message }));
    }
    return;
  }

  // ---------------------------------------------------------------------------
  // Trip Summary API
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/api/trip-summary/")) {
    const roomId = pathname.split("/").pop();
    const room = rooms.get(roomId);
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (!room) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Room not found or expired" }));
      return;
    }

    const tracksPlayed = room.log
      .filter(e => e.type === "skip" || e.type === "queue_add")
      .map(e => ({ type: e.type, trackId: e.trackId, at: e.at, actorId: e.actorId }));

    const summary = {
      roomId: room.roomId,
      createdAt: room.createdAt,
      duration: Date.now() - room.createdAt,
      participantCount: Object.keys(room.participants).length,
      participants: Object.values(room.participants).map(p => ({
        displayName: p.displayName,
        role: p.role,
        connected: p.connected
      })),
      totalTracksPlayed: tracksPlayed.filter(e => e.type === "skip").length + (room.currentTrack ? 1 : 0),
      totalTracksAdded: tracksPlayed.filter(e => e.type === "queue_add").length,
      currentTrack: room.currentTrack,
      queueRemaining: room.queue.length,
      log: tracksPlayed
    };

    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(summary));
    return;
  }

  // ---------------------------------------------------------------------------
  // Analytics API
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/api/analytics/")) {
    const roomId = pathname.split("/").pop();
    const events = analyticsStore.get(roomId) || [];
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ roomId, events, count: events.length }));
    return;
  }

  // Try to serve from public directory
  const publicFile = join(COVIBE_ROOT, "public", pathname);
  if (existsSync(publicFile)) {
    try {
      const content = await readFile(publicFile);
      const ext = pathname.split(".").pop();
      const mime = {
        js: "application/javascript",
        css: "text/css",
        svg: "image/svg+xml",
        json: "application/json",
        webmanifest: "application/manifest+json"
      }[ext] || "text/plain";
      
      res.writeHead(200, { "content-type": mime });
      res.end(content);
      return;
    } catch (e) {}
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not_found", path: pathname }));
});

const wss = new WebSocketServer({ server });

// ISO 8601 duration parser (PT1H2M3S -> ms)
function parseDuration(iso) {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return ((parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0)) * 1000;
}

// Host Handoff: promote next connected participant to host
function promoteNextHost(room) {
  const candidates = Object.values(room.participants)
    .filter(p => p.connected && p.id !== room.hostId)
    .sort((a, b) => a.joinedAt - b.joinedAt);

  if (candidates.length === 0) return;

  const newHost = candidates[0];
  const oldHostId = room.hostId;
  room.hostId = newHost.id;
  newHost.role = "rider";

  appendLog(room, { type: "host_handoff", fromId: oldHostId, toId: newHost.id });
  broadcast(room.roomId, {
    type: "host_changed",
    newHostId: newHost.id,
    newHostName: newHost.displayName,
    reason: "previous_host_disconnected"
  });
  broadcastState(room.roomId);
  console.log(`[handoff] Room ${room.roomId}: host transferred from ${oldHostId} to ${newHost.id} (${newHost.displayName})`);
}

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
  // Push telemetry snapshot immediately on connect
  getTelemetryData().then(telemetry => send(ws, { type: "telemetry_update", telemetry })).catch(() => {});

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
      const room = client.roomId ? rooms.get(client.roomId) : null;
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
      // Record log in room history for dashboard sync
      if (room) {
        appendLog(room, { type: "agent_log", taskId, stream: "system", text: `Starting agent execution: "${agent}" for task: "${taskText}"` });
      }

      console.log(`[agent] Spawning "${agent}" for task: "${taskText}"`);
      let cp;
      if (agent === "eva" || agent === "eva-single") {
        cp = spawn(
          "node",
          ["g:/eva-cli/node_modules/tsx/dist/cli.mjs", "g:/eva-cli/src/entry.ts", "--auto"],
          {
            cwd: "g:/covibe",
            env: {
              ...getEvaEnv(),
              ...(agent === "eva-single" && { EVA_FORCE_SINGLE_SHOT: "1" })
            }
          }
        );
        cp.stdin.write(`${taskText}\n`);
      } else if (agent === "gemini") {
        cp = spawn("powershell.exe", ["-NoProfile", "-Command", `gemini --prompt "${taskText.replace(/"/g, '`"')}" --approval-mode auto_edit --raw-output`], {
          cwd: "g:/covibe",
          env: { ...process.env, FORCE_COLOR: "1" }
        });
      } else if (agent === "system") {
        cp = spawn("powershell.exe", ["-NoProfile", "-Command", taskText], {
          cwd: "g:/covibe",
          env: { ...process.env, FORCE_COLOR: "1" }
        });
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
      let isSubagentRunning = false;

      cp.stdout.on("data", (chunk) => {
        const text = chunk.toString();
        send(ws, {
          type: "agent_log",
          taskId,
          stream: "stdout",
          text
        });

        if ((agent === "eva" || agent === "eva-single") && !hasExited) {
          outputBuffer += text;

          // Check if there is an active subagent call printed in JSON block format
          const jsonMatch = outputBuffer.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && !isSubagentRunning) {
            try {
              const subagentRequest = JSON.parse(jsonMatch[1]);
              if (subagentRequest.brain && subagentRequest.prompt) {
                isSubagentRunning = true;
                outputBuffer = outputBuffer.replace(jsonMatch[0], ""); // Consume the block
                
                send(ws, {
                  type: "agent_log",
                  taskId,
                  stream: "system",
                  text: `[Server Orchestrator] Spawning subagent "${subagentRequest.subtype || subagentRequest.brain}"...`
                });

                const subagentProcess = spawn("powershell.exe", [
                  "-NoProfile",
                  "-Command",
                  `gemini --prompt "${subagentRequest.prompt.replace(/"/g, '`"')}" --approval-mode auto_edit --raw-output`
                ], {
                  cwd: "g:/covibe",
                  env: { ...process.env, FORCE_COLOR: "1" }
                });

                let subagentOutput = "";
                subagentProcess.stdout.on("data", (subChunk) => {
                  subagentOutput += subChunk.toString();
                });

                subagentProcess.on("close", (subCode) => {
                  isSubagentRunning = false;
                  send(ws, {
                    type: "agent_log",
                    taskId,
                    stream: "system",
                    text: `[Server Orchestrator] Subagent completed. Feeding output back to EVA.`
                  });
                  try {
                    cp.stdin.write(`${subagentOutput.trim()}\n`);
                  } catch (e) {
                    console.error("Failed to write back to EVA:", e);
                  }
                });
                return;
              }
            } catch (e) {
              // Ignore invalid JSON structures
            }
          }

          // Terminate only if no subagent is currently running, and we see Boss: 2+ times
          if (!isSubagentRunning) {
            const occurrences = (outputBuffer.match(/Boss:/g) || []).length;
            if (occurrences >= 2 && !outputBuffer.includes('```json')) {
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

              // 3. Broadcast updated telemetry after agent task completes
              setTimeout(() => broadcastTelemetry(), 1000);

              send(ws, {
                type: "agent_log",
                taskId,
                stream: "system",
                text: `Finished task execution. Terminating agent session gracefully...`
              });

              // 4. Write exit command to stdin to let the agent run loop.end() and save its episodic memory
              setTimeout(() => {
                try {
                  cp.stdin.write("exit\n");
                } catch (e) {}
              }, 500);

              // 5. Force kill after 3000ms to clean up the hanging node process from event loop on Windows
              setTimeout(() => {
                try {
                  cp.kill("SIGKILL");
                } catch (e) {}
              }, 3000);
            }
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
        // Record stderr log
        if (room) {
          appendLog(room, { type: "agent_log", taskId, stream: "stderr", text: chunk.toString() });
        }
      });

      cp.on("error", (err) => {
        send(ws, {
          type: "agent_log",
          taskId,
          stream: "stderr",
          text: `Failed to spawn process: ${err.message}`
        });
        // Record error log
        if (room) {
          appendLog(room, { type: "agent_log", taskId, stream: "stderr", text: `Failed to spawn process: ${err.message}` });
        }
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
      const room = client.roomId ? rooms.get(client.roomId) : null;
      if (activeTasks.has(taskId)) {
        const cp = activeTasks.get(taskId);
        try { cp.kill("SIGKILL"); } catch (e) {}
        activeTasks.delete(taskId);
        send(ws, {
          type: "agent_log",
          taskId,
          stream: "system",
          text: `Canceled task: "${taskId}"`
        });
        // Record cancellation log using the valid room reference
        if (room) {
          appendLog(room, { type: "agent_log", taskId, stream: "system", text: `Canceled task: "${taskId}"` });
        }
        send(ws, { type: "agent_status", taskId, status: "canceled" });
        // Broadcast updated telemetry after cancel
        setTimeout(() => broadcastTelemetry(), 500);
      }
      return;
    }

    if (data.type === "get_telemetry") {
      getTelemetryData().then(telemetry => send(ws, { type: "telemetry_update", telemetry })).catch(() => {});
      return;
    }

    if (data.type === "start_benchmark_run") {
      if (activeBenchmarkProcess) {
        send(ws, { type: "error", message: "Benchmark is already running." });
        return;
      }

      const { provider, model_id, prompt } = data.config || {};
      if (!prompt) {
        send(ws, { type: "error", message: "Prompt is required to run benchmark." });
        return;
      }

      send(ws, {
        type: "benchmark_status",
        status: "running"
      });

      send(ws, {
        type: "benchmark_log",
        text: `Starting benchmark run on ${provider} (Model: ${model_id || "default"})...\n`
      });

      let cp;
      if (provider === "thaillm" || provider === "gemini") {
        cp = spawn("python", ["cloud_bench.py", provider, model_id, prompt], {
          cwd: COVIBE_ROOT
        });
      } else if (provider === "qwen") {
        cp = spawn("python", ["qwen_bench.py", model_id, prompt], {
          cwd: COVIBE_ROOT
        });
      } else {
        // Fallback demo mock benchmark execution
        cp = spawn("powershell.exe", [
          "-NoProfile",
          "-Command",
          `Write-Output 'Executing Local Mock Benchmark...'; Start-Sleep -Seconds 1; Write-Output 'Initializing ${model_id || "Mock-LLM-v1"}'; Start-Sleep -Seconds 2; Write-Output 'Generating code tokens...'; Start-Sleep -Seconds 2; Write-Output '📊 PERFORMANCE METRICS'; Write-Output 'Output Speed:    52.41 tokens/sec'; Write-Output 'Total Time:      5.00s'; Write-Output '### END'`
        ], {
          cwd: COVIBE_ROOT
        });
      }

      activeBenchmarkProcess = cp;
      mockStep = 0;

      // Start hardware monitoring stream
      if (benchmarkInterval) clearInterval(benchmarkInterval);
      benchmarkInterval = setInterval(() => {
        const isBenchmarking = activeBenchmarkProcess !== null;
        const sample = getLatestHardwareSample(isBenchmarking);
        
        // Broadcast to all clients
        for (const c of clients.values()) {
          send(c.ws, {
            type: "live_hardware_sample",
            sample
          });
        }

        // Thermal Stop rule check: GPU >= 71C
        if (sample.GPU_Temp >= 71) {
          send(ws, {
            type: "benchmark_log",
            text: `\n⚠️ [THERMAL ALERT] GPU reached ${sample.GPU_Temp}°C! Suspending execution according to EABS-01.\n`
          });
        }
      }, 1000);

      cp.stdout.on("data", (chunk) => {
        send(ws, {
          type: "benchmark_log",
          text: chunk.toString()
        });
      });

      cp.stderr.on("data", (chunk) => {
        send(ws, {
          type: "benchmark_log",
          text: `[Error] ${chunk.toString()}`
        });
      });

      cp.on("close", (code) => {
        activeBenchmarkProcess = null;
        send(ws, {
          type: "benchmark_status",
          status: code === 0 ? "completed" : "failed",
          error: code === 0 ? null : `Process exited with code ${code}`
        });
        send(ws, {
          type: "benchmark_log",
          text: `\nBenchmark execution finished with code ${code}.\n`
        });

        // Let the cooldown telemetry run for another 10 seconds before clearing
        setTimeout(() => {
          if (!activeBenchmarkProcess && benchmarkInterval) {
            clearInterval(benchmarkInterval);
            benchmarkInterval = null;
          }
        }, 10000);
      });

      return;
    }

    if (data.type === "abort_benchmark_run") {
      if (activeBenchmarkProcess) {
        try {
          activeBenchmarkProcess.kill("SIGKILL");
        } catch (e) {}
        activeBenchmarkProcess = null;
        send(ws, {
          type: "benchmark_status",
          status: "idle"
        });
        send(ws, {
          type: "benchmark_log",
          text: "\n⚠️ [ABORT] Benchmark execution terminated by user.\n"
        });
      }
      return;
    }

    // Analytics event tracking
    if (data.type === "analytics_event") {
      const roomId = data.roomId || client.roomId;
      if (roomId) {
        if (!analyticsStore.has(roomId)) analyticsStore.set(roomId, []);
        const events = analyticsStore.get(roomId);
        events.push({
          event: data.event,
          participantId: data.participantId || client.participantId,
          metadata: data.metadata || {},
          timestamp: Date.now()
        });
        // Cap at 500 events per room
        if (events.length > 500) events.shift();
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

    if (data.type === "reorder_queue") {
      const { trackIds } = data;
      if (!Array.isArray(trackIds)) return;

      // Reconstruct queue based on provided ID order, ensuring only existing tracks remain
      const newQueue = [];
      for (const id of trackIds) {
        const track = room.queue.find((t) => t.id === id);
        if (track) newQueue.push(track);
      }

      // Add any tracks that might have been missing from the trackIds list (safety fallback)
      for (const track of room.queue) {
        if (!newQueue.find((t) => t.id === track.id)) {
          newQueue.push(track);
        }
      }

      room.queue = newQueue;
      appendLog(room, { type: "queue_reorder", actorId });
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

    // Host Handoff: if the disconnected participant was the host, schedule handoff
    if (client.participantId === room.hostId) {
      // Clear any existing handoff timer for this room
      if (hostHandoffTimers.has(room.roomId)) {
        clearTimeout(hostHandoffTimers.get(room.roomId));
      }
      // Wait 15 seconds before promoting (give host time to reconnect)
      const timer = setTimeout(() => {
        hostHandoffTimers.delete(room.roomId);
        const currentRoom = rooms.get(room.roomId);
        if (!currentRoom) return;
        // Check if host is still disconnected
        const host = currentRoom.participants[currentRoom.hostId];
        if (host && !host.connected) {
          promoteNextHost(currentRoom);
        }
      }, 15_000);
      hostHandoffTimers.set(room.roomId, timer);
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

// Start the HTTP/WebSocket server with fallback port handling
function startServer(port) {
  server.listen(port, "0.0.0.0", () => {
    console.log(`CoVibe realtime server listening on http://localhost:${port}`);
  });
}

// Handle address-in-use errors and fallback before starting server
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    const fallbackPort = PORT + 1;
    console.warn(`Port ${PORT} in use – switching to fallback port ${fallbackPort}`);
    // Remove this listener to avoid recursion
    server.removeAllListeners("error");
    startServer(fallbackPort);
  } else {
    console.error("[server] Unhandled error:", err);
    process.exit(1);
  }
});

// Attempt primary port
startServer(PORT);
