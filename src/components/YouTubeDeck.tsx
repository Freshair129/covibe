import { useEffect, useRef, useState } from "react";
import { Headphones, Music2, RotateCw } from "lucide-react";
import { RoomState, Role, ClientMessage, YTPlayer } from "../types";
import { loadYouTubeApi } from "../utils/youtube-api";
import { calculateSyncAction } from "../utils/sync";
import { calculateEffectiveVolume, checkIsDucking } from "../utils/audio";

export function YouTubeDeck({
  room,
  role,
  send,
  volume,
  mediaMode,
  onDuration
}: {
  room: RoomState | null;
  role: Role;
  send: (message: ClientMessage) => void;
  volume: number;
  mediaMode: "music" | "video";
  onDuration: (durationMs: number) => void;
}) {
  const playerARef = useRef<YTPlayer | null>(null);
  const playerBRef = useRef<YTPlayer | null>(null);
  const [activeDeck, setActiveDeck] = useState<"A" | "B">("A");
  const activeTrackRef = useRef<string | null>(null);
  const [readyA, setReadyA] = useState(false);
  const [readyB, setReadyB] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(true);
  const [playerStateA, setPlayerStateA] = useState("idle");
  const [playerStateB, setPlayerStateB] = useState("idle");
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [crossfadeState, setCrossfadeState] = useState<{
    inProgress: boolean;
    fadingTo: string | null;
  }>({ inProgress: false, fadingTo: null });

  const activePlayer = activeDeck === "A" ? playerARef.current : playerBRef.current;
  const idlePlayer = activeDeck === "A" ? playerBRef.current : playerARef.current;
  const activePlayerState = activeDeck === "A" ? playerStateA : playerStateB;
  const ready = activeDeck === "A" ? readyA : readyB;

  // Audio Ducking Logic
  const isDucking = checkIsDucking(room?.participants);
  const effectiveVolume = calculateEffectiveVolume(volume, isDucking);

  // Slow network detection
  useEffect(() => {
    if (activePlayerState === "buffering") {
      const timer = window.setTimeout(() => setIsSlowNetwork(true), 5000);
      return () => window.clearTimeout(timer);
    } else {
      setIsSlowNetwork(false);
    }
  }, [activePlayerState]);

  // Initialization
  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT) return;

      const sharedVars = {
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        controls: 0,
        disablekb: 1
      };

      playerARef.current = new window.YT.Player("covibe-yt-player-a", {
        playerVars: sharedVars,
        events: {
          onReady: () => setReadyA(true),
          onStateChange: (event) => {
            const states = window.YT?.PlayerState;
            if (!states) return;
            if (activeDeck === "A") {
              if (event.data === states.ENDED && role === "rider") send({ type: "skip" });
              if (event.data === states.PLAYING) setPlayerStateA("playing");
              if (event.data === states.PAUSED) setPlayerStateA("paused");
              if (event.data === states.BUFFERING) setPlayerStateA("buffering");
            }
          }
        }
      });

      playerBRef.current = new window.YT.Player("covibe-yt-player-b", {
        playerVars: sharedVars,
        events: {
          onReady: () => setReadyB(true),
          onStateChange: (event) => {
            const states = window.YT?.PlayerState;
            if (!states) return;
            if (activeDeck === "B") {
              if (event.data === states.ENDED && role === "rider") send({ type: "skip" });
              if (event.data === states.PLAYING) setPlayerStateB("playing");
              if (event.data === states.PAUSED) setPlayerStateB("paused");
              if (event.data === states.BUFFERING) setPlayerStateB("buffering");
            }
          }
        }
      });
    });

    return () => {
      cancelled = true;
      playerARef.current?.destroy();
      playerBRef.current?.destroy();
    };
  }, [role, send, activeDeck]); // Re-bind events when activeDeck changes

  // Global Volume & Mute for Idle
  useEffect(() => {
    if (readyA) playerARef.current?.setVolume(activeDeck === "A" ? effectiveVolume : 0);
    if (readyB) playerBRef.current?.setVolume(activeDeck === "B" ? effectiveVolume : 0);
  }, [effectiveVolume, activeDeck, readyA, readyB]);

  // Main Sync Logic
  useEffect(() => {
    const track = room?.currentTrack;
    if (!ready || !activePlayer || !track) return;

    const expectedSeconds = Math.max(0, room.playback.positionMs / 1000);
    
    // Track Change
    if (activeTrackRef.current !== track.id) {
      activeTrackRef.current = track.id;
      setCrossfadeState({ inProgress: false, fadingTo: null });
      
      if (room.playback.isPlaying) {
        activePlayer.loadVideoById(track.sourceId, expectedSeconds);
      } else {
        activePlayer.cueVideoById(track.sourceId, expectedSeconds);
      }
      return;
    }

    // Sync Position
    const actualSeconds = activePlayer.getCurrentTime?.() || 0;
    const action = calculateSyncAction(actualSeconds, expectedSeconds);

    if (action.type === "seek") {
      activePlayer.seekTo(action.positionSeconds, true);
    } else if (action.type === "adjust_rate" && room.playback.isPlaying) {
      activePlayer.setPlaybackRate(action.rate);
      window.setTimeout(() => activePlayer.setPlaybackRate(1), 1200);
    }

    // Play/Pause state
    const states = window.YT?.PlayerState;
    if (room.playback.isPlaying && states && activePlayer.getPlayerState() !== states.PLAYING) {
      try {
        activePlayer.playVideo();
        setNeedsUnlock(false);
      } catch {
        setNeedsUnlock(true);
      }
    }
    if (!room.playback.isPlaying && states && activePlayer.getPlayerState() === states.PLAYING) {
      activePlayer.pauseVideo();
    }
  }, [ready, room?.currentTrack?.id, room?.playback.isPlaying, room?.playback.positionMs, activeDeck]);

  // Crossfade Trigger Logic
  useEffect(() => {
    const track = room?.currentTrack;
    const nextTrack = room?.queue[0];
    if (!activePlayer || !idlePlayer || !track || !nextTrack || crossfadeState.inProgress) return;

    const interval = window.setInterval(() => {
      const currentTime = activePlayer.getCurrentTime();
      const duration = activePlayer.getDuration();
      
      if (duration > 0 && duration - currentTime <= 10) {
        // Start Crossfade
        setCrossfadeState({ inProgress: true, fadingTo: nextTrack.id });
        
        // Prepare idle player
        idlePlayer.loadVideoById(nextTrack.sourceId, 0);
        idlePlayer.setVolume(0);
        idlePlayer.playVideo();

        // Fade logic
        let step = 0;
        const fadeInterval = window.setInterval(() => {
          step++;
          const progress = step / 100; // 100 steps over 5-10 seconds? No, let's do 10 steps.
          
          const fadeOutVol = Math.max(0, effectiveVolume * (1 - progress));
          const fadeInVol = Math.min(effectiveVolume, effectiveVolume * progress);
          
          activePlayer.setVolume(fadeOutVol);
          idlePlayer.setVolume(fadeInVol);

          if (step >= 100) {
            window.clearInterval(fadeInterval);
          }
        }, 100); // 10 seconds = 100 steps of 100ms
        
        // After 10s, switch decks
        window.setTimeout(() => {
          setActiveDeck(activeDeck === "A" ? "B" : "A");
          if (role === "rider") send({ type: "skip" });
        }, 10000);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [room?.currentTrack?.id, room?.queue?.length, crossfadeState.inProgress, activeDeck, effectiveVolume]);

  // Sync Reporting
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!activePlayer || !room?.currentTrack) return;
      const duration = activePlayer.getDuration?.() || 0;
      if (duration > 0) onDuration(duration * 1000);
      send({
        type: "sync_report",
        positionMs: activePlayer.getCurrentTime() * 1000,
        clientSentAt: Date.now()
      });
    }, 3000);
    return () => window.clearInterval(interval);
  }, [room?.currentTrack?.id, activeDeck, send, onDuration]);

  function unlockPlayback() {
    if (activePlayer) {
      activePlayer.setVolume(effectiveVolume);
      if (room?.playback.isPlaying) activePlayer.playVideo();
      setNeedsUnlock(false);
    }
  }

  return (
    <section className="player-shell" aria-label="เครื่องเล่นเพลง">
      <div className={`video-frame ${mediaMode === "music" ? "music-frame" : ""}`}>
        <div id="covibe-yt-player-a" style={{ display: activeDeck === "A" ? "block" : "none" }} />
        <div id="covibe-yt-player-b" style={{ display: activeDeck === "B" ? "block" : "none" }} />
        
        {mediaMode === "music" && room?.currentTrack && (
          <div className="music-layer" aria-hidden="true">
            <img src={room.currentTrack.thumbnailUrl} alt="" />
            <div>
              <Music2 />
              <span>Music mode</span>
            </div>
          </div>
        )}
        
        {(!room?.currentTrack || needsUnlock) && (
          <button className="unlock-layer" type="button" onClick={unlockPlayback}>
            <Headphones aria-hidden="true" />
            <span>{room?.currentTrack ? "แตะเพื่อเปิดเสียงบนเครื่องนี้" : "รอเพลงแรก"}</span>
          </button>
        )}
        
        {activePlayerState === "buffering" && (
          <div className={`buffer-layer ${isSlowNetwork ? "slow-network" : ""}`} aria-hidden="true">
            <RotateCw className="spin" />
            <span>
              {isSlowNetwork
                ? "สัญญาณอินเทอร์เน็ตอ่อน... กำลังพยายามเชื่อมต่อใหม่"
                : "กำลังโหลดเพลง..."}
            </span>
          </div>
        )}
      </div>
      <div className="player-status">
        <span>{ready ? `Deck ${activeDeck} Ready` : "กำลังโหลด player"}</span>
        <span>{activePlayerState}</span>
      </div>
    </section>
  );
}
