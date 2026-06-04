import { useEffect, useRef, useState } from "react";
import { Track } from "../types";
import { getFile } from "../utils/db";

interface LocalAudioPlayerProps {
  track: Track;
  remoteCommand: any;
  volume: number;
  onDuration: (durationMs: number) => void;
}

export function LocalAudioPlayer({ track, remoteCommand, volume, onDuration }: LocalAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Task 4.1.2: Implement File Loading Logic
  useEffect(() => {
    let currentUrl: string | null = null;

    const handleFileLoad = async () => {
      try {
        if (!track.sourceId) return;
        const result = await getFile(track.sourceId);
        
        if (result && result.data) {
          const blob = new Blob([result.data], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);
          currentUrl = url;
          setBlobUrl(url);
          setError(null);
        } else {
          setError('ไม่พบไฟล์เพลงในเครื่อง — กำลังรอซิงค์จาก Rider...');
        }
      } catch (err) {
        setError('โหลดไฟล์เพลงไม่สำเร็จ');
        console.error(err);
      }
    };

    handleFileLoad();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [track.sourceId]);

  // Task 4.1.3: Implement Sync & Control Logic
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Handle remote commands
    if (remoteCommand) {
      const { type, positionMs } = remoteCommand;
      console.log("[LocalPlayer] Remote Command:", type, positionMs);
      
      switch (type) {
        case 'play':
          audio.play().catch(console.error);
          break;
        case 'pause':
          audio.pause();
          break;
        case 'seek':
          if (positionMs !== undefined) {
            audio.currentTime = positionMs / 1000;
          }
          break;
      }
    }
  }, [remoteCommand]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      // Convert seconds to milliseconds for the main app
      onDuration(audio.duration * 1000);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [blobUrl, onDuration]);

  return (
    <div className="local-player-shell" style={{ 
      padding: '20px', 
      background: 'rgba(120, 244, 191, 0.05)', 
      borderRadius: '12px',
      border: '1px dashed rgba(120, 244, 191, 0.3)',
      textAlign: 'center',
      marginBottom: '16px'
    }}>
      {blobUrl ? (
        <>
          <audio 
            ref={audioRef}
            src={blobUrl}
            style={{ display: 'none' }}
          />
          <div style={{ color: '#78f4bf', fontWeight: 'bold' }}>
            📁 กำลังเล่นจากไฟล์ในเครื่อง
          </div>
        </>
      ) : (
        <div className="player-loading" style={{ color: '#a8b6b0' }}>
          {error ? error : "⌛ กำลังเตรียมไฟล์เพลง..."}
        </div>
      )}
    </div>
  );
}
