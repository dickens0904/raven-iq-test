import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoryStore } from '../../stores/historyStore';
import type { TestResult } from '../../models/TestResult';

function mockResult(id: string, age = 25): TestResult {
  return {
    id,
    date: new Date().toISOString(),
    age,
    totalTimeSeconds: 600,
    answers: [],
    rawScore: 36,
    percentile: 50,
    iqScore: 100,
    iqLevel: '正常',
    seriesScores: { A: 6, Ab: 6, B: 6, C: 6, D: 6, E: 6 },
  };
}

describe('historyStore advanced', () => {
  beforeEach(() => {
    useHistoryStore.getState().clearHistory();
  });

  describe('ordering', () => {
    it('newest result is first', () => {
      useHistoryStore.getState().addResult(mockResult('r1'));
      useHistoryStore.getState().addResult(mockResult('r2'));
      useHistoryStore.getState().addResult(mockResult('r3'));
      const ids = useHistoryStore.getState().history.map(h => h.id);
      expect(ids).toEqual(['r3', 'r2', 'r1']);
    });
  });

  describe('multiple operations', () => {
    it('add then clear then add', () => {
      useHistoryStore.getState().addResult(mockResult('r1'));
      useHistoryStore.getState().clearHistory();
      useHistoryStore.getState().addResult(mockResult('r2'));
      expect(useHistoryStore.getState().history.length).toBe(1);
      expect(useHistoryStore.getState().history[0].id).toBe('r2');
    });
  });

  describe('preserves all result fields', () => {
    it('stores complete result object', () => {
      const result = mockResult('r1');
      result.iqScore = 135;
      result.iqLevel = '优秀';
      result.age = 10;
      useHistoryStore.getState().addResult(result);
      const stored = useHistoryStore.getState().history[0];
      expect(stored.iqScore).toBe(135);
      expect(stored.iqLevel).toBe('优秀');
      expect(stored.age).toBe(10);
    });
  });

  describe('many records', () => {
    it('handles 20 records', () => {
      for (let i = 0; i < 20; i++) {
        useHistoryStore.getState().addResult(mockResult(`r${i}`));
      }
      expect(useHistoryStore.getState().history.length).toBe(20);
      // Most recent first
      expect(useHistoryStore.getState().history[0].id).toBe('r19');
    });
  });
});
