import { describe, it, expect } from 'vitest';
import { youtubeIdFromInput } from '../utils/youtube';

describe('YouTube Utility', () => {
  it('should extract ID from standard YouTube URL', () => {
    expect(youtubeIdFromInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should extract ID from short URL (youtu.be)', () => {
    expect(youtubeIdFromInput('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should extract ID from YouTube Shorts URL', () => {
    expect(youtubeIdFromInput('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should return raw ID if input is already an 11-char ID', () => {
    expect(youtubeIdFromInput('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should return null for invalid URL', () => {
    expect(youtubeIdFromInput('https://google.com')).toBe(null);
  });
});
