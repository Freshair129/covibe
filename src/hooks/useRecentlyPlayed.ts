import { useState, useCallback } from 'react';
import { Track } from '../types';

const HISTORY_KEY = 'covibe_recent_tracks';
const MAX_HISTORY = 20;

export function useRecentlyPlayed() {
  const [history, setHistory] = useState<Partial<Track>[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const saveTrack = useCallback((track: Partial<Track>) => {
    if (!track.sourceId) return;

    setHistory((prev) => {
      // Deduplicate: Remove if exists
      const filtered = prev.filter((t) => t.sourceId !== track.sourceId);
      // Add to top and limit to MAX_HISTORY
      const next = [track, ...filtered].slice(0, MAX_HISTORY);
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  return { history, saveTrack, clearHistory };
}
