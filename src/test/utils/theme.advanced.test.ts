import { describe, it, expect } from 'vitest';
import { getTheme, applyTheme } from '../../utils/theme';

describe('theme advanced', () => {
  describe('complete CSS variable coverage', () => {
    const devices = ['mobile', 'tablet', 'desktop'] as const;

    for (const device of devices) {
      it(`${device}: sets all color variables`, () => {
        const theme = getTheme(device);
        applyTheme(theme);
        const vars = [
          '--color-primary',
          '--color-primary-light',
          '--color-secondary',
          '--color-background',
          '--color-surface',
          '--color-text',
          '--color-text-secondary',
          '--color-border',
          '--color-correct',
          '--color-incorrect',
          '--color-warning',
        ];
        for (const v of vars) {
          expect(document.documentElement.style.getPropertyValue(v)).toBeTruthy();
        }
      });

      it(`${device}: sets all spacing variables`, () => {
        const theme = getTheme(device);
        applyTheme(theme);
        const vars = [
          '--spacing-xs',
          '--spacing-sm',
          '--spacing-md',
          '--spacing-lg',
          '--spacing-xl',
        ];
        for (const v of vars) {
          expect(document.documentElement.style.getPropertyValue(v)).toMatch(/\d+px/);
        }
      });

      it(`${device}: sets all font size variables`, () => {
        const theme = getTheme(device);
        applyTheme(theme);
        const vars = [
          '--font-size-xs',
          '--font-size-sm',
          '--font-size-md',
          '--font-size-lg',
          '--font-size-xl',
          '--font-size-xxl',
          '--font-size-title',
        ];
        for (const v of vars) {
          expect(document.documentElement.style.getPropertyValue(v)).toMatch(/\d+px/);
        }
      });
    }
  });

  describe('device-specific options', () => {
    it('mobile: 2 option grid cols', () => {
      expect(getTheme('mobile').mobile?.optionGridCols).toBe(2);
    });

    it('tablet: 4 option grid cols', () => {
      expect(getTheme('tablet').mobile?.optionGridCols).toBe(4);
    });

    it('desktop: 6 option grid cols', () => {
      expect(getTheme('desktop').desktop?.optionGridCols).toBe(6);
    });
  });

  describe('data-device attribute', () => {
    it('sets mobile', () => {
      applyTheme(getTheme('mobile'));
      expect(document.documentElement.getAttribute('data-device')).toBe('mobile');
    });

    it('sets tablet', () => {
      applyTheme(getTheme('tablet'));
      expect(document.documentElement.getAttribute('data-device')).toBe('tablet');
    });

    it('sets desktop', () => {
      applyTheme(getTheme('desktop'));
      expect(document.documentElement.getAttribute('data-device')).toBe('desktop');
    });
  });

  describe('theme switching', () => {
    it('switching from mobile to desktop updates variables', () => {
      applyTheme(getTheme('mobile'));
      const mobileBorder = document.documentElement.style.getPropertyValue('--border-radius');
      applyTheme(getTheme('desktop'));
      const desktopBorder = document.documentElement.style.getPropertyValue('--border-radius');
      expect(mobileBorder).not.toBe(desktopBorder);
    });
  });
});
