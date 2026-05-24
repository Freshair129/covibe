import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { RoomState, VoiceSignal, ClientMessage } from "../types";

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

export function VoicePanel({
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
