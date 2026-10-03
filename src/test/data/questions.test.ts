import { describe, it, expect } from 'vitest';
import { getAllQuestions, getQuestion } from '../../data/questions';

describe('getAllQuestions', () => {
  const questions = getAllQuestions();

  it('generates 72 questions total', () => {
    expect(questions.length).toBe(72);
  });

  it('has 12 questions per series (A, Ab, B, C, D, E)', () => {
    const seriesCounts: Record<string, number> = {};
    for (const q of questions) {
      seriesCounts[q.series] = (seriesCounts[q.series] || 0) + 1;
    }
    expect(seriesCounts.A).toBe(12);
    expect(seriesCounts.Ab).toBe(12);
    expect(seriesCounts.B).toBe(12);
    expect(seriesCounts.C).toBe(12);
    expect(seriesCounts.D).toBe(12);
    expect(seriesCounts.E).toBe(12);
  });

  it('all questions have unique IDs', () => {
    const ids = questions.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('A/Ab/B series have 6 options, C/D/E have 8', () => {
    for (const q of questions) {
      if (q.series === 'A' || q.series === 'Ab' || q.series === 'B') {
        expect(q.optionsCount).toBe(6);
      } else {
        expect(q.optionsCount).toBe(8);
      }
    }
  });

  it('every question has correctAnswer within options range', () => {
    for (const q of questions) {
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswer).toBeLessThan(q.optionsCount);
    }
  });

  it('every question has exactly 8 matrix cells (3x3 minus missing)', () => {
    for (const q of questions) {
      expect(q.matrixCells.length).toBe(8);
    }
  });

  it('every question has missingCellPosition between 0-8', () => {
    for (const q of questions) {
      expect(q.missingCellPosition).toBeGreaterThanOrEqual(0);
      expect(q.missingCellPosition).toBeLessThanOrEqual(8);
    }
  });

  it('options count matches optionsCount field', () => {
    for (const q of questions) {
      expect(q.options.length).toBe(q.optionsCount);
    }
  });

  it('each cell has at least one shape', () => {
    for (const q of questions) {
      for (const cell of q.matrixCells) {
        expect(cell.shapes.length).toBeGreaterThan(0);
      }
      for (const opt of q.options) {
        expect(opt.shapes.length).toBeGreaterThan(0);
      }
    }
  });

  it('generates deterministic results (same seed = same output)', () => {
    const q1 = getAllQuestions();
    const q2 = getAllQuestions();
    expect(q1[0].id).toBe(q2[0].id);
    expect(q1[0].correctAnswer).toBe(q2[0].correctAnswer);
    expect(JSON.stringify(q1[0].options)).toBe(JSON.stringify(q2[0].options));
  });
});

describe('getQuestion', () => {
  it('returns question by ID', () => {
    const q = getQuestion('A1');
    expect(q).toBeDefined();
    expect(q?.series).toBe('A');
    expect(q?.number).toBe(1);
  });

  it('returns undefined for invalid ID', () => {
    expect(getQuestion('Z99')).toBeUndefined();
  });
});
