import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HomeScreen from '../../screens/HomeScreen';
import { useTestStore } from '../../stores/testStore';

function renderHome() {
  return render(
    <MemoryRouter>
      <HomeScreen />
    </MemoryRouter>
  );
}

describe('HomeScreen', () => {
  beforeEach(() => {
    useTestStore.getState().resetTest();
  });

  it('renders title', () => {
    renderHome();
    expect(screen.getByText('瑞文标准推理测验')).toBeTruthy();
  });

  it('renders age input', () => {
    renderHome();
    expect(screen.getByPlaceholderText('例如：25')).toBeTruthy();
  });

  it('renders start button', () => {
    renderHome();
    expect(screen.getByText('开始测验')).toBeTruthy();
  });

  it('shows error for empty submission', async () => {
    renderHome();
    await userEvent.click(screen.getByText('开始测验'));
    expect(screen.getByText(/整数/)).toBeTruthy();
  });

  it('shows error for out-of-range age', async () => {
    renderHome();
    const input = screen.getByPlaceholderText('例如：25');
    await userEvent.type(input, '100');
    await userEvent.click(screen.getByText('开始测验'));
    expect(screen.getByText(/5-65/)).toBeTruthy();
  });

  it('clears error when input changes', async () => {
    renderHome();
    await userEvent.click(screen.getByText('开始测验'));
    expect(screen.getByText(/整数/)).toBeTruthy();
    const input = screen.getByPlaceholderText('例如：25');
    await userEvent.type(input, '5');
    expect(screen.queryByText(/整数/)).toBeNull();
  });
});
