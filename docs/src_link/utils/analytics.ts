import { ClientMessage } from "../types";

type AnalyticsEvent =
  | "session_start"
  | "room_create"
  | "room_join"
  | "track_add"
  | "track_search"
  | "playback_play"
  | "playback_pause"
  | "playback_skip"
  | "voice_toggle"
  | "saver_toggle"
  | "media_mode_change"
  | "leave_room";

type SendFn = (message: ClientMessage) => void;

/**
 * Lightweight analytics tracker that sends events through the existing WebSocket connection.
 * No external dependencies (no GA, no Mixpanel) — all data stays on the CoVibe server.
 */
export function trackEvent(
  send: SendFn,
  event: AnalyticsEvent,
  metadata?: Record<string, unknown>
) {
  try {
    send({
      type: "analytics_event",
      event,
      metadata: {
        ...metadata,
        clientTimestamp: Date.now(),
        userAgent: navigator.userAgent.slice(0, 120)
      }
    });
  } catch {
    // Silently fail — analytics should never break the app
  }
}
