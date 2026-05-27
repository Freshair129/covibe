import { useState } from "react";
import { Search, Plus, Music2, RotateCw, AlertTriangle } from "lucide-react";
import { Track } from "../types";

interface SearchPanelProps {
  onAddTrack: (track: Partial<Track>) => void;
}

function formatDurationMs(ms: number) {
  if (!ms) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SearchPanel({ onAddTrack }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Partial<Track & { channelTitle?: string }>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [noApiKey, setNoApiKey] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setSearchError("");
    setNoApiKey(false);

    try {
      // Determine server base URL (same origin as WS, but HTTP)
      const wsUrl = import.meta.env.VITE_COVIBE_WS_URL || "";
      let serverBase: string;
      if (wsUrl) {
        serverBase = wsUrl.replace(/^ws/, "http").replace(/:\d+$/, "");
      } else {
        serverBase = `${location.protocol}//${location.hostname}:8787`;
      }

      const res = await fetch(`${serverBase}/api/youtube-search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.error) {
        setSearchError(data.message || data.error);
        setResults([]);
        return;
      }

      if (data.source === "fallback") {
        setNoApiKey(true);
        setResults([]);
        return;
      }

      setResults(data.results || []);
    } catch (err) {
      setSearchError("ไม่สามารถค้นหาได้ — ตรวจสอบว่า server ทำงานอยู่");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="search-card">
      <div className="section-title">
        <Search aria-hidden="true" />
        <h2>ค้นหาเพลง YouTube</h2>
      </div>
      
      <form className="chat-compose" onSubmit={handleSearch}>
        <div className="input-with-icon" style={{ flex: 1 }}>
          <Music2 size={18} aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาเพลง..."
          />
        </div>
        <button type="submit" disabled={isSearching} aria-label="ค้นหา">
          {isSearching ? <RotateCw className="spin" size={20} /> : <Search size={20} />}
        </button>
      </form>

      <div className="search-results-container" style={{ marginTop: '16px', maxHeight: '360px', overflowY: 'auto' }}>
        {searchError && (
          <div className="search-error-msg">
            <AlertTriangle size={16} />
            <span>{searchError}</span>
          </div>
        )}

        {noApiKey && (
          <div className="search-no-api">
            <AlertTriangle size={18} />
            <p>YouTube API key ยังไม่ได้ตั้งค่า</p>
            <small className="muted">ใช้ช่อง "เพิ่มเพลง" ด้านล่างพร้อมวาง YouTube URL แทนได้เลย</small>
          </div>
        )}

        {results.length === 0 && !isSearching && hasSearched && !searchError && !noApiKey && (
          <p className="muted" style={{ textAlign: 'center', padding: '20px' }}>
            ไม่พบผลลัพธ์ที่ตรงกัน
          </p>
        )}
        
        {results.length > 0 && (
          <ul className="queue-list">
            {results.map((track) => (
              <li key={track.sourceId} className="search-result-item">
                <img src={track.thumbnailUrl} alt={track.title} />
                <div className="search-result-info">
                  <span className="search-result-title" title={track.title}>{track.title}</span>
                  <small className="search-result-meta">
                    {(track as { channelTitle?: string }).channelTitle || ""}
                    {track.durationMs ? ` · ${formatDurationMs(track.durationMs)}` : ""}
                  </small>
                </div>
                <div className="item-actions">
                  <button 
                    type="button"
                    onClick={() => onAddTrack(track)}
                    aria-label="เพิ่มลงคิว"
                    title="เพิ่มลงคิว"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!hasSearched && (
          <div className="empty-track" style={{ borderStyle: 'none', minHeight: '120px' }}>
            <Music2 size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <span className="muted">ค้นหาเพลงที่คุณชอบเพื่อเพิ่มลงคิว</span>
          </div>
        )}
      </div>

      <style>{`
        .search-results-container::-webkit-scrollbar {
          width: 4px;
        }
        .search-results-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .search-results-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .search-results-container::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 244, 191, 0.3);
        }
        .spin {
          animation: spin-loader 1.2s linear infinite;
        }
        .search-result-item {
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 8px 0;
        }
        .search-result-info {
          display: grid;
          gap: 2px;
          min-width: 0;
        }
        .search-result-title {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .search-result-meta {
          color: #a8b6b0;
          font-size: 0.8rem;
        }
        .search-error-msg {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.1);
          color: #ffaaa3;
          font-size: 0.88rem;
        }
        .search-no-api {
          display: grid;
          place-items: center;
          gap: 8px;
          padding: 20px 16px;
          text-align: center;
          color: #f5ca78;
        }
        .search-no-api p {
          font-weight: 700;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
