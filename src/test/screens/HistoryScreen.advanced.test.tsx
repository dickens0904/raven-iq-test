import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HistoryScreen from '../../screens/HistoryScreen';
import { useHistoryStore } from '../../stores/historyStore';
import type { TestResult } from '../../models/TestResult';

function addMockResults(count: number) {
  for (let i = 0; i < count; i++) {
    const result: TestResult = {
      id: `test-${i}`,
      date: new Date(Date.now() - i * 86400000).toISOString(),
      age: 20 + i,
      totalTimeSeconds: 300 + i * 60,
      answers: [],
      rawScore: 30 + i,
      percentile: 40 + i,
      iqScore: 90 + i,
      iqLevel: '正常',
      seriesScores: { A: 5, Ab: 5, B: 5, C: 5, D: 5, E: 5 },
    };
    useHistoryStore.getState().addResult(result);
  }
}

describe('HistoryScreen advanced', () => {
  beforeEach(() => {
    useHistoryStore.getState().clearHistory();
  });

  describe('with multiple records', () => {
    beforeEach(() => {
      addMockResults(5);
    });

    it('shows record count', () => {
      render(
        <MemoryRouter>
          <HistoryScreen />
        </MemoryRouter>
      );
      expect(screen.getByText(/共 5 条/)).toBeTruthy();
    });

    it('renders all records', () => {
      render(
        <MemoryRouter>
          <HistoryScreen />
        </MemoryRouter>
      );
      const items = document.querySelectorAll('.history-item');
      expect(items.length).toBe(5);
    });

    it('shows IQ scores', () => {
      render(
        <MemoryRouter>
          <HistoryScreen />
        </MemoryRouter>
      );
      const scores = document.querySelectorAll('.history-item__score');
      expect(scores.length).toBe(5);
    });

    it('shows clear button', () => {
      render(
        <MemoryRouter>
          <HistoryScreen />
        </MemoryRouter>
      );
      expect(screen.getByText('清空历史')).toBeTruthy();
    });

    it('has export buttons for each record', () => {
      render(
        <MemoryRouter>
          <HistoryScreen />
        </MemoryRouter>
      );
      const exportBtns = document.querySelectorAll('.history-item button');
      expect(exportBtns.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('expand/collapse', () => {
    beforeEach(() => {
      addMockResults(3);
    });

    it('clicking record shows detail', async () => {
      render(
        <MemoryRouter>
          <HistoryScreen />
        </MemoryRouter>
      );
      const items = document.querySelectorAll('.history-item');
      await userEvent.click(items[0]);
      // Detail should show series scores
      expect(screen.getAllByText(/系列/).length).toBeGreaterThanOrEqual(6);
    });

    it('clicking again hides detail', async () => {
      render(
        <MemoryRouter>
          <HistoryScreen />
        </MemoryRouter>
      );
      const items = document.querySelectorAll('.history-item');
      await userEvent.click(items[0]);
      await userEvent.click(items[0]);
      // After toggle, detail should be hidden
      expect(screen.queryAllByText(/百分位/).length).toBe(0);
    });
  });

  describe('clear history', () => {
    it('clearing removes all records', async () => {
      addMockResults(3);
      render(
        <MemoryRouter>
          <HistoryScreen />
        </MemoryRouter>
      );
      await userEvent.click(screen.getByText('清空历史'));
      expect(screen.getByText('暂无历史记录')).toBeTruthy();
    });
  });
});
