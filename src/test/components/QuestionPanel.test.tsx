import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionPanel from '../../components/QuestionPanel';
import { getAllQuestions } from '../../data/questions';

const questions = getAllQuestions();
const sampleQuestion = questions[0];

describe('QuestionPanel', () => {
  it('renders 3x3 matrix grid (9 cells)', () => {
    render(<QuestionPanel question={sampleQuestion} onSelect={vi.fn()} />);
    const cells = document.querySelectorAll('.question-card__matrix-cell');
    expect(cells.length).toBe(9);
  });

  it('renders missing cell with ?', () => {
    render(<QuestionPanel question={sampleQuestion} onSelect={vi.fn()} />);
    const missing = document.querySelector('.question-card__matrix-cell--missing');
    expect(missing).toBeTruthy();
    expect(missing?.textContent).toBe('?');
  });

  it('renders correct number of options', () => {
    render(<QuestionPanel question={sampleQuestion} onSelect={vi.fn()} />);
    const options = document.querySelectorAll('.option-item');
    expect(options.length).toBe(sampleQuestion.optionsCount);
  });

  it('calls onSelect when option clicked', async () => {
    const onSelect = vi.fn();
    render(<QuestionPanel question={sampleQuestion} onSelect={onSelect} />);
    const options = document.querySelectorAll('.option-item');
    await userEvent.click(options[0]);
    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it('highlights selected option', () => {
    render(<QuestionPanel question={sampleQuestion} selectedIndex={2} onSelect={vi.fn()} />);
    const selected = document.querySelector('.option-item--selected');
    expect(selected).toBeTruthy();
  });

  it('shows keyboard hints when showKeyboardHints is true', () => {
    render(<QuestionPanel question={sampleQuestion} onSelect={vi.fn()} showKeyboardHints />);
    expect(document.querySelectorAll('.kbd').length).toBeGreaterThan(0);
  });

  it('hides keyboard hints when showKeyboardHints is false', () => {
    render(
      <QuestionPanel question={sampleQuestion} onSelect={vi.fn()} showKeyboardHints={false} />
    );
    expect(document.querySelectorAll('.kbd').length).toBe(0);
  });
});
