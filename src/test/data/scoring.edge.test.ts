import { describe, it, expect } from 'vitest';
import {
  calculateRawScore,
  getPercentile,
  getIQScore,
  getIQLevel,
  getSeriesScores,
} from '../../data/scoring';
import type { AnswerRecord } from '../../models/TestResult';

function ans(id: string, ok: boolean): AnswerRecord {
  return { questionId: id, selectedAnswer: ok ? 0 : 1, isCorrect: ok, timeSeconds: 5 };
}

describe('scoring edge cases', () => {
  describe('calculateRawScore extremes', () => {
    it('all incorrect returns 0', () => {
      const a = Array.from({ length: 72 }, (_, i) => ans(`A${i}`, false));
      expect(calculateRawScore(a)).toBe(0);
    });

    it('mixed correct/incorrect counts precisely', () => {
      const a = Array.from({ length: 20 }, (_, i) => ans(`A${i}`, i % 3 === 0));
      expect(calculateRawScore(a)).toBe(7); // 0,3,6,9,12,15,18
    });

    it('single correct answer', () => {
      expect(calculateRawScore([ans('A1', true), ans('A2', false)])).toBe(1);
    });
  });

  describe('getPercentile age group boundaries', () => {
    it('age 7 → 5-7 group', () => {
      const p = getPercentile(36, 7);
      expect(p).toBeGreaterThanOrEqual(0);
    });

    it('age 8 → 8-10 group', () => {
      const p8 = getPercentile(36, 8);
      // Different groups may give different results
      expect(typeof p8).toBe('number');
    });

    it('age 10 → 8-10 group', () => {
      expect(getPercentile(0, 10)).toBe(0);
    });

    it('age 11 → 11-13 group', () => {
      expect(getPercentile(0, 11)).toBe(0);
    });

    it('age 13 → 11-13 group', () => {
      expect(getPercentile(72, 13)).toBe(100);
    });

    it('age 14 → 14-16 group', () => {
      expect(typeof getPercentile(36, 14)).toBe('number');
    });

    it('age 17 → 17-19 group', () => {
      expect(typeof getPercentile(36, 17)).toBe('number');
    });

    it('age 20 → 20-29 group', () => {
      expect(typeof getPercentile(36, 20)).toBe('number');
    });

    it('age 30 → 30-39 group', () => {
      expect(typeof getPercentile(36, 30)).toBe('number');
    });

    it('age 40 → 40-49 group', () => {
      expect(typeof getPercentile(36, 40)).toBe('number');
    });

    it('age 50 → 50-59 group', () => {
      expect(typeof getPercentile(36, 50)).toBe('number');
    });

    it('age 60 → 60-65 group', () => {
      expect(typeof getPercentile(36, 60)).toBe('number');
    });

    it('age 65 → 60-65 group', () => {
      expect(getPercentile(72, 65)).toBe(100);
    });
  });

  describe('getPercentile monotonicity', () => {
    it('percentile strictly increases with score for age 25', () => {
      let prev = -1;
      for (let score = 0; score <= 72; score++) {
        const p = getPercentile(score, 25);
        expect(p).toBeGreaterThanOrEqual(prev);
        prev = p;
      }
    });
  });

  describe('getIQScore boundary precision', () => {
    it('percentile 1 gives low IQ', () => {
      const iq = getIQScore(1);
      expect(iq).toBeLessThan(70);
    });

    it('percentile 99 gives high IQ', () => {
      const iq = getIQScore(99);
      expect(iq).toBeGreaterThan(120);
    });

    it('IQ is monotonically non-decreasing with percentile', () => {
      let prev = 0;
      for (let p = 1; p <= 100; p++) {
        const iq = getIQScore(p);
        expect(iq).toBeGreaterThanOrEqual(prev);
        prev = iq;
      }
    });

    it('returns integer values', () => {
      for (let p = 0; p <= 100; p += 3) {
        expect(Number.isInteger(getIQScore(p))).toBe(true);
      }
    });
  });

  describe('getIQLevel boundary values', () => {
    it('IQ 129 → 良好 (not 优秀)', () => {
      expect(getIQLevel(129)).toBe('良好');
    });

    it('IQ 119 → 中上 (not 良好)', () => {
      expect(getIQLevel(119)).toBe('中上');
    });

    it('IQ 109 → 正常 (not 中上)', () => {
      expect(getIQLevel(109)).toBe('正常');
    });

    it('IQ 89 → 中下 (not 正常)', () => {
      expect(getIQLevel(89)).toBe('中下');
    });

    it('IQ 79 → 临界 (not 中下)', () => {
      expect(getIQLevel(79)).toBe('临界');
    });

    it('IQ 69 → 低下 (not 临界)', () => {
      expect(getIQLevel(69)).toBe('低下');
    });

    it('IQ 145 → 优秀', () => {
      expect(getIQLevel(145)).toBe('优秀');
    });

    it('IQ 55 → 低下', () => {
      expect(getIQLevel(55)).toBe('低下');
    });
  });

  describe('getSeriesScores edge cases', () => {
    it('all correct across all series', () => {
      const answers: AnswerRecord[] = [];
      for (const s of ['A', 'Ab', 'B', 'C', 'D', 'E']) {
        for (let n = 1; n <= 12; n++) {
          answers.push(ans(`${s}${n}`, true));
        }
      }
      const scores = getSeriesScores(answers);
      expect(scores.A).toBe(12);
      expect(scores.Ab).toBe(12);
      expect(scores.B).toBe(12);
      expect(scores.C).toBe(12);
      expect(scores.D).toBe(12);
      expect(scores.E).toBe(12);
    });

    it('only incorrect answers', () => {
      const answers = Array.from({ length: 72 }, (_, i) => ans(`A${i}`, false));
      const scores = getSeriesScores(answers);
      expect(Object.values(scores).every(v => v === 0)).toBe(true);
    });

    it('handles mixed series with number suffixes', () => {
      const answers = [ans('Ab12', true), ans('B1', true), ans('B12', true)];
      const scores = getSeriesScores(answers);
      expect(scores.Ab).toBe(1);
      expect(scores.B).toBe(2);
    });
  });
});
