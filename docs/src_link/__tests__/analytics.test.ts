/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackEvent } from "../utils/analytics";

describe("trackEvent", () => {
  let sendMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sendMock = vi.fn();
  });

  it("sends analytics event with metadata when provided", () => {
    const metadata = { customField: "value" };
    trackEvent(sendMock, "room_join", metadata);

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith({
      type: "analytics_event",
      event: "room_join",
      metadata: {
        ...metadata,
        clientTimestamp: expect.any(Number),
        userAgent: expect.any(String),
      },
    });
  });

  it("sends analytics event without metadata when not provided", () => {
    trackEvent(sendMock, "session_start");

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith({
      type: "analytics_event",
      event: "session_start",
      metadata: {
        clientTimestamp: expect.any(Number),
        userAgent: expect.any(String),
      },
    });
  });

  it("silently fails when send throws an error", () => {
    const errorMock = vi.fn().mockImplementation(() => {
      throw new Error("Network error");
    });

    expect(() => {
      trackEvent(errorMock as any, "track_add", { test: true });
    }).not.toThrow();

    expect(errorMock).toHaveBeenCalledTimes(1);
  });

  it("includes current timestamp in metadata", () => {
    const before = Date.now();
    trackEvent(sendMock, "playback_play");
    const after = Date.now();

    const call = sendMock.mock.calls[0][0];
    expect(call.metadata.clientTimestamp).toBeGreaterThanOrEqual(before);
    expect(call.metadata.clientTimestamp).toBeLessThanOrEqual(after);
  });

  it("includes user agent string in metadata", () => {
    trackEvent(sendMock, "voice_toggle");

    const call = sendMock.mock.calls[0][0];
    expect(call.metadata.userAgent).toBeDefined();
    expect(call.metadata.userAgent.length).toBeLessThanOrEqual(120);
  });
});
