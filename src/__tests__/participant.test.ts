/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { makeParticipantId } from "../utils/participant";
import { PARTICIPANT_KEY } from "../constants";

describe("makeParticipantId", () => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
  };

  const mockCrypto = {
    randomUUID: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("localStorage", mockLocalStorage);
    vi.stubGlobal("crypto", mockCrypto);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return existing participant ID if it exists in localStorage", () => {
    const existingId = "existing-uuid-123";
    mockLocalStorage.getItem.mockReturnValue(existingId);

    const result = makeParticipantId();

    expect(result).toBe(existingId);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(PARTICIPANT_KEY);
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it("should generate new UUID and store it when no existing ID exists", () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const expectedNewId = "new-uuid-456";
    mockCrypto.randomUUID.mockReturnValue(expectedNewId);

    const result = makeParticipantId();

    expect(result).toBe(expectedNewId);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(PARTICIPANT_KEY);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(PARTICIPANT_KEY, expectedNewId);
  });

  it("should handle localStorage returning empty string by generating new ID", () => {
    mockLocalStorage.getItem.mockReturnValue("");
    const expectedNewId = "new-uuid-789";
    mockCrypto.randomUUID.mockReturnValue(expectedNewId);

    const result = makeParticipantId();

    expect(result).toBe(expectedNewId);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(PARTICIPANT_KEY, expectedNewId);
  });

  it("should handle localStorage returning null by generating new ID", () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const expectedNewId = "new-uuid-abc";
    mockCrypto.randomUUID.mockReturnValue(expectedNewId);

    const result = makeParticipantId();

    expect(result).toBe(expectedNewId);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(PARTICIPANT_KEY, expectedNewId);
  });

  it("should handle localStorage returning non-string truthy value directly", () => {
    mockLocalStorage.getItem.mockReturnValue(123 as any);

    const result = makeParticipantId();

    expect(result).toBe(123 as any);
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it("should generate different UUIDs when localStorage is empty each time", () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    let counter = 0;
    mockCrypto.randomUUID.mockImplementation(() => `uuid-${counter++}`);

    const id1 = makeParticipantId();
    const id2 = makeParticipantId();

    expect(id1).not.toBe(id2);
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
  });

  it("should handle localStorage.setItem throwing an error", () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockCrypto.randomUUID.mockReturnValue("new-uuid-error");
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error("Storage quota exceeded");
    });

    expect(() => makeParticipantId()).toThrow("Storage quota exceeded");
  });

  it("should handle localStorage.getItem throwing an error", () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error("Storage access denied");
    });

    expect(() => makeParticipantId()).toThrow("Storage access denied");
  });

  it("should handle crypto.randomUUID throwing an error", () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockCrypto.randomUUID.mockImplementation(() => {
      throw new Error("Crypto not available");
    });

    expect(() => makeParticipantId()).toThrow("Crypto not available");
  });
});
