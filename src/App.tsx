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
  Moon,
  Music2,
  Plus,
  QrCode,
  RadioTower,
  RotateCw,
  Search,
  SkipForward,
  Trash2,
  Users,
  Video,
  Volume2,
  Wifi,
  ChevronUp,
  ChevronDown
} from "lucide-react";

import { youtubeIdFromInput, thumbnailFor } from "./utils/youtube";
import { getFile } from "./utils/db";
import { useRealtime } from "./hooks/useRealtime";
import { useWebRTC } from "./hooks/useWebRTC";
import { useWakeLock } from "./hooks/useWakeLock";
import { useIdleTimer } from "./hooks/useIdleTimer";
import { useFileSync } from "./hooks/useFileSync";
import { YouTubeDeck } from "./components/YouTubeDeck";
import { LocalAudioPlayer } from "./components/LocalAudioPlayer";
import { VoicePanel } from "./components/VoicePanel";
import { ChatPanel } from "./components/ChatPanel";
import { SearchPanel } from "./components/SearchPanel";
import { TripSummary } from "./components/TripSummary";
import { formatTime } from "./utils/time";
import { trackEvent } from "./utils/analytics";
import { Role } from "./types";
import { NAME_KEY, ROOM_KEY } from "./constants";

export default function App() {
  const { status, room, participantId, error, setError, send: wsSend, voiceSignal, webrtcSignal, hostNotification } = useRealtime();

  const roomFromUrl = new URLSearchParams(location.search).get("room") || "";
  const [role, setRole] = useState<Role>(roomFromUrl ? "passenger" : "rider");

  const [remoteCommand, setRemoteCommand] = useState<any>(null);

  const { status: p2pStatus, handleSignal, sendP2P, createOffer } = useWebRTC({
    roomId: room?.roomId || roomFromUrl || "",
    participantId,
    isRider: role === "rider",
    onMessage: (data) => {
      console.log("[P2P] Received:", data);
      if (data.type === "SYNC_OP") {
        setRemoteCommand(data.payload);
      } else if (data.type === "FILE_SYNC") {
        handleFileSync(data.payload);
      }
    },
    sendSignal: (targetId, signalType, signal) => {
      wsSend({ type: "webrtc_signal", targetId, signalType, signal });
    }
  });

  const { sendFileSync, handleFileSync } = useFileSync(sendP2P);

  const send = useCallback((message: any) => {
    wsSend(message);
    if (p2pStatus === "connected" && ["play", "pause", "seek"].includes(message.type)) {
      const other = room?.participants.find(p => p.id !== participantId && p.connected);
      if (other) sendP2P({ type: "SYNC_OP", payload: message });
    }
  }, [p2pStatus, room, participantId, sendP2P, wsSend]);

  useEffect(() => {
    if (webrtcSignal) handleSignal(webrtcSignal.fromId, webrtcSignal.signalType, webrtcSignal.signal);
  }, [webrtcSignal, handleSignal]);

  useEffect(() => {
    if (role === "rider" && room && p2pStatus === "idle") {
      const other = room.participants.find(p => p.id !== participantId && p.connected);
      if (other) createOffer(other.id);
    }
  }, [role, room, participantId, p2pStatus, createOffer]);

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
  const [showTripSummary, setShowTripSummary] = useState(false);
  const [tripRoomId, setTripRoomId] = useState("");
  const autoJoinedRef = useRef(false);

  const self = room?.participants.find((participant) => participant.id === participantId);
  const isHost = room?.hostId === participantId || role === "rider";
  const joinUrl = room
    ? `${location.origin}/?room=${encodeURIComponent(room.roomId)}`
    : "";
  const currentPosition = room?.playback.positionMs || 0;
  const progress = durationMs ? Math.min(100, (currentPosition / durationMs) * 100) : 0;

  // Keep screen awake while in a room
  useWakeLock(!!room);

  // Auto OLED saver for Riders after 60s of inactivity
  useIdleTimer({
    timeout: 60000,
    onIdle: () => {
      setSaver(true);
      trackEvent(send, "saver_toggle", { enabled: true, auto: true });
    },
    isActive: role === "rider" && !!room && !saver
  });

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
    trackEvent(send, "room_create");
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
    trackEvent(send, "room_join", { roomCode: roomCode.trim().toUpperCase() });
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
        source: "youtube",
        sourceId,
        title: trackTitle.trim() || `YouTube ${sourceId}`,
        thumbnailUrl: thumbnailFor(sourceId)
      }
    });
    trackEvent(send, "track_add", { sourceId });
    setTrackInput("");
    setTrackTitle("");
  }

  function moveTrack(index: number, direction: "up" | "down") {
    if (!room) return;
    const newQueue = [...room.queue];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQueue.length) return;

    const temp = newQueue[index];
    newQueue[index] = newQueue[targetIndex];
    newQueue[targetIndex] = temp;

    send({
      type: "reorder_queue",
      trackIds: newQueue.map((t) => t.id)
    });
  }

  function playPause() {
    if (!room?.currentTrack) return;
    if (room.playback.isPlaying) {
      send({ type: "pause", positionMs: currentPosition });
      trackEvent(send, "playback_pause");
    } else {
      send({ type: "play", positionMs: currentPosition });
      trackEvent(send, "playback_play");
    }
  }

  function emergencyPause() {
    if (!room?.currentTrack || !room.playback.isPlaying) return;
    send({ type: "pause", positionMs: currentPosition });
    trackEvent(send, "emergency_pause");
  }

  function leaveRoom() {
    trackEvent(send, "leave_room", { roomId: room?.roomId });
    // Show trip summary instead of immediately leaving
    if (room) {
      setTripRoomId(room.roomId);
      setShowTripSummary(true);
    } else {
      localStorage.removeItem(ROOM_KEY);
      location.href = "/";
    }
  }

  function closeTripSummary() {
    setShowTripSummary(false);
    setTripRoomId("");
    localStorage.removeItem(ROOM_KEY);
    location.href = "/";
  }

  function copyInvite() {
    navigator.clipboard.writeText(joinUrl).then(() => {
      alert("คัดลอกลิงก์เชิญแล้ว!");
    }).catch(() => {
      alert("ไม่สามารถคัดลอกลิงก์ได้");
    });
  }

  if (showTripSummary && tripRoomId) {
    // Determine server base URL
    const wsUrl = import.meta.env.VITE_COVIBE_WS_URL || "";
    let serverBase: string;
    if (wsUrl) {
      serverBase = wsUrl.replace(/^ws/, "http").replace(/:\d+$/, "");
    } else {
      serverBase = `${location.protocol}//${location.hostname}:8787`;
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
        </header>
        <TripSummary roomId={tripRoomId} serverBase={serverBase} onClose={closeTripSummary} />
      </main>
    );
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
    <main className={`app-shell ${role === "rider" ? "rider-mode" : ""}`}>
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
        {p2pStatus === "connected" && (
          <div className="status-badge">
            <Wifi aria-hidden="true" />
            P2P
          </div>
        )}
      </header>

      {hostNotification && (
        <div className="host-notification">
          {hostNotification}
        </div>
      )}

      {!room ? (
        <section className="start-grid">
          <div className="setup-panel">
            <div className="section-title">
              <Bike aria-hidden="true" />
              <h2>เริ่มใช้งาน</h2>
            </div>
            <label htmlFor="display-name-input">
              ชื่อในทริป
              <input
                id="display-name-input"
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
                <label htmlFor="room-code-input">
                  รหัสห้อง
                  <input
                    id="room-code-input"
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

            {room.currentTrack?.source === "local" ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <LocalAudioPlayer
                  track={room.currentTrack}
                  remoteCommand={remoteCommand}
                  volume={volume}
                  onDuration={setDurationMs}
                />
                {role === "rider" && p2pStatus === "connected" && (
                  <button 
                    className="voice-button" 
                    style={{ background: 'rgba(120, 244, 191, 0.1)', color: '#78f4bf' }}
                    onClick={async () => {
                      const file = await getFile(room.currentTrack!.sourceId);
                      if (file) {
                        void sendFileSync(room.currentTrack!.sourceId, file.data, { 
                          hash: room.currentTrack!.sourceId, 
                          title: room.currentTrack!.title,
                          size: file.data.byteLength
                        });
                      }
                    }}
                  >
                    <RotateCw size={18} />
                    Sync เพลงไปที่เครื่องคนซ้อน
                  </button>
                )}
              </div>
            ) : (
              <YouTubeDeck
                room={room}
                role={role}
                send={send}
                volume={volume}
                mediaMode={mediaMode}
                onDuration={setDurationMs}
                remoteCommand={remoteCommand}
              />
            )}

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

            <div className="track-card" onDoubleClick={emergencyPause}>
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
              <button className="control-button" type="button" onClick={() => {
                setSaver(true);
                trackEvent(send, "saver_toggle", { enabled: true });
              }}>
                <Moon aria-hidden="true" />
                จอดำ
              </button>
            </div>

            <label htmlFor="volume-input" className="volume-control">
              <span>
                <Volume2 aria-hidden="true" />
                เสียงเครื่องนี้
              </span>
              <input
                id="volume-input"
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

            <SearchPanel
              onAddTrack={(track) => {
                send({
                  type: "add_track",
                  track: {
                    source: track.source || "youtube",
                    sourceId: track.sourceId,
                    title: track.title,
                    thumbnailUrl: track.thumbnailUrl
                  }
                });
              }}
            />

            <ChatPanel room={room} participantId={participantId} send={send} />

            <div className="add-card">
              <div className="section-title">
                <Plus aria-hidden="true" />
                <h2>เพิ่มเพลง</h2>
              </div>
              <label htmlFor="track-input">
                YouTube URL หรือ video id
                <div className="input-with-icon">
                  <LinkIcon aria-hidden="true" />
                  <input
                    id="track-input"
                    value={trackInput}
                    onChange={(event) => setTrackInput(event.target.value)}
                    placeholder="https://youtu.be/..."
                  />
                </div>
              </label>
              <label htmlFor="track-title-input">
                ชื่อเพลงที่แสดง
                <input
                  id="track-title-input"
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
                  {room.queue.map((track, index) => (
                    <li key={track.id}>
                      <img src={track.thumbnailUrl} alt="" />
                      <span>{track.title}</span>
                      <div className="item-actions">
                        <button
                          type="button"
                          aria-label="ย้ายขึ้น"
                          disabled={index === 0}
                          onClick={() => moveTrack(index, "up")}
                        >
                          <ChevronUp aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label="ย้ายลง"
                          disabled={index === room.queue.length - 1}
                          onClick={() => moveTrack(index, "down")}
                        >
                          <ChevronDown aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="remove-btn"
                          aria-label="ลบเพลงออกจากคิว"
                          onClick={() => send({ type: "remove_track", trackId: track.id })}
                        >
                          <Trash2 aria-hidden="true" />
                        </button>
                      </div>
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
