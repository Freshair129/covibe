import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Bike,
  Bluetooth,
  CirclePause,
  CirclePlay,
  Copy,
  Headphones,
  Link as LinkIcon,
  MessageCircle,
  Mic,
  MicOff,
  Moon,
  Music2,
  Plus,
  QrCode,
  RadioTower,
  RotateCw,
  Search,
  Send,
  SkipForward,
  Trash2,
  Users,
  Video,
  Volume2,
  Wifi
} from "lucide-react";

import { youtubeIdFromInput, thumbnailFor } from "./utils/youtube";
import { calculateSyncAction } from "./utils/sync";

type Role = "rider" | "passenger";

type Participant = {
  id: string;
  role: Role;
  displayName: string;
  connected: boolean;
  driftMs: number;
  latencyMs: number;
  voiceEnabled: boolean;
};

type Track = {
  id: string;
  source: "youtube";
  sourceId: string;
  title: string;
  thumbnailUrl: string;
  durationMs: number;
  addedBy: string;
  addedAt: number;
};

type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: number;
};

type VoiceSignal = {
  fromId: string;
  signal: {
    kind: "offer" | "answer" | "ice";
    description?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
  };
};

type RoomState = {
  roomId: string;
  hostId: string;
  serverTime: number;
  participants: Participant[];
  currentTrack: Track | null;
  queue: Track[];
  chatMessages: ChatMessage[];
  playback: {
    isPlaying: boolean;
    positionMs: number;
    updatedAt: number;
    rate: number;
  };
};

type ServerMessage =
  | { type: "hello"; clientId: string; serverTime: number }
  | { type: "room_created"; room: RoomState; participantId: string }
  | { type: "room_joined"; room: RoomState; participantId: string }
  | { type: "room_state"; room: RoomState }
  | { type: "chat_message"; message: ChatMessage }
  | { type: "voice_status"; participantId: string; enabled: boolean }
  | { type: "voice_signal"; fromId: string; signal: VoiceSignal["signal"] }
  | {
      type: "sync_target";
      expectedMs: number;
      driftMs: number;
      isPlaying: boolean;
      serverTime: number;
    }
  | { type: "error"; message: string }
  | { type: "pong"; clientSentAt: number; serverTime: number };

type ClientMessage = Record<string, unknown>;

type YTPlayer = {
  cueVideoById: (id: string, startSeconds?: number) => void;
  loadVideoById: (id: string, startSeconds?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: () => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const WS_URL =
  import.meta.env.VITE_COVIBE_WS_URL ||
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:8787`;

const PARTICIPANT_KEY = "covibe.participantId";
const NAME_KEY = "covibe.displayName";

function makeParticipantId() {
  const existing = localStorage.getItem(PARTICIPANT_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(PARTICIPANT_KEY, id);
  return id;
}

function formatTime(ms: number) {
  const safe = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[src='https://www.youtube.com/iframe_api']"
    );
    window.onYouTubeIframeAPIReady = () => resolve();
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  });
}

const ROOM_KEY = "covibe.roomId";

function useRealtime() {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [participantId, setParticipantId] = useState(makeParticipantId);
  const [error, setError] = useState("");
  const [voiceSignal, setVoiceSignal] = useState<VoiceSignal | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    setStatus("connecting");

    ws.addEventListener("open", () => {
      setStatus("open");
      reconnectCountRef.current = 0;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      
      // Auto-rejoin if we have a saved roomId
      const savedRoomId = localStorage.getItem(ROOM_KEY);
      const savedName = localStorage.getItem(NAME_KEY);
      if (savedRoomId) {
        ws.send(JSON.stringify({
          type: "join_room",
          roomId: savedRoomId,
          participantId: makeParticipantId(),
          displayName: savedName || "กำลังกลับมา...",
          role: "passenger" // Default to passenger on reconnect, will be updated by server state
        }));
      }
    });

    ws.addEventListener("close", () => {
      setStatus("closed");
      // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
      const delay = Math.min(30000, Math.pow(2, reconnectCountRef.current) * 1000);
      reconnectCountRef.current++;
      reconnectTimerRef.current = window.setTimeout(connect, delay);
    });

    ws.addEventListener("error", () => {
      setStatus("closed");
      setError("การเชื่อมต่อขัดข้อง กำลังลองใหม่...");
    });

    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data) as ServerMessage;
      if (message.type === "room_created" || message.type === "room_joined") {
        setRoom(message.room);
        setParticipantId(message.participantId);
        localStorage.setItem(PARTICIPANT_KEY, message.participantId);
        localStorage.setItem(ROOM_KEY, message.room.roomId);
        window.history.replaceState(null, "", `/?room=${message.room.roomId}`);
      }
      if (message.type === "room_state") {
        setRoom(message.room);
        localStorage.setItem(ROOM_KEY, message.room.roomId);
      }
      if (message.type === "chat_message") {
        setRoom((current) => {
          if (!current || current.roomId !== message.message.roomId) return current;
          if (current.chatMessages.some((chat) => chat.id === message.message.id)) return current;
          return {
            ...current,
            chatMessages: [...current.chatMessages, message.message].slice(-80)
          };
        });
      }
      if (message.type === "voice_status") {
        setRoom((current) => {
          if (!current) return current;
          return {
            ...current,
            participants: current.participants.map((participant) =>
              participant.id === message.participantId
                ? { ...participant, voiceEnabled: message.enabled }
                : participant
            )
          };
        });
      }
      if (message.type === "voice_signal") {
        setVoiceSignal({ fromId: message.fromId, signal: message.signal });
      }
      if (message.type === "error") {
        if (message.message.includes("ไม่พบห้อง")) {
          localStorage.removeItem(ROOM_KEY);
          setRoom(null);
        }
        setError(message.message);
      }
    });
  }, []);

  useEffect(() => {
    connect();
    
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        connect();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [connect]);

  const send = useCallback((message: ClientMessage) => {
    setError("");
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      // If closed, attempt immediate reconnect when trying to send
      connect();
      return;
    }
    wsRef.current.send(JSON.stringify({ participantId, roomId: room?.roomId, ...message }));
  }, [participantId, room?.roomId, connect]);

  return { status, room, participantId, error, setError, send, voiceSignal };
}

function YouTubeDeck({
  room,
  role,
  send,
  volume,
  mediaMode,
  onDuration
}: {
  room: RoomState | null;
  role: Role;
  send: (message: ClientMessage) => void;
  volume: number;
  mediaMode: "music" | "video";
  onDuration: (durationMs: number) => void;
}) {
  const playerRef = useRef<YTPlayer | null>(null);
  const activeTrackRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(true);
  const [playerState, setPlayerState] = useState("idle");

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT) return;
      playerRef.current = new window.YT.Player("covibe-youtube-player", {
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          controls: 0,
          disablekb: 1
        },
        events: {
          onReady: () => setReady(true),
          onStateChange: (event) => {
            const states = window.YT?.PlayerState;
            if (!states) return;
            if (event.data === states.ENDED && role === "rider") {
              send({ type: "skip" });
            }
            if (event.data === states.PLAYING) setPlayerState("playing");
            if (event.data === states.PAUSED) setPlayerState("paused");
            if (event.data === states.BUFFERING) setPlayerState("buffering");
          }
        }
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
    };
  }, [role, send]);

  useEffect(() => {
    playerRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    const player = playerRef.current;
    const track = room?.currentTrack;
    if (!ready || !player || !track) return;

    const expectedSeconds = Math.max(0, room.playback.positionMs / 1000);
    if (activeTrackRef.current !== track.id) {
      activeTrackRef.current = track.id;
      if (room.playback.isPlaying) {
        player.loadVideoById(track.sourceId, expectedSeconds);
      } else {
        player.cueVideoById(track.sourceId, expectedSeconds);
      }
      return;
    }

    const actualSeconds = player.getCurrentTime?.() || 0;
    const action = calculateSyncAction(actualSeconds, expectedSeconds);

    if (action.type === "seek") {
      player.seekTo(action.positionSeconds, true);
    } else if (action.type === "adjust_rate" && room.playback.isPlaying) {
      player.setPlaybackRate(action.rate);
      window.setTimeout(() => player.setPlaybackRate(1), 1200);
    }

    const state = window.YT?.PlayerState;
    if (room.playback.isPlaying && state && player.getPlayerState() !== state.PLAYING) {
      try {
        player.playVideo();
        setNeedsUnlock(false);
      } catch {
        setNeedsUnlock(true);
      }
    }
    if (!room.playback.isPlaying && state && player.getPlayerState() === state.PLAYING) {
      player.pauseVideo();
    }
  }, [ready, room?.currentTrack?.id, room?.playback.isPlaying, room?.playback.positionMs]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || !room?.currentTrack) return;
      const duration = player.getDuration?.() || 0;
      if (duration > 0) onDuration(duration * 1000);
      send({
        type: "sync_report",
        positionMs: player.getCurrentTime() * 1000,
        clientSentAt: Date.now()
      });
    }, 3000);

    return () => window.clearInterval(interval);
  }, [room?.currentTrack?.id, send, onDuration]);

  function unlockPlayback() {
    const player = playerRef.current;
    if (!player) return;
    player.setVolume(volume);
    if (room?.playback.isPlaying) player.playVideo();
    setNeedsUnlock(false);
  }

  return (
    <section className="player-shell" aria-label="เครื่องเล่นเพลง">
      <div className={`video-frame ${mediaMode === "music" ? "music-frame" : ""}`}>
        <div id="covibe-youtube-player" />
        {mediaMode === "music" && room?.currentTrack && (
          <div className="music-layer" aria-hidden="true">
            <img src={room.currentTrack.thumbnailUrl} alt="" />
            <div>
              <Music2 />
              <span>Music mode</span>
            </div>
          </div>
        )}
        {(!room?.currentTrack || needsUnlock) && (
          <button className="unlock-layer" type="button" onClick={unlockPlayback}>
            <Headphones aria-hidden="true" />
            <span>{room?.currentTrack ? "แตะเพื่อเปิดเสียงบนเครื่องนี้" : "รอเพลงแรก"}</span>
          </button>
        )}
      </div>
      <div className="player-status">
        <span>{ready ? "YouTube พร้อม" : "กำลังโหลด player"}</span>
        <span>{playerState}</span>
      </div>
    </section>
  );
}

function useVoiceChat({
  room,
  participantId,
  send,
  incomingSignal
}: {
  room: RoomState | null;
  participantId: string;
  send: (message: ClientMessage) => void;
  incomingSignal: VoiceSignal | null;
}) {
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [enabled, setEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

  const closePeer = useCallback((remoteId: string) => {
    const peer = peersRef.current.get(remoteId);
    if (peer) peer.close();
    peersRef.current.delete(remoteId);
    setRemoteStreams((current) => {
      const next = { ...current };
      delete next[remoteId];
      return next;
    });
  }, []);

  const makePeer = useCallback(
    (remoteId: string) => {
      const existing = peersRef.current.get(remoteId);
      if (existing) return existing;

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      localStreamRef.current?.getTracks().forEach((track) => {
        const stream = localStreamRef.current;
        if (stream) peer.addTrack(track, stream);
      });

      peer.onicecandidate = (event) => {
        if (!event.candidate) return;
        send({
          type: "voice_signal",
          targetId: remoteId,
          signal: { kind: "ice", candidate: event.candidate.toJSON() }
        });
      };

      peer.ontrack = (event) => {
        const [stream] = event.streams;
        if (!stream) return;
        setRemoteStreams((current) => ({ ...current, [remoteId]: stream }));
      };

      peer.onconnectionstatechange = () => {
        if (["closed", "failed", "disconnected"].includes(peer.connectionState)) {
          closePeer(remoteId);
        }
      };

      peersRef.current.set(remoteId, peer);
      return peer;
    },
    [closePeer, send]
  );

  const createOffer = useCallback(
    async (remoteId: string) => {
      const peer = makePeer(remoteId);
      if (peer.signalingState !== "stable") return;
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      send({
        type: "voice_signal",
        targetId: remoteId,
        signal: { kind: "offer", description: peer.localDescription?.toJSON() }
      });
    },
    [makePeer, send]
  );

  const startVoice = useCallback(async () => {
    setVoiceError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      localStreamRef.current = stream;
      setEnabled(true);
      setMuted(false);
      send({ type: "voice_status", enabled: true });
    } catch {
      setVoiceError("เปิดไมค์ไม่ได้ ตรวจ permission ของ browser อีกครั้ง");
    }
  }, [send]);

  const stopVoice = useCallback(() => {
    for (const remoteId of peersRef.current.keys()) closePeer(remoteId);
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setRemoteStreams({});
    setEnabled(false);
    setMuted(false);
    send({ type: "voice_status", enabled: false });
  }, [closePeer, send]);

  const toggleMute = useCallback(() => {
    const nextMuted = !muted;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setMuted(nextMuted);
  }, [muted]);

  useEffect(() => {
    if (!enabled || !room) return;
    const activeRemoteIds = room.participants
      .filter((participant) => participant.id !== participantId && participant.voiceEnabled)
      .map((participant) => participant.id);

    for (const remoteId of activeRemoteIds) {
      if (participantId < remoteId && !peersRef.current.has(remoteId)) {
        void createOffer(remoteId);
      }
    }

    for (const remoteId of peersRef.current.keys()) {
      if (!activeRemoteIds.includes(remoteId)) closePeer(remoteId);
    }
  }, [closePeer, createOffer, enabled, participantId, room?.participants]);

  useEffect(() => {
    if (!enabled || !incomingSignal) return;
    const { fromId, signal } = incomingSignal;
    const peer = makePeer(fromId);

    async function applySignal() {
      if (signal.kind === "offer" && signal.description) {
        await peer.setRemoteDescription(signal.description);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        send({
          type: "voice_signal",
          targetId: fromId,
          signal: { kind: "answer", description: peer.localDescription?.toJSON() }
        });
      }

      if (signal.kind === "answer" && signal.description) {
        await peer.setRemoteDescription(signal.description);
      }

      if (signal.kind === "ice" && signal.candidate) {
        await peer.addIceCandidate(signal.candidate);
      }
    }

    void applySignal().catch(() => {
      setVoiceError("เชื่อมต่อเสียงไม่สำเร็จ ลองปิดแล้วเปิดไมค์ใหม่");
      closePeer(fromId);
    });
  }, [closePeer, enabled, incomingSignal, makePeer, send]);

  return {
    enabled,
    muted,
    voiceError,
    remoteStreams,
    startVoice,
    stopVoice,
    toggleMute
  };
}

function VoicePanel({
  room,
  participantId,
  send,
  incomingSignal
}: {
  room: RoomState;
  participantId: string;
  send: (message: ClientMessage) => void;
  incomingSignal: VoiceSignal | null;
}) {
  const { enabled, muted, voiceError, remoteStreams, startVoice, stopVoice, toggleMute } =
    useVoiceChat({ room, participantId, send, incomingSignal });
  const activeCount = room.participants.filter((participant) => participant.voiceEnabled).length;

  return (
    <div className="voice-card">
      <div className="section-title">
        <Mic aria-hidden="true" />
        <h2>Voice chat</h2>
      </div>
      <div className="voice-actions">
        <button
          className={`voice-button ${enabled ? "active" : ""}`}
          type="button"
          onClick={enabled ? stopVoice : startVoice}
        >
          {enabled ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
          {enabled ? "ปิดไมค์" : "เปิดไมค์"}
        </button>
        <button className="voice-button" type="button" onClick={toggleMute} disabled={!enabled}>
          {muted ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>
      <p className="muted">ออนไลน์เสียง {activeCount} คน</p>
      {voiceError && <p className="error-line">{voiceError}</p>}
      {Object.entries(remoteStreams).map(([remoteId, stream]) => (
        <audio
          key={remoteId}
          autoPlay
          playsInline
          ref={(node) => {
            if (node && node.srcObject !== stream) node.srcObject = stream;
          }}
        />
      ))}
    </div>
  );
}

function ChatPanel({
  room,
  participantId,
  send
}: {
  room: RoomState;
  participantId: string;
  send: (message: ClientMessage) => void;
}) {
  const [draft, setDraft] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: "end" });
  }, [room.chatMessages.length]);

  function submitChat() {
    const body = draft.trim();
    if (!body) return;
    send({ type: "chat_message", body });
    setDraft("");
  }

  return (
    <div className="chat-card">
      <div className="section-title">
        <MessageCircle aria-hidden="true" />
        <h2>Chat</h2>
      </div>
      <div className="chat-list">
        {room.chatMessages.length === 0 ? (
          <p className="muted">ยังไม่มีข้อความ</p>
        ) : (
          room.chatMessages.map((message) => (
            <div
              className={`chat-bubble ${message.senderId === participantId ? "mine" : ""}`}
              key={message.id}
            >
              <strong>{message.senderName}</strong>
              <span>{message.body}</span>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="chat-compose">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submitChat();
          }}
          placeholder="พิมพ์ข้อความ"
        />
        <button type="button" onClick={submitChat} aria-label="ส่งข้อความ">
          <Send aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function App() {
  const { status, room, participantId, error, setError, send, voiceSignal } = useRealtime();
  const roomFromUrl = new URLSearchParams(location.search).get("room") || "";
  const [role, setRole] = useState<Role>(roomFromUrl ? "passenger" : "rider");
  const [displayName, setDisplayName] = useState(
    localStorage.getItem(NAME_KEY) || (roomFromUrl ? "คนซ้อน" : "คนขับ")
  );
  const [roomCode, setRoomCode] = useState(roomFromUrl);
  const [trackInput, setTrackInput] = useState("");
  const [trackTitle, setTrackTitle] = useState("");
  const [volume, setVolume] = useState(80);
  const [durationMs, setDurationMs] = useState(0);
  const [saver, setSaver] = useState(false);
  const [mediaMode, setMediaMode] = useState<"music" | "video">("music");
  const autoJoinedRef = useRef(false);

  const self = room?.participants.find((participant) => participant.id === participantId);
  const isHost = room?.hostId === participantId || role === "rider";
  const joinUrl = room
    ? `${location.origin}/?room=${encodeURIComponent(room.roomId)}`
    : "";
  const currentPosition = room?.playback.positionMs || 0;
  const progress = durationMs ? Math.min(100, (currentPosition / durationMs) * 100) : 0;

  const connectionLabel = useMemo(() => {
    if (status === "open") return "online";
    if (status === "connecting") return "connecting";
    return "offline";
  }, [status]);

  useEffect(() => {
    localStorage.setItem(NAME_KEY, displayName);
  }, [displayName]);

  useEffect(() => {
    if (!roomFromUrl || room || status !== "open" || autoJoinedRef.current) return;
    autoJoinedRef.current = true;
    setRole("passenger");
    send({
      type: "join_room",
      roomId: roomFromUrl.trim().toUpperCase(),
      displayName,
      role: "passenger"
    });
  }, [displayName, room, roomFromUrl, send, status]);

  function createRoom() {
    setRole("rider");
    send({ type: "create_room", displayName });
  }

  function joinRoom() {
    if (!roomCode.trim()) {
      setError("ใส่รหัสห้องก่อน");
      return;
    }
    setRole("passenger");
    send({
      type: "join_room",
      roomId: roomCode.trim().toUpperCase(),
      displayName,
      role: "passenger"
    });
  }

  function addTrack() {
    const sourceId = youtubeIdFromInput(trackInput);
    if (!sourceId) {
      setError("ตอนนี้ MVP รับ YouTube URL หรือ video id ก่อน");
      return;
    }
    send({
      type: "add_track",
      track: {
        sourceId,
        title: trackTitle.trim() || `YouTube ${sourceId}`,
        thumbnailUrl: thumbnailFor(sourceId)
      }
    });
    setTrackInput("");
    setTrackTitle("");
  }

  function playPause() {
    if (!room?.currentTrack) return;
    if (room.playback.isPlaying) {
      send({ type: "pause", positionMs: currentPosition });
    } else {
      send({ type: "play", positionMs: currentPosition });
    }
  }

  function leaveRoom() {
    localStorage.removeItem(ROOM_KEY);
    location.href = "/";
  }

  if (saver) {
    return (
      <main className="saver" onClick={() => setSaver(false)}>
        <div>
          <Moon aria-hidden="true" />
          <strong>CoVibe</strong>
          <span>{room?.currentTrack?.title || "ไม่มีเพลงที่กำลังเล่น"}</span>
          <small>แตะหน้าจอเพื่อกลับ</small>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Bluetooth aria-hidden="true" />
          </div>
          <div>
            <h1>CoVibe</h1>
            <p>ฟังเพลงเดียวกันบนมอไซค์</p>
          </div>
        </div>
        <div className={`connection-pill ${status}`}>
          <RadioTower aria-hidden="true" />
          {connectionLabel}
        </div>
      </header>

      {!room ? (
        <section className="start-grid">
          <div className="setup-panel">
            <div className="section-title">
              <Bike aria-hidden="true" />
              <h2>เริ่มใช้งาน</h2>
            </div>
            <label>
              ชื่อในทริป
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="เช่น เบส / แพรว"
              />
            </label>
            <div className="role-tabs" role="tablist" aria-label="เลือกบทบาท">
              <button
                className={role === "rider" ? "active" : ""}
                type="button"
                onClick={() => setRole("rider")}
              >
                <Bike aria-hidden="true" />
                คนขับ
              </button>
              <button
                className={role === "passenger" ? "active" : ""}
                type="button"
                onClick={() => setRole("passenger")}
              >
                <Users aria-hidden="true" />
                คนซ้อน
              </button>
            </div>

            {role === "rider" ? (
              <button className="primary-action" type="button" onClick={createRoom}>
                <QrCode aria-hidden="true" />
                สร้างห้องทริป
              </button>
            ) : (
              <div className="join-box">
                <label>
                  รหัสห้อง
                  <input
                    value={roomCode}
                    onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                    placeholder="เช่น A1B2C3"
                  />
                </label>
                <button className="primary-action" type="button" onClick={joinRoom}>
                  <Wifi aria-hidden="true" />
                  เข้าร่วมห้อง
                </button>
              </div>
            )}
            {error && <p className="error-line">{error}</p>}
          </div>

          <div className="setup-panel compact">
            <div className="section-title">
              <Headphones aria-hidden="true" />
              <h2>MVP ตอนนี้</h2>
            </div>
            <ul className="capability-list">
              <li>QR/link join</li>
              <li>YouTube queue</li>
              <li>play/pause/skip sync</li>
              <li>drift correction</li>
              <li>OLED saver</li>
            </ul>
          </div>
        </section>
      ) : (
        <section className="ride-layout">
          <div className="now-panel">
            <div className="room-strip">
              <span>ห้อง {room.roomId}</span>
              <span>{self?.role === "rider" ? "Rider" : "Passenger"}</span>
              <button className="leave-pill" onClick={leaveRoom}>ออกจากทริป</button>
            </div>

            <YouTubeDeck
              room={room}
              role={role}
              send={send}
              volume={volume}
              mediaMode={mediaMode}
              onDuration={setDurationMs}
            />

            <div className="mode-tabs" role="tablist" aria-label="เลือกโหมดเล่น">
              <button
                className={mediaMode === "music" ? "active" : ""}
                type="button"
                onClick={() => setMediaMode("music")}
              >
                <Music2 aria-hidden="true" />
                Music
              </button>
              <button
                className={mediaMode === "video" ? "active" : ""}
                type="button"
                onClick={() => setMediaMode("video")}
              >
                <Video aria-hidden="true" />
                Video
              </button>
            </div>

            <div className="track-card">
              {room.currentTrack ? (
                <>
                  <img src={room.currentTrack.thumbnailUrl} alt="" />
                  <div>
                    <span>กำลังเล่น</span>
                    <h2>{room.currentTrack.title}</h2>
                    <div className="time-row">
                      <small>{formatTime(currentPosition)}</small>
                      <div className="progress-track">
                        <div style={{ width: `${progress}%` }} />
                      </div>
                      <small>{durationMs ? formatTime(durationMs) : "--:--"}</small>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-track">
                  <Search aria-hidden="true" />
                  เพิ่มเพลงแรกจาก YouTube
                </div>
              )}
            </div>

            <div className="controls-grid">
              <button className="control-button" type="button" onClick={playPause}>
                {room.playback.isPlaying ? (
                  <CirclePause aria-hidden="true" />
                ) : (
                  <CirclePlay aria-hidden="true" />
                )}
                {room.playback.isPlaying ? "หยุด" : "เล่น"}
              </button>
              <button className="control-button" type="button" onClick={() => send({ type: "skip" })}>
                <SkipForward aria-hidden="true" />
                ข้าม
              </button>
              <button className="control-button" type="button" onClick={() => setSaver(true)}>
                <Moon aria-hidden="true" />
                จอดำ
              </button>
            </div>

            <label className="volume-control">
              <span>
                <Volume2 aria-hidden="true" />
                เสียงเครื่องนี้
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
              />
              <strong>{volume}%</strong>
            </label>
          </div>

          <aside className="side-panel">
            {isHost && (
              <div className="invite-card">
                <div className="qr-wrap">
                  <QRCodeSVG value={joinUrl} size={148} bgColor="transparent" fgColor="#f3f7f4" />
                </div>
                <div>
                  <span>ให้คนซ้อนสแกน</span>
                  <strong>{room.roomId}</strong>
                </div>
                <button type="button" onClick={copyInvite}>
                  <Copy aria-hidden="true" />
                  คัดลอกลิงก์
                </button>
              </div>
            )}

            <VoicePanel
              room={room}
              participantId={participantId}
              send={send}
              incomingSignal={voiceSignal}
            />

            <ChatPanel room={room} participantId={participantId} send={send} />

            <div className="add-card">
              <div className="section-title">
                <Plus aria-hidden="true" />
                <h2>เพิ่มเพลง</h2>
              </div>
              <label>
                YouTube URL หรือ video id
                <div className="input-with-icon">
                  <LinkIcon aria-hidden="true" />
                  <input
                    value={trackInput}
                    onChange={(event) => setTrackInput(event.target.value)}
                    placeholder="https://youtu.be/..."
                  />
                </div>
              </label>
              <label>
                ชื่อเพลงที่แสดง
                <input
                  value={trackTitle}
                  onChange={(event) => setTrackTitle(event.target.value)}
                  placeholder="ปล่อยว่างได้"
                />
              </label>
              <button className="primary-action small" type="button" onClick={addTrack}>
                <Plus aria-hidden="true" />
                เพิ่มเข้าคิว
              </button>
              {error && <p className="error-line">{error}</p>}
            </div>

            <div className="queue-card">
              <div className="section-title">
                <RotateCw aria-hidden="true" />
                <h2>คิวถัดไป</h2>
              </div>
              {room.queue.length === 0 ? (
                <p className="muted">ยังไม่มีเพลงถัดไป</p>
              ) : (
                <ol className="queue-list">
                  {room.queue.map((track) => (
                    <li key={track.id}>
                      <img src={track.thumbnailUrl} alt="" />
                      <span>{track.title}</span>
                      <button
                        type="button"
                        aria-label="ลบเพลงออกจากคิว"
                        onClick={() => send({ type: "remove_track", trackId: track.id })}
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="people-card">
              <div className="section-title">
                <Users aria-hidden="true" />
                <h2>ผู้ร่วมทริป</h2>
              </div>
              <div className="people-list">
                {room.participants.map((participant) => (
                  <div key={participant.id}>
                    <span className={participant.connected ? "dot on" : "dot"} />
                    <strong>{participant.displayName}</strong>
                    <small>
                      {participant.role} · drift {Math.round(participant.driftMs)}ms
                      {participant.voiceEnabled ? " · voice" : ""}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}

export default App;
