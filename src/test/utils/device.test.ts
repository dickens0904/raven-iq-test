import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('getDeviceType', () => {
  it('returns desktop for wide viewport', async () => {
    const { getDeviceType } = await import('../../utils/device');
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
    expect(getDeviceType()).toBe('desktop');
  });

  it('returns mobile for narrow viewport', async () => {
    const { getDeviceType } = await import('../../utils/device');
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
    expect(getDeviceType()).toBe('mobile');
  });

  it('returns tablet for medium viewport with touch', async () => {
    const { getDeviceType } = await import('../../utils/device');
    Object.defineProperty(window, 'innerWidth', { value: 900, configurable: true });
    Object.defineProperty(window, 'ontouchstart', { value: {}, configurable: true });
    expect(getDeviceType()).toBe('tablet');
  });

  // Note: jsdom's Window prototype always has ontouchstart, so we cannot
  // reliably test "desktop for medium viewport without touch" in jsdom.
  // This scenario is covered by the browser automation test (Playwright).
});

describe('isWindows', () => {
  it('detects Windows platform', async () => {
    const { isWindows } = await import('../../utils/device');
    Object.defineProperty(navigator, 'platform', { value: 'Win32', configurable: true });
    expect(isWindows()).toBe(true);
  });

  it('returns false for non-Windows', async () => {
    const { isWindows } = await import('../../utils/device');
    Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true });
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      configurable: true,
    });
    expect(isWindows()).toBe(false);
  });
});
