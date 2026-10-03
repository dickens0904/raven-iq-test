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

describe('HomeScreen advanced', () => {
  beforeEach(() => {
    useTestStore.getState().resetTest();
  });

  describe('boundary ages', () => {
    it('accepts age 5 (minimum)', async () => {
      renderHome();
      const input = screen.getByPlaceholderText('例如：25');
      await userEvent.type(input, '5');
      await userEvent.click(screen.getByText('开始测验'));
      expect(useTestStore.getState().age).toBe(5);
    });

    it('accepts age 65 (maximum)', async () => {
      renderHome();
      const input = screen.getByPlaceholderText('例如：25');
      await userEvent.type(input, '65');
      await userEvent.click(screen.getByText('开始测验'));
      expect(useTestStore.getState().age).toBe(65);
    });

    it('rejects age 4', async () => {
      renderHome();
      const input = screen.getByPlaceholderText('例如：25');
      await userEvent.type(input, '4');
      await userEvent.click(screen.getByText('开始测验'));
      expect(screen.getByText(/5-65/)).toBeTruthy();
    });

    it('rejects age 66', async () => {
      renderHome();
      const input = screen.getByPlaceholderText('例如：25');
      await userEvent.type(input, '66');
      await userEvent.click(screen.getByText('开始测验'));
      expect(screen.getByText(/5-65/)).toBeTruthy();
    });
  });

  describe('form interaction', () => {
    it('clears error when valid input is entered', async () => {
      renderHome();
      await userEvent.click(screen.getByText('开始测验'));
      expect(screen.getByText(/整数/)).toBeTruthy();
      const input = screen.getByPlaceholderText('例如：25');
      await userEvent.type(input, '2');
      expect(screen.queryByText(/整数/)).toBeNull();
    });

    it('error message appears on validation failure', async () => {
      renderHome();
      await userEvent.click(screen.getByText('开始测验'));
      expect(screen.getByText(/整数年龄/)).toBeTruthy();
    });

    it('error clears when user types valid input', async () => {
      renderHome();
      await userEvent.click(screen.getByText('开始测验'));
      expect(screen.getByText(/整数年龄/)).toBeTruthy();
      const input = screen.getByPlaceholderText('例如：25');
      await userEvent.type(input, '2');
      expect(screen.queryByText(/整数年龄/)).toBeNull();
    });
  });

  describe('navigation', () => {
    it('history button navigates', async () => {
      renderHome();
      const historyBtn = screen.getByText('查看历史记录');
      expect(historyBtn).toBeTruthy();
    });
  });

  describe('page content', () => {
    it('shows description text', () => {
      renderHome();
      expect(screen.getByText(/72 道图形推理题目/)).toBeTruthy();
    });

    it('shows age range hint', () => {
      renderHome();
      expect(screen.getByText(/5-65岁/)).toBeTruthy();
    });
  });
});
