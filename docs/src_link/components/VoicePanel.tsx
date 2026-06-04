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
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
      setIsConnected(true);
      // Mute all audio tracks immediately (PTT behavior)
      localStreamRef.current?.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    } catch {
      setVoiceError("เปิดไมค์ไม่ได้ ตรวจ permission ของ browser อีกครั้ง");
    }
  }, []);

  const stopVoice = useCallback(() => {
    for (const remoteId of peersRef.current.keys()) closePeer(remoteId);
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setRemoteStreams({});
    setIsConnected(false);
    setIsSpeaking(false);
    send({ type: "voice_status", enabled: false });
  }, [closePeer, send]);

  const startSpeaking = useCallback(() => {
    if (!isConnected) return;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
    setIsSpeaking(true);
    send({ type: "voice_status", enabled: true });
  }, [isConnected, send]);

  const stopSpeaking = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    setIsSpeaking(false);
    send({ type: "voice_status", enabled: false });
  }, [send]);

  useEffect(() => {
    if (!isConnected || !room) return;
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
  }, [closePeer, createOffer, isConnected, participantId, room?.participants]);

  useEffect(() => {
    if (!isConnected || !incomingSignal) return;
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
  }, [closePeer, isConnected, incomingSignal, makePeer, send]);

  return {
    isConnected,
    isSpeaking,
    voiceError,
    remoteStreams,
    startVoice,
    stopVoice,
    startSpeaking,
    stopSpeaking
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
  const { isConnected, isSpeaking, voiceError, remoteStreams, startVoice, stopVoice, startSpeaking, stopSpeaking } =
    useVoiceChat({ room, participantId, send, incomingSignal });
  const activeCount = room.participants.filter((participant) => participant.voiceEnabled).length;

  return (
    <div className="voice-card">
      <div className="section-title">
        <Mic aria-hidden="true" />
        <h2>Voice chat</h2>
      </div>
      <div className="voice-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          className={`voice-button ${isConnected ? "active" : ""}`}
          type="button"
          onClick={isConnected ? stopVoice : startVoice}
        >
          {isConnected ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
          {isConnected ? "ตัดการเชื่อมต่อ" : "เชื่อมต่อระบบเสียง (PTT)"}
        </button>
        {isConnected && (
          <button 
            className={`ptt-button ${isSpeaking ? "speaking" : ""}`} 
            onPointerDown={startSpeaking} 
            onPointerUp={stopSpeaking} 
            onPointerLeave={stopSpeaking}
            // Prevent default context menu on long press in mobile browsers
            onContextMenu={(e) => e.preventDefault()}
          >
            <Mic aria-hidden="true" />
            {isSpeaking ? "กำลังส่งเสียง..." : "กดค้างเพื่อพูด"}
          </button>
        )}
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
