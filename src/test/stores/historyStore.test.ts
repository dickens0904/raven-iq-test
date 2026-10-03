import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoryStore } from '../../stores/historyStore';
import type { TestResult } from '../../models/TestResult';

function mockResult(id: string = 'test-1'): TestResult {
  return {
    id,
    date: new Date().toISOString(),
    age: 25,
    totalTimeSeconds: 600,
    answers: [],
    rawScore: 36,
    percentile: 50,
    iqScore: 100,
    iqLevel: '正常',
    seriesScores: { A: 6, Ab: 6, B: 6, C: 6, D: 6, E: 6 },
  };
}

describe('historyStore', () => {
  beforeEach(() => {
    useHistoryStore.getState().clearHistory();
  });

  it('starts with empty history', () => {
    expect(useHistoryStore.getState().history.length).toBe(0);
  });

  it('addResult adds to history', () => {
    useHistoryStore.getState().addResult(mockResult('t1'));
    expect(useHistoryStore.getState().history.length).toBe(1);
    expect(useHistoryStore.getState().history[0].id).toBe('t1');
  });

  it('addResult prevents duplicates', () => {
    useHistoryStore.getState().addResult(mockResult('t1'));
    useHistoryStore.getState().addResult(mockResult('t1'));
    expect(useHistoryStore.getState().history.length).toBe(1);
  });

  it('addResult allows different IDs', () => {
    useHistoryStore.getState().addResult(mockResult('t1'));
    useHistoryStore.getState().addResult(mockResult('t2'));
    expect(useHistoryStore.getState().history.length).toBe(2);
  });

  it('clearHistory empties the list', () => {
    useHistoryStore.getState().addResult(mockResult('t1'));
    useHistoryStore.getState().addResult(mockResult('t2'));
    useHistoryStore.getState().clearHistory();
    expect(useHistoryStore.getState().history.length).toBe(0);
  });

  it('newest result is first in list', () => {
    useHistoryStore.getState().addResult(mockResult('t1'));
    useHistoryStore.getState().addResult(mockResult('t2'));
    expect(useHistoryStore.getState().history[0].id).toBe('t2');
  });
});
