import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResultScreen from '../../screens/ResultScreen';
import { useTestStore } from '../../stores/testStore';

describe('ResultScreen', () => {
  beforeEach(() => {
    useTestStore.getState().resetTest();
  });

  it('shows empty state when no result', () => {
    render(
      <MemoryRouter>
        <ResultScreen />
      </MemoryRouter>
    );
    expect(screen.getByText('暂无测试结果')).toBeTruthy();
  });

  it('shows result when test is completed', () => {
    useTestStore.getState().startTest(25);
    useTestStore.getState().submitTest();
    render(
      <MemoryRouter>
        <ResultScreen />
      </MemoryRouter>
    );
    expect(screen.getByText(/智商分数/)).toBeTruthy();
    expect(screen.getByText('重新测验')).toBeTruthy();
    expect(screen.getByText('导出 PDF')).toBeTruthy();
  });
});
