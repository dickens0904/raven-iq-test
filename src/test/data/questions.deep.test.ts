import { describe, it, expect } from 'vitest';
import { getAllQuestions } from '../../data/questions';

const questions = getAllQuestions();

describe('questions deep validation', () => {
  describe('shape type diversity', () => {
    it('uses multiple shape types across all questions', () => {
      const types = new Set<string>();
      for (const q of questions) {
        for (const cell of [...q.matrixCells, ...q.options]) {
          for (const shape of cell.shapes) {
            types.add(shape.type);
          }
        }
      }
      expect(types.size).toBeGreaterThanOrEqual(5);
    });

    it('includes circle shapes', () => {
      const hasCircle = questions.some(q =>
        [...q.matrixCells, ...q.options].some(c => c.shapes.some(s => s.type === 'circle'))
      );
      expect(hasCircle).toBe(true);
    });

    it('includes square shapes', () => {
      const has = questions.some(q =>
        [...q.matrixCells, ...q.options].some(c => c.shapes.some(s => s.type === 'square'))
      );
      expect(has).toBe(true);
    });
  });

  describe('fill type diversity', () => {
    it('uses solid fill', () => {
      const has = questions.some(q =>
        [...q.matrixCells, ...q.options].some(c => c.shapes.some(s => s.fill === 'solid'))
      );
      expect(has).toBe(true);
    });

    it('uses empty fill', () => {
      const has = questions.some(q =>
        [...q.matrixCells, ...q.options].some(c => c.shapes.some(s => s.fill === 'empty'))
      );
      expect(has).toBe(true);
    });

    it('uses striped fill', () => {
      const has = questions.some(q =>
        [...q.matrixCells, ...q.options].some(c => c.shapes.some(s => s.fill === 'striped'))
      );
      expect(has).toBe(true);
    });
  });

  describe('color diversity', () => {
    it('uses black color', () => {
      const has = questions.some(q =>
        q.matrixCells.some(c => c.shapes.some(s => s.color === 'black'))
      );
      expect(has).toBe(true);
    });

    it('uses gray color', () => {
      const has = questions.some(q =>
        q.matrixCells.some(c => c.shapes.some(s => s.color === 'gray'))
      );
      expect(has).toBe(true);
    });
  });

  describe('missing position distribution', () => {
    it('covers all 9 positions (0-8)', () => {
      const positions = new Set(questions.map(q => q.missingCellPosition));
      expect(positions.size).toBe(9);
      for (let i = 0; i < 9; i++) {
        expect(positions.has(i)).toBe(true);
      }
    });

    it('each series uses multiple missing positions', () => {
      const seriesPositions: Record<string, Set<number>> = {};
      for (const q of questions) {
        if (!seriesPositions[q.series]) seriesPositions[q.series] = new Set();
        seriesPositions[q.series].add(q.missingCellPosition);
      }
      for (const series of Object.keys(seriesPositions)) {
        expect(seriesPositions[series].size).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('option correctness', () => {
    it('correctAnswer index always points to a valid option', () => {
      for (const q of questions) {
        expect(q.options[q.correctAnswer]).toBeDefined();
        expect(q.options[q.correctAnswer].shapes.length).toBeGreaterThan(0);
      }
    });

    it('each question has at least one distractor different from correct', () => {
      for (const q of questions) {
        const correct = JSON.stringify(q.options[q.correctAnswer]);
        const hasDifferent = q.options.some(
          (opt, i) => i !== q.correctAnswer && JSON.stringify(opt) !== correct
        );
        expect(hasDifferent).toBe(true);
      }
    });
  });

  describe('matrix structure', () => {
    it('each series has questions numbered 1-12', () => {
      for (const series of ['A', 'Ab', 'B', 'C', 'D', 'E']) {
        const seriesQs = questions.filter(q => q.series === series);
        const numbers = seriesQs.map(q => q.number).sort((a, b) => a - b);
        expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      }
    });

    it('IDs follow pattern {series}{number}', () => {
      for (const q of questions) {
        expect(q.id).toBe(`${q.series}${q.number}`);
      }
    });

    it('no question has duplicate options', () => {
      for (const q of questions) {
        const optionStrs = q.options.map(o => JSON.stringify(o));
        expect(new Set(optionStrs).size).toBe(optionStrs.length);
      }
    });
  });

  describe('shape properties validity', () => {
    it('all shape x/y values are between 0 and 1', () => {
      for (const q of questions) {
        for (const cell of q.matrixCells) {
          for (const s of cell.shapes) {
            expect(s.x).toBeGreaterThanOrEqual(0);
            expect(s.x).toBeLessThanOrEqual(1);
            expect(s.y).toBeGreaterThanOrEqual(0);
            expect(s.y).toBeLessThanOrEqual(1);
          }
        }
      }
    });

    it('all shape sizes are positive', () => {
      for (const q of questions) {
        for (const cell of q.matrixCells) {
          for (const s of cell.shapes) {
            expect(s.size).toBeGreaterThan(0);
            expect(s.size).toBeLessThanOrEqual(1);
          }
        }
      }
    });
  });
});
