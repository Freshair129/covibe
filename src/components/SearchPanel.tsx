import { useState } from "react";
import { Search, Plus, Music2, RotateCw } from "lucide-react";
import { Track } from "../types";

interface SearchPanelProps {
  onAddTrack: (track: Partial<Track>) => void;
}

const MOCK_RESULTS: Partial<Track>[] = [
  {
    source: "youtube",
    sourceId: "dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    durationMs: 212000,
  },
  {
    source: "youtube",
    sourceId: "kJQP7kiw5Fk",
    title: "Luis Fonsi - Despacito ft. Daddy Yankee",
    thumbnailUrl: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
    durationMs: 282000,
  },
  {
    source: "youtube",
    sourceId: "9bZkp7q19f0",
    title: "PSY - GANGNAM STYLE(강남스타일) M/V",
    thumbnailUrl: "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg",
    durationMs: 252000,
  },
  {
    source: "youtube",
    sourceId: "y6120QOlsfU",
    title: "Darude - Sandstorm",
    thumbnailUrl: "https://i.ytimg.com/vi/y6120QOlsfU/hqdefault.jpg",
    durationMs: 232000,
  },
  {
    source: "youtube",
    sourceId: "fJ9rUzIMcZQ",
    title: "Queen – Bohemian Rhapsody (Official Video Remastered)",
    thumbnailUrl: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg",
    durationMs: 359000,
  }
];

export function SearchPanel({ onAddTrack }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Partial<Track>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate API delay
    setTimeout(() => {
      const filtered = MOCK_RESULTS.filter(r => 
        r.title?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsSearching(false);
    }, 600);
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
            placeholder="ลองพิมพ์ 'Rick' หรือ 'Queen'..."
          />
        </div>
        <button type="submit" disabled={isSearching} aria-label="ค้นหา">
          {isSearching ? <RotateCw className="spin" size={20} /> : <Search size={20} />}
        </button>
      </form>

      <div className="search-results-container" style={{ marginTop: '16px', maxHeight: '320px', overflowY: 'auto' }}>
        {results.length === 0 && !isSearching && hasSearched && (
          <p className="muted" style={{ textAlign: 'center', padding: '20px' }}>
            ไม่พบผลลัพธ์ที่ตรงกัน
          </p>
        )}
        
        {results.length > 0 && (
          <ul className="queue-list">
            {results.map((track) => (
              <li key={track.sourceId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '8px 0' }}>
                <img src={track.thumbnailUrl} alt={track.title} />
                <span title={track.title} style={{ fontWeight: 500 }}>{track.title}</span>
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
      `}</style>
    </div>
  );
}
