import type { DeviceType } from './device';

export interface Theme {
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    correct: string;
    incorrect: string;
    warning: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    title: string;
  };
  borderRadius: string;
  shadow: string;
  mobile?: {
    minTouchTarget: string;
    optionGridCols: number;
    padding: string;
  };
  desktop?: {
    optionGridCols: number;
    maxContentWidth: string;
    sidebarWidth: string;
  };
}

const baseColors: Theme['colors'] = {
  primary: '#1a73e8',
  primaryLight: '#e8f0fe',
  secondary: '#34a853',
  background: '#ffffff',
  surface: '#f8f9fa',
  text: '#202124',
  textSecondary: '#5f6368',
  border: '#dadce0',
  correct: '#34a853',
  incorrect: '#ea4335',
  warning: '#fbbc04',
};

function getMobileTheme(): Theme {
  return {
    colors: baseColors,
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    fontSize: {
      xs: '11px',
      sm: '13px',
      md: '15px',
      lg: '17px',
      xl: '20px',
      xxl: '24px',
      title: '28px',
    },
    borderRadius: '8px',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    mobile: {
      minTouchTarget: '48px',
      optionGridCols: 2,
      padding: '16px',
    },
  };
}

function getTabletTheme(): Theme {
  return {
    colors: baseColors,
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '40px',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '22px',
      xxl: '26px',
      title: '32px',
    },
    borderRadius: '10px',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    mobile: {
      minTouchTarget: '48px',
      optionGridCols: 4,
      padding: '20px',
    },
    desktop: {
      optionGridCols: 4,
      maxContentWidth: '960px',
      sidebarWidth: '0px',
    },
  };
}

function getDesktopTheme(): Theme {
  return {
    colors: baseColors,
    spacing: {
      xs: '6px',
      sm: '12px',
      md: '20px',
      lg: '32px',
      xl: '48px',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px',
      title: '40px',
    },
    borderRadius: '12px',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    desktop: {
      optionGridCols: 6,
      maxContentWidth: '1200px',
      sidebarWidth: '240px',
    },
  };
}

export function getTheme(deviceType: DeviceType): Theme {
  switch (deviceType) {
    case 'mobile':
      return getMobileTheme();
    case 'tablet':
      return getTabletTheme();
    case 'desktop':
      return getDesktopTheme();
  }
}

function setProperty(name: string, value: string): void {
  document.documentElement.style.setProperty(name, value);
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  root.setAttribute(
    'data-device',
    theme.mobile && !theme.desktop ? 'mobile' : theme.mobile && theme.desktop ? 'tablet' : 'desktop'
  );

  setProperty('--color-primary', theme.colors.primary);
  setProperty('--color-primary-light', theme.colors.primaryLight);
  setProperty('--color-secondary', theme.colors.secondary);
  setProperty('--color-background', theme.colors.background);
  setProperty('--color-surface', theme.colors.surface);
  setProperty('--color-text', theme.colors.text);
  setProperty('--color-text-secondary', theme.colors.textSecondary);
  setProperty('--color-border', theme.colors.border);
  setProperty('--color-correct', theme.colors.correct);
  setProperty('--color-incorrect', theme.colors.incorrect);
  setProperty('--color-warning', theme.colors.warning);

  setProperty('--spacing-xs', theme.spacing.xs);
  setProperty('--spacing-sm', theme.spacing.sm);
  setProperty('--spacing-md', theme.spacing.md);
  setProperty('--spacing-lg', theme.spacing.lg);
  setProperty('--spacing-xl', theme.spacing.xl);

  setProperty('--font-size-xs', theme.fontSize.xs);
  setProperty('--font-size-sm', theme.fontSize.sm);
  setProperty('--font-size-md', theme.fontSize.md);
  setProperty('--font-size-lg', theme.fontSize.lg);
  setProperty('--font-size-xl', theme.fontSize.xl);
  setProperty('--font-size-xxl', theme.fontSize.xxl);
  setProperty('--font-size-title', theme.fontSize.title);

  setProperty('--border-radius', theme.borderRadius);
  setProperty('--shadow', theme.shadow);

  if (theme.mobile) {
    setProperty('--min-touch-target', theme.mobile.minTouchTarget);
    setProperty('--option-grid-cols', String(theme.mobile.optionGridCols));
    setProperty('--mobile-padding', theme.mobile.padding);
  }

  if (theme.desktop) {
    setProperty('--option-grid-cols', String(theme.desktop.optionGridCols));
    setProperty('--max-content-width', theme.desktop.maxContentWidth);
    setProperty('--sidebar-width', theme.desktop.sidebarWidth);
  }
}
