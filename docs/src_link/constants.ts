export const WS_URL =
  import.meta.env.VITE_COVIBE_WS_URL ||
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:8787`;

export const PARTICIPANT_KEY = "covibe.participantId";
export const NAME_KEY = "covibe.displayName";
export const ROOM_KEY = "covibe.roomId";
