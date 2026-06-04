export type Role = "rider" | "passenger";

export type FileSyncPayload = 
  | { action: "offer"; metadata: { hash: string; title: string; size: number } }
  | { action: "chunk"; hash: string; chunk: ArrayBuffer; index: number; total: number }
  | { action: "complete"; hash: string };

export type Participant = {
  id: string;
  role: Role;
  displayName: string;
  connected: boolean;
  driftMs: number;
  latencyMs: number;
  voiceEnabled: boolean;
};

export type Track = {
  id: string;
  source: "youtube";
  sourceId: string;
  title: string;
  thumbnailUrl: string;
  durationMs: number;
  addedBy: string;
  addedAt: number;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: number;
};

export type VoiceSignal = {
  fromId: string;
  signal: {
    kind: "offer" | "answer" | "ice";
    description?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
  };
};

export type RoomState = {
  roomId: string;
  hostId: string;
  serverTime: number;
  participants: Participant[];
  currentTrack: Track | null;
  queue: Track[];
  chatMessages: ChatMessage[];
  playback: {
    isPlaying: boolean;
    positionMs: number;
    updatedAt: number;
    rate: number;
  };
};

export type ServerMessage =
  | { type: "hello"; clientId: string; serverTime: number }
  | { type: "room_created"; room: RoomState; participantId: string }
  | { type: "room_joined"; room: RoomState; participantId: string }
  | { type: "room_state"; room: RoomState }
  | { type: "chat_message"; message: ChatMessage }
  | { type: "voice_status"; participantId: string; enabled: boolean }
  | { type: "voice_signal"; fromId: string; signal: VoiceSignal["signal"] }
  | { type: "webrtc_signal"; fromId: string; signalType: string; signal: any }
  | {
      type: "sync_target";
      expectedMs: number;
      driftMs: number;
      isPlaying: boolean;
      serverTime: number;
    }
  | { type: "error"; message: string }
  | { type: "pong"; clientSentAt: number; serverTime: number }
  | { type: "host_changed"; newHostId: string; newHostName: string; reason: string }
  | { type: "telemetry_update"; telemetry: Record<string, unknown> };

export type ClientMessage = Record<string, unknown>;

export type YTPlayer = {
  cueVideoById: (id: string, startSeconds?: number) => void;
  loadVideoById: (id: string, startSeconds?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: () => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}
