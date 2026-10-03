import { describe, it, expect } from 'vitest';
import {
  calculateRawScore,
  getPercentile,
  getIQScore,
  getIQLevel,
  getSeriesScores,
} from '../../data/scoring';
import type { AnswerRecord } from '../../models/TestResult';

function makeAnswer(id: string, correct: boolean, time = 5): AnswerRecord {
  return { questionId: id, selectedAnswer: correct ? 0 : 1, isCorrect: correct, timeSeconds: time };
}

describe('calculateRawScore', () => {
  it('returns 0 for empty answers', () => {
    expect(calculateRawScore([])).toBe(0);
  });

  it('counts correct answers', () => {
    const answers = [
      makeAnswer('A1', true),
      makeAnswer('A2', false),
      makeAnswer('A3', true),
      makeAnswer('A4', true),
    ];
    expect(calculateRawScore(answers)).toBe(3);
  });

  it('returns full score when all correct', () => {
    const answers = Array.from({ length: 72 }, (_, i) => makeAnswer(`A${i + 1}`, true));
    expect(calculateRawScore(answers)).toBe(72);
  });
});

describe('getPercentile', () => {
  it('returns 0 for score 0', () => {
    expect(getPercentile(0, 25)).toBe(0);
  });

  it('returns 100 for score 72', () => {
    expect(getPercentile(72, 25)).toBe(100);
  });

  it('returns higher percentile for higher score', () => {
    const p30 = getPercentile(30, 25);
    const p50 = getPercentile(50, 25);
    expect(p50).toBeGreaterThan(p30);
  });

  it('different age groups give different results', () => {
    const p_child = getPercentile(36, 6);
    const p_adult = getPercentile(36, 25);
    expect(p_child).not.toBe(p_adult);
  });
});

describe('getIQScore', () => {
  it('returns 55 for percentile 0', () => {
    expect(getIQScore(0)).toBe(55);
  });

  it('returns 145 for percentile 100', () => {
    expect(getIQScore(100)).toBe(145);
  });

  it('returns ~100 for percentile 50', () => {
    const iq = getIQScore(50);
    expect(iq).toBeGreaterThanOrEqual(95);
    expect(iq).toBeLessThanOrEqual(105);
  });

  it('returns higher IQ for higher percentile', () => {
    expect(getIQScore(90)).toBeGreaterThan(getIQScore(50));
  });

  it('is always between 55 and 145', () => {
    for (let p = 0; p <= 100; p += 5) {
      const iq = getIQScore(p);
      expect(iq).toBeGreaterThanOrEqual(55);
      expect(iq).toBeLessThanOrEqual(145);
    }
  });
});

describe('getIQLevel', () => {
  it('returns 优秀 for IQ >= 130', () => {
    expect(getIQLevel(130)).toBe('优秀');
    expect(getIQLevel(145)).toBe('优秀');
  });

  it('returns 良好 for IQ 120-129', () => {
    expect(getIQLevel(120)).toBe('良好');
    expect(getIQLevel(125)).toBe('良好');
  });

  it('returns 中上 for IQ 110-119', () => {
    expect(getIQLevel(110)).toBe('中上');
  });

  it('returns 正常 for IQ 90-109', () => {
    expect(getIQLevel(90)).toBe('正常');
    expect(getIQLevel(100)).toBe('正常');
  });

  it('returns 中下 for IQ 80-89', () => {
    expect(getIQLevel(80)).toBe('中下');
  });

  it('returns 临界 for IQ 70-79', () => {
    expect(getIQLevel(70)).toBe('临界');
  });

  it('returns 低下 for IQ < 70', () => {
    expect(getIQLevel(55)).toBe('低下');
  });
});

describe('getSeriesScores', () => {
  it('returns all zeros for empty answers', () => {
    const scores = getSeriesScores([]);
    expect(scores).toEqual({ A: 0, Ab: 0, B: 0, C: 0, D: 0, E: 0 });
  });

  it('counts correct answers per series', () => {
    const answers = [
      makeAnswer('A1', true),
      makeAnswer('A2', true),
      makeAnswer('A3', false),
      makeAnswer('Ab1', true),
      makeAnswer('B1', true),
      makeAnswer('B2', true),
      makeAnswer('B3', true),
      makeAnswer('C1', true),
      makeAnswer('D1', false),
      makeAnswer('E1', true),
    ];
    const scores = getSeriesScores(answers);
    expect(scores.A).toBe(2);
    expect(scores.Ab).toBe(1);
    expect(scores.B).toBe(3);
    expect(scores.C).toBe(1);
    expect(scores.D).toBe(0);
    expect(scores.E).toBe(1);
  });

  it('ignores unknown series', () => {
    const answers = [makeAnswer('X1', true), makeAnswer('Y2', true)];
    const scores = getSeriesScores(answers);
    expect(scores).toEqual({ A: 0, Ab: 0, B: 0, C: 0, D: 0, E: 0 });
  });
});
