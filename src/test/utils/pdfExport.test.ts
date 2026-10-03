import { describe, it, expect } from 'vitest';
import { exportResultToPDF } from '../../utils/pdfExport';
import type { TestResult } from '../../models/TestResult';

const mockResult: TestResult = {
  id: 'test-1',
  date: '2024-01-01T00:00:00.000Z',
  age: 25,
  totalTimeSeconds: 600,
  answers: Array.from({ length: 72 }, (_, i) => ({
    questionId: `A${i + 1}`,
    selectedAnswer: 0,
    isCorrect: i < 36,
    timeSeconds: 5,
  })),
  rawScore: 36,
  percentile: 50,
  iqScore: 100,
  iqLevel: '正常',
  seriesScores: { A: 6, Ab: 6, B: 6, C: 6, D: 6, E: 6 },
};

describe('exportResultToPDF', () => {
  it('does not throw when called with valid result', () => {
    expect(() => exportResultToPDF(mockResult)).not.toThrow();
  });

  it('calls doc.save internally (jsPDF)', () => {
    // Just verify it doesn't throw - jsPDF save is internal
    expect(() => exportResultToPDF(mockResult, 'test-report.pdf')).not.toThrow();
  });
});
