import { describe, it, expect } from 'vitest';
import { formatTime } from '../utils/time';

describe('formatTime', () => {
  it('formats 0 milliseconds as "0:00"', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats 1 millisecond as "0:00"', () => {
    expect(formatTime(1)).toBe('0:00');
  });

  it('formats 500 milliseconds as "0:00"', () => {
    expect(formatTime(500)).toBe('0:00');
  });

  it('formats 1000 milliseconds (1 second) as "0:01"', () => {
    expect(formatTime(1000)).toBe('0:01');
  });

  it('formats 59999 milliseconds as "0:59"', () => {
    expect(formatTime(59999)).toBe('0:59');
  });

  it('formats 60000 milliseconds (1 minute) as "1:00"', () => {
    expect(formatTime(60000)).toBe('1:00');
  });

  it('formats 60001 milliseconds as "1:00"', () => {
    expect(formatTime(60001)).toBe('1:00');
  });

  it('formats 3600000 milliseconds (1 hour) as "60:00"', () => {
    expect(formatTime(3600000)).toBe('60:00');
  });

  it('formats 3661000 milliseconds as "61:01"', () => {
    expect(formatTime(3661000)).toBe('61:01');
  });

  it('formats 100000000 milliseconds as "1666:40"', () => {
    expect(formatTime(100000000)).toBe('1666:40');
  });

  it('handles negative milliseconds by treating as 0', () => {
    expect(formatTime(-1)).toBe('0:00');
    expect(formatTime(-1000)).toBe('0:00');
    expect(formatTime(-3600000)).toBe('0:00');
  });

  it('handles very large milliseconds', () => {
    expect(formatTime(86400000)).toBe('1440:00'); // 24 hours
    expect(formatTime(10000000000)).toBe('166666:40');
  });

  it('handles very small positive milliseconds', () => {
    expect(formatTime(0.1)).toBe('0:00');
    expect(formatTime(0.001)).toBe('0:00');
  });

  it('handles floating point milliseconds', () => {
    expect(formatTime(1000.5)).toBe('0:01');
    expect(formatTime(60000.999)).toBe('1:00');
  });

  it('returns formatted string with a colon and minutes/seconds', () => {
    const result = formatTime(123456789);
    expect(result).toMatch(/^\d+:\d{2}$/);
  });

  it('seconds are always zero-padded to 2 digits', () => {
    expect(formatTime(1000)).toBe('0:01');
    expect(formatTime(10000)).toBe('0:10');
    expect(formatTime(100000)).toBe('1:40');
  });

  it('minutes are not zero-padded (can be > 99)', () => {
    expect(formatTime(60000)).toBe('1:00');
    expect(formatTime(3600000)).toBe('60:00');
    expect(formatTime(100000000)).toBe('1666:40');
  });
});
