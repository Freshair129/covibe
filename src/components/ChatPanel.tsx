import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { RoomState, ClientMessage } from "../types";

export function ChatPanel({
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
