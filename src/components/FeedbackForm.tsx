import { Star, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface FeedbackFormProps {
  roomId: string;
  serverBase: string;
}

export function FeedbackForm({ roomId, serverBase }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (rating === 0) return;
    setLoading(true);
    try {
      const response = await fetch(`${serverBase}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          rating,
          comment,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        }),
      });
      if (response.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="feedback-success">
        <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
        <h3 className="text-white font-bold">ขอบคุณสำหรับคำแนะนำ!</h3>
        <p className="text-text-secondary text-sm">เราจะนำข้อมูลไปพัฒนา CoVibe ให้ดียิ่งขึ้น</p>
      </div>
    );
  }

  return (
    <div className="feedback-form">
      <h3 className="feedback-title">ทริปนี้เป็นอย่างไรบ้าง?</h3>
      
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${rating >= star ? "active" : ""}`}
            onClick={() => setRating(star)}
          >
            <Star fill={rating >= star ? "currentColor" : "none"} />
          </button>
        ))}
      </div>

      <textarea
        className="feedback-comment"
        placeholder="ข้อเสนอแนะเพิ่มเติม (ถ้ามี)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        className="primary-action small"
        disabled={rating === 0 || loading}
        onClick={handleSubmit}
      >
        <Send size={16} className="mr-2" />
        {loading ? "กำลังส่ง..." : "ส่งความเห็น"}
      </button>

      <style>{`
        .feedback-form {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: center;
        }
        .feedback-title {
          color: #f3f7f4;
          font-weight: 700;
          font-size: 0.95rem;
        }
        .star-rating {
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        .star-btn {
          color: rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .star-btn:hover {
          transform: scale(1.1);
          color: #fab65a;
        }
        .star-btn.active {
          color: #fab65a;
        }
        .feedback-comment {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px;
          color: white;
          font-size: 0.9rem;
          min-height: 80px;
          resize: none;
          outline: none;
        }
        .feedback-comment:focus {
          border-color: #78f4bf;
        }
        .feedback-success {
          padding: 32px 20px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
