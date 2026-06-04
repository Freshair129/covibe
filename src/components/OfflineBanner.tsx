import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-banner">
      <WifiOff size={16} />
      <span>คุณกำลังใช้งานในโหมดออฟไลน์ (ฟีเจอร์ซิงค์บางอย่างอาจไม่ทำงาน)</span>
      
      <style>{`
        .offline-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #f59e0b;
          color: #000;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          z-index: 2000;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
