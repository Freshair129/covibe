import { useState } from "react";
import { Search, Plus, Music2, RotateCw, AlertTriangle, Upload } from "lucide-react";
import { Track } from "../types";
import { saveFile } from "../utils/db";

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

  const handleLocalFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result as ArrayBuffer;
        const hash = `${file.name}-${file.size}`;
        await saveFile(hash, data, { title: file.name });
        onAddTrack({
          id: hash,
          source: 'youtube', // keep existing type, but ID is hash
          sourceId: hash,
          title: file.name,
          thumbnailUrl: '',
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("File upload error:", error);
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

      <div className="local-upload" style={{ marginTop: '16px' }}>
        <label className="voice-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Upload size={18} />
          อัปโหลดไฟล์ MP3
          <input
            type="file"
            accept=".mp3"
            onChange={handleLocalFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

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
          </div>
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
      `}</style>
    </div>
  );
}
