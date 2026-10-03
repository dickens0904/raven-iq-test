import { describe, it, expect } from 'vitest';
import { getTheme, applyTheme } from '../../utils/theme';

describe('getTheme', () => {
  it('returns mobile theme', () => {
    const theme = getTheme('mobile');
    expect(theme.mobile).toBeDefined();
    expect(theme.mobile?.optionGridCols).toBe(2);
    expect(theme.borderRadius).toBe('8px');
    expect(theme.desktop).toBeUndefined();
  });

  it('returns tablet theme', () => {
    const theme = getTheme('tablet');
    expect(theme.mobile).toBeDefined();
    expect(theme.desktop).toBeDefined();
    expect(theme.mobile?.optionGridCols).toBe(4);
    expect(theme.desktop?.optionGridCols).toBe(4);
    expect(theme.borderRadius).toBe('10px');
  });

  it('returns desktop theme', () => {
    const theme = getTheme('desktop');
    expect(theme.desktop).toBeDefined();
    expect(theme.desktop?.optionGridCols).toBe(6);
    expect(theme.desktop?.maxContentWidth).toBe('1200px');
    expect(theme.borderRadius).toBe('12px');
    expect(theme.mobile).toBeUndefined();
  });

  it('all themes share same colors', () => {
    const m = getTheme('mobile');
    const t = getTheme('tablet');
    const d = getTheme('desktop');
    expect(m.colors.primary).toBe('#1a73e8');
    expect(t.colors.primary).toBe(d.colors.primary);
  });
});

describe('applyTheme', () => {
  it('sets CSS variables on document', () => {
    const theme = getTheme('desktop');
    applyTheme(theme);
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#1a73e8');
    expect(document.documentElement.style.getPropertyValue('--border-radius')).toBe('12px');
    expect(document.documentElement.getAttribute('data-device')).toBe('desktop');
  });

  it('sets mobile-specific variables', () => {
    const theme = getTheme('mobile');
    applyTheme(theme);
    expect(document.documentElement.style.getPropertyValue('--min-touch-target')).toBe('48px');
    expect(document.documentElement.style.getPropertyValue('--option-grid-cols')).toBe('2');
  });

  it('sets desktop-specific variables', () => {
    const theme = getTheme('desktop');
    applyTheme(theme);
    expect(document.documentElement.style.getPropertyValue('--max-content-width')).toBe('1200px');
    expect(document.documentElement.style.getPropertyValue('--sidebar-width')).toBe('240px');
  });
});
