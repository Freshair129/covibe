/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { useWebRTC } from '../hooks/useWebRTC';

// Mock RTCPeerConnection globally to avoid exhaustive object loops
class MockRTCPeerConnection {
  createOffer = vi.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' });
  setLocalDescription = vi.fn().mockResolvedValue(undefined);
  createDataChannel = vi.fn().mockReturnValue({});
  close = vi.fn();
}

global.RTCPeerConnection = MockRTCPeerConnection as unknown as typeof RTCPeerConnection;

describe('useWebRTC', () => {
  const mockOptions = {
    roomId: 'TEST_ROOM',
    participantId: 'USER_1',
    isRider: true,
    onMessage: vi.fn(),
    sendSignal: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with status "idle"', () => {
    const { result } = renderHook(() => useWebRTC(mockOptions));
    expect(result.current.status).toBe('idle');
  });

  it('updates status to "connecting" when initPC is called', () => {
    const { result } = renderHook(() => useWebRTC(mockOptions));
    act(() => {
      result.current.initPC('TARGET_ID');
    });
    expect(result.current.status).toBe('connecting');
  });
});
