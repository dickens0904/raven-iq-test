import { describe, it, expect, beforeEach } from 'vitest';
import { useTestStore } from '../../stores/testStore';

describe('testStore advanced', () => {
  beforeEach(() => {
    useTestStore.getState().resetTest();
  });

  describe('answer override', () => {
    it('overwrites previous answer for same question', () => {
      useTestStore.getState().startTest(25);
      const q = useTestStore.getState().questions[0];
      useTestStore.getState().answerQuestion(q.id, 0);
      useTestStore.getState().answerQuestion(q.id, 3);
      expect(useTestStore.getState().answers[q.id].selectedAnswer).toBe(3);
    });
  });

  describe('correct answer tracking', () => {
    it('marks answer as correct when matching correctAnswer', () => {
      useTestStore.getState().startTest(25);
      const q = useTestStore.getState().questions[0];
      useTestStore.getState().answerQuestion(q.id, q.correctAnswer);
      expect(useTestStore.getState().answers[q.id].isCorrect).toBe(true);
    });

    it('marks answer as incorrect when wrong', () => {
      useTestStore.getState().startTest(25);
      const q = useTestStore.getState().questions[0];
      const wrongIdx = (q.correctAnswer + 1) % q.optionsCount;
      useTestStore.getState().answerQuestion(q.id, wrongIdx);
      expect(useTestStore.getState().answers[q.id].isCorrect).toBe(false);
    });
  });

  describe('time tracking', () => {
    it('records time for each answer', () => {
      useTestStore.getState().startTest(25);
      const q = useTestStore.getState().questions[0];
      useTestStore.getState().answerQuestion(q.id, 0);
      const time = useTestStore.getState().answers[q.id].timeSeconds;
      expect(time).toBeGreaterThanOrEqual(1);
    });

    it('result totalTimeSeconds is positive', () => {
      useTestStore.getState().startTest(25);
      const result = useTestStore.getState().submitTest();
      expect(result.totalTimeSeconds).toBeGreaterThanOrEqual(1);
    });
  });

  describe('complete flow simulation', () => {
    it('answer all 72 questions and submit', () => {
      useTestStore.getState().startTest(25);
      const qs = useTestStore.getState().questions;
      let correctCount = 0;

      for (const q of qs) {
        // Alternate between correct and wrong answers
        if (q.number % 2 === 0) {
          useTestStore.getState().answerQuestion(q.id, q.correctAnswer);
          correctCount++;
        } else {
          useTestStore.getState().answerQuestion(q.id, (q.correctAnswer + 1) % q.optionsCount);
        }
        useTestStore.getState().nextQuestion();
      }

      const result = useTestStore.getState().submitTest();
      expect(result.rawScore).toBe(correctCount);
      expect(result.answers.length).toBe(72);
      expect(useTestStore.getState().finished).toBe(true);
    });

    it('submit without answering still produces valid result', () => {
      useTestStore.getState().startTest(30);
      const result = useTestStore.getState().submitTest();
      expect(result.rawScore).toBe(0);
      expect(result.iqScore).toBeGreaterThanOrEqual(55);
      expect(result.answers.every(a => a.isCorrect === false)).toBe(true);
    });
  });

  describe('navigation edge cases', () => {
    it('nextQuestion from last question stays at last', () => {
      useTestStore.getState().startTest(25);
      // Navigate past the end
      for (let i = 0; i < 200; i++) useTestStore.getState().nextQuestion();
      expect(useTestStore.getState().currentIndex).toBe(71);
    });

    it('previousQuestion from first stays at 0', () => {
      useTestStore.getState().startTest(25);
      for (let i = 0; i < 5; i++) useTestStore.getState().previousQuestion();
      expect(useTestStore.getState().currentIndex).toBe(0);
    });
  });

  describe('reset after submit', () => {
    it('can start new test after reset', () => {
      useTestStore.getState().startTest(25);
      useTestStore.getState().submitTest();
      useTestStore.getState().resetTest();
      useTestStore.getState().startTest(30);
      const state = useTestStore.getState();
      expect(state.age).toBe(30);
      expect(state.questions.length).toBe(72);
      expect(state.finished).toBe(false);
      expect(state.result).toBeNull();
    });
  });

  describe('submit result structure', () => {
    it('result has valid date string', () => {
      useTestStore.getState().startTest(25);
      const result = useTestStore.getState().submitTest();
      expect(new Date(result.date).toISOString()).toBe(result.date);
    });

    it('result id contains timestamp', () => {
      useTestStore.getState().startTest(25);
      const result = useTestStore.getState().submitTest();
      expect(result.id).toMatch(/^test-\d+$/);
    });

    it('seriesScores sums to rawScore', () => {
      useTestStore.getState().startTest(25);
      const qs = useTestStore.getState().questions;
      for (const q of qs) {
        useTestStore.getState().answerQuestion(q.id, q.correctAnswer);
      }
      const result = useTestStore.getState().submitTest();
      const total = Object.values(result.seriesScores).reduce((a, b) => a + b, 0);
      expect(total).toBe(result.rawScore);
    });

    it('each series score is between 0 and 12', () => {
      useTestStore.getState().startTest(25);
      const result = useTestStore.getState().submitTest();
      for (const [, score] of Object.entries(result.seriesScores)) {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(12);
      }
    });
  });
});
