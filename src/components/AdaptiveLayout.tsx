import { type ReactNode, useEffect } from 'react';
import { useDeviceType } from '../utils/device';
import { getTheme, applyTheme } from '../utils/theme';

interface AdaptiveLayoutProps {
  children: ReactNode;
}

export default function AdaptiveLayout({ children }: AdaptiveLayoutProps) {
  const deviceType = useDeviceType();

  useEffect(() => {
    const theme = getTheme(deviceType);
    applyTheme(theme);
  }, [deviceType]);

  return <div className={`layout layout--${deviceType}`}>{children}</div>;
}
