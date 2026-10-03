import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TestScreen from '../../screens/TestScreen';
import { useTestStore } from '../../stores/testStore';

describe('TestScreen advanced', () => {
  beforeEach(() => {
    useTestStore.getState().resetTest();
  });

  describe('with active test', () => {
    beforeEach(() => {
      useTestStore.getState().startTest(25);
    });

    it('shows question card', () => {
      render(
        <MemoryRouter>
          <TestScreen />
        </MemoryRouter>
      );
      expect(document.querySelector('.question-card')).toBeTruthy();
    });

    it('shows progress indicator', () => {
      render(
        <MemoryRouter>
          <TestScreen />
        </MemoryRouter>
      );
      expect(document.querySelector('.progress-bar')).toBeTruthy();
      expect(screen.getByText(/1 \/ 72/)).toBeTruthy();
    });

    it('shows series label', () => {
      render(
        <MemoryRouter>
          <TestScreen />
        </MemoryRouter>
      );
      expect(screen.getByText(/系列/)).toBeTruthy();
    });

    it('shows timer', () => {
      render(
        <MemoryRouter>
          <TestScreen />
        </MemoryRouter>
      );
      expect(screen.getByText(/⏱/)).toBeTruthy();
    });

    it('shows matrix grid', () => {
      render(
        <MemoryRouter>
          <TestScreen />
        </MemoryRouter>
      );
      const cells = document.querySelectorAll('.question-card__matrix-cell');
      expect(cells.length).toBe(9);
    });

    it('shows missing cell placeholder', () => {
      render(
        <MemoryRouter>
          <TestScreen />
        </MemoryRouter>
      );
      expect(document.querySelector('.question-card__matrix-cell--missing')).toBeTruthy();
    });

    it('shows options', () => {
      render(
        <MemoryRouter>
          <TestScreen />
        </MemoryRouter>
      );
      const options = document.querySelectorAll('.option-item');
      expect(options.length).toBeGreaterThanOrEqual(6);
    });

    it('prev button disabled on first question', () => {
      render(
        <MemoryRouter>
          <TestScreen />
        </MemoryRouter>
      );
      const prevBtn = screen.getByText('上一题');
      expect(prevBtn.closest('button')?.disabled).toBe(true);
    });

    it('next button disabled without selection', () => {
      render(
        <MemoryRouter>
          <TestScreen />
        </MemoryRouter>
      );
      const nextBtn = screen.getByText('下一题');
      expect(nextBtn.closest('button')?.disabled).toBe(true);
    });

    it('shows keyboard hints on desktop', () => {
      render(
        <MemoryRouter>
          <TestScreen />
        </MemoryRouter>
      );
      expect(document.querySelectorAll('.kbd').length).toBeGreaterThan(0);
    });
  });

  describe('submit button', () => {
    it('shows submit on last question', () => {
      useTestStore.getState().startTest(25);
      // Navigate to last question
      for (let i = 0; i < 71; i++) useTestStore.getState().nextQuestion();
      render(
        <MemoryRouter>
          <TestScreen />
        </MemoryRouter>
      );
      expect(screen.getByText('提交测验')).toBeTruthy();
    });
  });
});
