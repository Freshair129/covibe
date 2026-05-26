/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealtime } from '../hooks/useRealtime';
import { WS_URL, ROOM_KEY, NAME_KEY } from '../constants';

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  readyState = 0;
  url: string;
  onopen: () => void = () => {};
  onclose: () => void = () => {};
  _onopen: any = null;
  _onclose: any = null;
  [key: string]: any;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    setTimeout(() => {
      this.readyState = 1;
      if (this.onopen) this.onopen();
    }, 0);
  }
  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = 3;
    if (this.onclose) this.onclose();
  });

  addEventListener(type: string, listener: any) {
    if (type === 'close') {
      this._onclose = listener;
      this.onclose = () => {
        this.readyState = MockWebSocket.CLOSED;
        if (this._onclose) this._onclose();
      };
    } else if (type === 'open') {
      this._onopen = listener;
      this.onopen = () => {
        this.readyState = MockWebSocket.OPEN;
        if (this._onopen) this._onopen();
      };
    } else {
      this['on' + type] = listener;
    }
  }
  removeEventListener(type: string, listener: any) {
    if (type === 'close') {
      this._onclose = null;
      this.onclose = () => {};
    } else if (type === 'open') {
      this._onopen = null;
      this.onopen = () => {};
    } else {
      this['on' + type] = null;
    }
  }
}

vi.stubGlobal('WebSocket', MockWebSocket);
vi.stubGlobal('localStorage', {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
});

describe('useRealtime - Stability', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.instances = [];
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it('reconnects on close', async () => {
    const { result } = renderHook(() => useRealtime());
    await act(async () => { vi.runAllTimers(); });
    const ws = MockWebSocket.instances[0];
    act(() => { ws.onclose(); });
    expect(result.current.status).toBe('closed');
    await act(async () => { vi.advanceTimersByTime(1500); });
    expect(MockWebSocket.instances.length).toBe(2);
  });
  it('exponential backoff', async () => {
    renderHook(() => useRealtime());
    await act(async () => { vi.runAllTimers(); });
    act(() => MockWebSocket.instances[0].onclose());
    await act(async () => vi.advanceTimersByTime(1500));
    expect(MockWebSocket.instances.length).toBe(2);
    act(() => MockWebSocket.instances[1].onclose());
    await act(async () => vi.advanceTimersByTime(2500));
    expect(MockWebSocket.instances.length).toBe(3);
  });
  it('reconnects on visibility change', async () => {
    renderHook(() => useRealtime());
    await act(async () => { vi.runAllTimers(); });
    const ws = MockWebSocket.instances[0];
    act(() => ws.onclose());
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(MockWebSocket.instances.length).toBe(2);
  });
  it('reconnects on send() while closed', async () => {
    const { result } = renderHook(() => useRealtime());
    await act(async () => { vi.runAllTimers(); });
    act(() => MockWebSocket.instances[0].onclose());
    act(() => { result.current.send({ type: 'play' }); });
    expect(MockWebSocket.instances.length).toBe(2);
  });
});
