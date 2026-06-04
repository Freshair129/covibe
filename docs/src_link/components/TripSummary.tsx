import { useEffect, useState } from "react";
import { Music2, Clock, Users, BarChart3, Home, RotateCw } from "lucide-react";
import { FeedbackForm } from "./FeedbackForm";

type TripSummaryData = {
  roomId: string;
  createdAt: number;
  duration: number;
  participantCount: number;
  participants: { displayName: string; role: string; connected: boolean }[];
  totalTracksPlayed: number;
  totalTracksAdded: number;
  currentTrack: { title: string; thumbnailUrl: string } | null;
  queueRemaining: number;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function TripSummary({
  roomId,
  serverBase,
  onClose
}: {
  roomId: string;
  serverBase: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<TripSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${serverBase}/api/trip-summary/${roomId}`)
      .then((res) => {
        if (!res.ok) throw new Error("ไม่พบข้อมูลทริป");
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [roomId, serverBase]);

  if (loading) {
    return (
      <div className="trip-summary">
        <div className="trip-summary-loading">
          <RotateCw className="spin" />
          <span>กำลังโหลดสรุปทริป...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="trip-summary">
        <div className="trip-summary-error">
          <p className="error-line">{error || "ไม่สามารถโหลดข้อมูลทริปได้"}</p>
          <button className="primary-action small" type="button" onClick={onClose}>
            <Home aria-hidden="true" />
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-summary">
      <div className="trip-summary-header">
        <Music2 />
        <h2>สรุปทริป</h2>
        <span className="trip-room-badge">ห้อง {data.roomId}</span>
      </div>

      <div className="trip-stats-grid">
        <div className="trip-stat-card">
          <Music2 />
          <div className="trip-stat-value">{data.totalTracksPlayed}</div>
          <div className="trip-stat-label">เพลงที่เล่น</div>
        </div>
        <div className="trip-stat-card">
          <BarChart3 />
          <div className="trip-stat-value">{data.totalTracksAdded}</div>
          <div className="trip-stat-label">เพลงที่เพิ่ม</div>
        </div>
        <div className="trip-stat-card">
          <Clock />
          <div className="trip-stat-value">{formatDuration(data.duration)}</div>
          <div className="trip-stat-label">ระยะเวลาทริป</div>
        </div>
        <div className="trip-stat-card">
          <Users />
          <div className="trip-stat-value">{data.participantCount}</div>
          <div className="trip-stat-label">ผู้ร่วมทริป</div>
        </div>
      </div>

      <div className="trip-participants">
        <h3>ผู้ร่วมทริป</h3>
        <div className="trip-participant-list">
          {data.participants.map((p, i) => (
            <div key={i} className="trip-participant">
              <span className={`dot ${p.connected ? "on" : ""}`} />
              <strong>{p.displayName}</strong>
              <small>{p.role === "rider" ? "คนขับ" : "คนซ้อน"}</small>
            </div>
          ))}
        </div>
      </div>

      <FeedbackForm roomId={data.roomId} serverBase={serverBase} />

      <button className="primary-action" type="button" onClick={onClose}>
        <Home aria-hidden="true" />
        กลับหน้าหลัก
      </button>
    </div>
  );
}
