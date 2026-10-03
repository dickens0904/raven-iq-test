import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TestScreen from '../../screens/TestScreen';
import { useTestStore } from '../../stores/testStore';

describe('TestScreen', () => {
  beforeEach(() => {
    useTestStore.getState().resetTest();
  });

  it('shows guidance when no test started', () => {
    render(
      <MemoryRouter>
        <TestScreen />
      </MemoryRouter>
    );
    expect(screen.getByText('请先在首页设置年龄并开始测验')).toBeTruthy();
  });

  it('renders return home button', () => {
    render(
      <MemoryRouter>
        <TestScreen />
      </MemoryRouter>
    );
    expect(screen.getByText('返回首页')).toBeTruthy();
  });
});
