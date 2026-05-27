/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadYouTubeApi } from '../utils/youtube-api';

describe('loadYouTubeApi', () => {
  beforeEach(() => {
    vi.stubGlobal('YT', undefined);
    vi.stubGlobal('onYouTubeIframeAPIReady', undefined);
    
    // Spy on DOM methods
    vi.spyOn(document, 'querySelector');
    vi.spyOn(document, 'createElement');
    vi.spyOn(document.body, 'appendChild');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should resolve immediately if window.YT.Player exists', async () => {
    vi.stubGlobal('YT', { Player: {} });
    await loadYouTubeApi();
    expect(document.querySelector).not.toHaveBeenCalled();
  });

  it('should not append script if script already exists in document', async () => {
    const mockScript = document.createElement('script');
    mockScript.src = 'https://www.youtube.com/iframe_api';
    vi.mocked(document.createElement).mockClear();
    vi.spyOn(document, 'querySelector').mockReturnValue(mockScript);

    // Call loadYouTubeApi, and simulate API ready callback
    const promise = loadYouTubeApi();
    if (window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady();
    }
    await promise;

    expect(document.createElement).not.toHaveBeenCalled();
  });

  it('should append script if script does not exist', async () => {
    vi.spyOn(document, 'querySelector').mockReturnValue(null);
    
    const promise = loadYouTubeApi();
    if (window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady();
    }
    await promise;

    expect(document.createElement).toHaveBeenCalledWith('script');
    expect(document.body.appendChild).toHaveBeenCalled();
  });
});
