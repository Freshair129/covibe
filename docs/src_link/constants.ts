export const WS_URL =
  import.meta.env.VITE_COVIBE_WS_URL ||
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:8787`;

export const PARTICIPANT_KEY = "covibe.participantId";
export const NAME_KEY = "covibe.displayName";
export const AVATAR_KEY = "covibe.avatar";
export const ROOM_KEY = "covibe.roomId";

export const AVATARS = [
  "bike", "users", "music", "headphones", "zap", "flame", "smile", "heart"
];
