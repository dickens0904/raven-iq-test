import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionPanel from '../../components/QuestionPanel';
import { getAllQuestions } from '../../data/questions';

const questions = getAllQuestions();

describe('QuestionPanel advanced', () => {
  describe('with 6-option question (Series A)', () => {
    const qA = questions.find(q => q.series === 'A')!;

    it('renders exactly 6 options', () => {
      render(<QuestionPanel question={qA} onSelect={vi.fn()} />);
      expect(document.querySelectorAll('.option-item').length).toBe(6);
    });

    it('option labels are 1-6', () => {
      render(<QuestionPanel question={qA} onSelect={vi.fn()} />);
      const labels = document.querySelectorAll('.option-item__label');
      expect(labels[0].textContent).toBe('1');
      expect(labels[5].textContent).toBe('6');
    });
  });

  describe('with 8-option question (Series C)', () => {
    const qC = questions.find(q => q.series === 'C')!;

    it('renders exactly 8 options', () => {
      render(<QuestionPanel question={qC} onSelect={vi.fn()} />);
      expect(document.querySelectorAll('.option-item').length).toBe(8);
    });

    it('option labels are 1-8', () => {
      render(<QuestionPanel question={qC} onSelect={vi.fn()} />);
      const labels = document.querySelectorAll('.option-item__label');
      expect(labels[0].textContent).toBe('1');
      expect(labels[7].textContent).toBe('8');
    });
  });

  describe('keyboard interaction', () => {
    it('selects option via Enter key', async () => {
      const onSelect = vi.fn();
      render(<QuestionPanel question={questions[0]} onSelect={onSelect} />);
      const options = document.querySelectorAll('.option-item');
      options[0].focus();
      await userEvent.keyboard('{Enter}');
      expect(onSelect).toHaveBeenCalledWith(0);
    });

    it('selects option via Space key', async () => {
      const onSelect = vi.fn();
      render(<QuestionPanel question={questions[0]} onSelect={onSelect} />);
      const options = document.querySelectorAll('.option-item');
      options[2].focus();
      await userEvent.keyboard(' ');
      expect(onSelect).toHaveBeenCalledWith(2);
    });
  });

  describe('accessibility', () => {
    it('each option has role button', () => {
      render(<QuestionPanel question={questions[0]} onSelect={vi.fn()} />);
      const buttons = document.querySelectorAll('[role="button"]');
      expect(buttons.length).toBeGreaterThanOrEqual(6);
    });

    it('each option has tabIndex', () => {
      render(<QuestionPanel question={questions[0]} onSelect={vi.fn()} />);
      const options = document.querySelectorAll('.option-item');
      options.forEach(opt => {
        expect(opt.getAttribute('tabindex')).toBe('0');
      });
    });
  });

  describe('selection highlighting', () => {
    it('highlights exactly one option', () => {
      render(<QuestionPanel question={questions[0]} selectedIndex={3} onSelect={vi.fn()} />);
      const selected = document.querySelectorAll('.option-item--selected');
      expect(selected.length).toBe(1);
    });

    it('no highlight when nothing selected', () => {
      render(<QuestionPanel question={questions[0]} onSelect={vi.fn()} />);
      expect(document.querySelectorAll('.option-item--selected').length).toBe(0);
    });
  });

  describe('different series questions', () => {
    for (const series of ['A', 'Ab', 'B', 'C', 'D', 'E']) {
      it(`renders ${series} series question correctly`, () => {
        const q = questions.find(q => q.series === series)!;
        render(<QuestionPanel question={q} onSelect={vi.fn()} />);
        expect(document.querySelectorAll('.question-card__matrix-cell').length).toBe(9);
        expect(document.querySelectorAll('.option-item').length).toBe(q.optionsCount);
      });
    }
  });
});
