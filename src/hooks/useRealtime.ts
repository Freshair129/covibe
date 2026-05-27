import { useCallback, useEffect, useRef, useState } from "react";
import { RoomState, VoiceSignal, ServerMessage, ClientMessage } from "../types";
import { WS_URL, PARTICIPANT_KEY, NAME_KEY, ROOM_KEY } from "../constants";
import { makeParticipantId } from "../utils/participant";

export function useRealtime() {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [participantId, setParticipantId] = useState(makeParticipantId);
  const [error, setError] = useState("");
  const [voiceSignal, setVoiceSignal] = useState<VoiceSignal | null>(null);
  const [hostNotification, setHostNotification] = useState("");
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
      if (message.type === "host_changed") {
        setHostNotification(`🔄 ${message.newHostName} เป็นผู้ควบคุมเพลงแล้ว`);
        // Auto-clear notification after 6 seconds
        setTimeout(() => setHostNotification(""), 6000);
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

  return { status, room, participantId, error, setError, send, voiceSignal, hostNotification };
}
