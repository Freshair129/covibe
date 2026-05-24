import { describe, it, expect } from 'vitest';
import { calculateSyncAction } from '../utils/sync';

describe('Sync Logic Utility', () => {
  it('should ignore drift less than 0.25s', () => {
    expect(calculateSyncAction(10.1, 10.0)).toEqual({ type: 'ignore' });
    expect(calculateSyncAction(9.9, 10.0)).toEqual({ type: 'ignore' });
  });

  it('should adjust rate to 0.95 when ahead by 0.25s to 0.8s', () => {
    expect(calculateSyncAction(10.3, 10.0)).toEqual({ type: 'adjust_rate', rate: 0.95 });
    expect(calculateSyncAction(10.7, 10.0)).toEqual({ type: 'adjust_rate', rate: 0.95 });
  });

  it('should adjust rate to 1.05 when behind by 0.25s to 0.8s', () => {
    expect(calculateSyncAction(9.7, 10.0)).toEqual({ type: 'adjust_rate', rate: 1.05 });
    expect(calculateSyncAction(9.3, 10.0)).toEqual({ type: 'adjust_rate', rate: 1.05 });
  });

  it('should seek when drift is more than 0.8s', () => {
    expect(calculateSyncAction(11.0, 10.0)).toEqual({ type: 'seek', positionSeconds: 10.0 });
    expect(calculateSyncAction(9.0, 10.0)).toEqual({ type: 'seek', positionSeconds: 10.0 });
  });

  describe('Boundary & Edge Cases (from Local Qwen)', () => {
    it('should ignore exactly 0.25s drift', () => {
      // 0.25 is not > 0.25, so ignore
      expect(calculateSyncAction(10.25, 10.0)).toEqual({ type: 'ignore' });
    });

    it('should adjust rate at slightly above 0.25s', () => {
      expect(calculateSyncAction(10.26, 10.0)).toEqual({ type: 'adjust_rate', rate: 0.95 });
      expect(calculateSyncAction(9.74, 10.0)).toEqual({ type: 'adjust_rate', rate: 1.05 });
    });

    it('should seek at exactly 0.81s drift', () => {
      expect(calculateSyncAction(10.81, 10.0)).toEqual({ type: 'seek', positionSeconds: 10.0 });
    });

    it('should return ignore for perfect sync', () => {
      expect(calculateSyncAction(10.0, 10.0)).toEqual({ type: 'ignore' });
    });
  });
});
