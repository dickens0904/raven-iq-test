import { describe, it, expect } from 'vitest';
import { formatTime } from '../../utils/time';

describe('formatTime', () => {
  it('formats 0 seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats seconds only', () => {
    expect(formatTime(45)).toBe('00:45');
  });

  it('formats minutes only', () => {
    expect(formatTime(60)).toBe('01:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('02:05');
  });

  it('formats large values', () => {
    expect(formatTime(3661)).toBe('61:01');
  });

  it('pads single digits', () => {
    expect(formatTime(61)).toBe('01:01');
  });
});
