import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResultScreen from '../../screens/ResultScreen';
import { useTestStore } from '../../stores/testStore';

describe('ResultScreen advanced', () => {
  beforeEach(() => {
    useTestStore.getState().resetTest();
  });

  describe('with completed test', () => {
    beforeEach(() => {
      useTestStore.getState().startTest(25);
      useTestStore.getState().submitTest();
    });

    it('shows IQ score as number', () => {
      render(
        <MemoryRouter>
          <ResultScreen />
        </MemoryRouter>
      );
      const scoreEl = document.querySelector('.result-card__score');
      expect(scoreEl).toBeTruthy();
      const score = parseInt(scoreEl!.textContent!);
      expect(score).toBeGreaterThanOrEqual(55);
      expect(score).toBeLessThanOrEqual(145);
    });

    it('shows IQ level text', () => {
      render(
        <MemoryRouter>
          <ResultScreen />
        </MemoryRouter>
      );
      const levelEl = document.querySelector('.result-card__level');
      expect(levelEl?.textContent).toBeTruthy();
    });

    it('shows raw score /72', () => {
      render(
        <MemoryRouter>
          <ResultScreen />
        </MemoryRouter>
      );
      expect(screen.getByText(/\/72/)).toBeTruthy();
    });

    it('shows percentile %', () => {
      render(
        <MemoryRouter>
          <ResultScreen />
        </MemoryRouter>
      );
      expect(screen.getByText(/%/)).toBeTruthy();
    });

    it('shows all 6 series', () => {
      render(
        <MemoryRouter>
          <ResultScreen />
        </MemoryRouter>
      );
      expect(screen.getByText('A 系列')).toBeTruthy();
      expect(screen.getByText('Ab 系列')).toBeTruthy();
      expect(screen.getByText('B 系列')).toBeTruthy();
      expect(screen.getByText('C 系列')).toBeTruthy();
      expect(screen.getByText('D 系列')).toBeTruthy();
      expect(screen.getByText('E 系列')).toBeTruthy();
    });

    it('auto-saves to history', () => {
      render(
        <MemoryRouter>
          <ResultScreen />
        </MemoryRouter>
      );
      expect(screen.getByText(/已保存/)).toBeTruthy();
    });

    it('save button is disabled after auto-save', () => {
      render(
        <MemoryRouter>
          <ResultScreen />
        </MemoryRouter>
      );
      const saveBtn = screen.getByText(/已保存/);
      expect(saveBtn.closest('button')?.disabled).toBe(true);
    });

    it('has retry button', () => {
      render(
        <MemoryRouter>
          <ResultScreen />
        </MemoryRouter>
      );
      expect(screen.getByText('重新测验')).toBeTruthy();
    });

    it('has PDF export button', () => {
      render(
        <MemoryRouter>
          <ResultScreen />
        </MemoryRouter>
      );
      expect(screen.getByText('导出 PDF')).toBeTruthy();
    });
  });

  describe('without test result', () => {
    it('shows empty state', () => {
      render(
        <MemoryRouter>
          <ResultScreen />
        </MemoryRouter>
      );
      expect(screen.getByText('暂无测试结果')).toBeTruthy();
    });

    it('has return home link', () => {
      render(
        <MemoryRouter>
          <ResultScreen />
        </MemoryRouter>
      );
      expect(screen.getByText('返回首页')).toBeTruthy();
    });
  });
});
