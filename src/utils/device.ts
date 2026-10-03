import { useState, useEffect, useCallback } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

export function isWindows(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    navigator.platform.toLowerCase().includes('win') ||
    navigator.userAgent.toLowerCase().includes('windows')
  );
}

export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  const touch = isTouchDevice();

  if (width < MOBILE_BREAKPOINT) {
    return 'mobile';
  }

  if (width <= TABLET_BREAKPOINT) {
    return touch ? 'tablet' : 'desktop';
  }

  return 'desktop';
}

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType);

  const handleResize = useCallback(() => {
    setDeviceType(getDeviceType());
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return deviceType;
}
