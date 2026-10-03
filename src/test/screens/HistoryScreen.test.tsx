import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HistoryScreen from '../../screens/HistoryScreen';
import { useHistoryStore } from '../../stores/historyStore';

describe('HistoryScreen', () => {
  beforeEach(() => {
    useHistoryStore.getState().clearHistory();
  });

  it('shows empty state when no history', () => {
    render(
      <MemoryRouter>
        <HistoryScreen />
      </MemoryRouter>
    );
    expect(screen.getByText('暂无历史记录')).toBeTruthy();
  });
});
