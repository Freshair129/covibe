import { describe, it, expect } from 'vitest';
import { checkIsDucking, calculateEffectiveVolume } from '../utils/audio';

describe('Audio Utilities', () => {
  describe('checkIsDucking', () => {
    it('should return false if participants list is undefined', () => {
      expect(checkIsDucking(undefined)).toBe(false);
    });

    it('should return false if participants list is empty', () => {
      expect(checkIsDucking([])).toBe(false);
    });

    it('should return false if no one has voiceEnabled: true', () => {
      const participants = [
        { voiceEnabled: false },
        { voiceEnabled: false }
      ];
      expect(checkIsDucking(participants)).toBe(false);
    });

    it('should return true if at least one participant has voiceEnabled: true', () => {
      const participants = [
        { voiceEnabled: false },
        { voiceEnabled: true }
      ];
      expect(checkIsDucking(participants)).toBe(true);
    });
  });

  describe('calculateEffectiveVolume', () => {
    it('should return full baseVolume if isDucking is false', () => {
      expect(calculateEffectiveVolume(100, false)).toBe(100);
      expect(calculateEffectiveVolume(50, false)).toBe(50);
    });

    it('should return baseVolume * 0.3 if isDucking is true', () => {
      expect(calculateEffectiveVolume(100, true)).toBe(30);
      expect(calculateEffectiveVolume(50, true)).toBe(15);
    });

    it('should return 0 if baseVolume is 0 regardless of ducking', () => {
      expect(calculateEffectiveVolume(0, false)).toBe(0);
      expect(calculateEffectiveVolume(0, true)).toBe(0);
    });
  });
});
