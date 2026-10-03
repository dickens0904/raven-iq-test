import { useCallback } from 'react';
import type { Question } from '../models/Question';
import CellRenderer from './CellRenderer';

interface QuestionPanelProps {
  question: Question;
  selectedIndex?: number;
  onSelect: (index: number) => void;
  showKeyboardHints?: boolean;
}

export default function QuestionPanel({
  question,
  selectedIndex,
  onSelect,
  showKeyboardHints,
}: QuestionPanelProps) {
  const { matrixCells, missingCellPosition, options } = question;

  const handleOptionClick = useCallback(
    (index: number) => {
      onSelect(index);
    },
    [onSelect]
  );

  // Build 3x3 grid cells, inserting "missing" placeholder
  const gridCells: ((typeof matrixCells)[0] | null)[] = [];
  let matrixIndex = 0;
  for (let i = 0; i < 9; i++) {
    if (i === missingCellPosition) {
      gridCells.push(null);
    } else {
      gridCells.push(matrixCells[matrixIndex] ?? null);
      matrixIndex++;
    }
  }

  return (
    <div className="question-card">
      <div
        className="question-card__matrix"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: 360, margin: '0 auto' }}
      >
        {gridCells.map((cell, i) => (
          <div
            key={i}
            className={`question-card__matrix-cell${cell === null ? ' question-card__matrix-cell--missing' : ''}`}
          >
            {cell !== null ? (
              <CellRenderer cell={cell} size={80} />
            ) : (
              <span
                style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}
              >
                ?
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="question-card__options-label text-center">请选择缺失的一块：</p>

      <div className="option-grid">
        {options.map((option, index) => (
          <div
            key={index}
            className={`option-item${selectedIndex === index ? ' option-item--selected' : ''}`}
            onClick={() => handleOptionClick(index)}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOptionClick(index);
              }
            }}
          >
            <span className="option-item__label">{index + 1}</span>
            <CellRenderer cell={option} size={64} />
          </div>
        ))}
      </div>

      {showKeyboardHints && (
        <div
          className="text-center mt-md"
          style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}
        >
          按 <span className="kbd">1</span>-<span className="kbd">{options.length}</span> 选择答案，
          <span className="kbd">←</span> <span className="kbd">→</span> 切换题目
        </div>
      )}
    </div>
  );
}
