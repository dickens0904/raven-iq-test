import { describe, it, expect, beforeEach } from 'vitest';
import { useTestStore } from '../../stores/testStore';

describe('testStore', () => {
  beforeEach(() => {
    useTestStore.getState().resetTest();
  });

  it('initializes with default state', () => {
    const state = useTestStore.getState();
    expect(state.age).toBe(0);
    expect(state.questions.length).toBe(0);
    expect(state.currentIndex).toBe(0);
    expect(state.finished).toBe(false);
    expect(state.result).toBeNull();
  });

  it('startTest loads questions and sets age', () => {
    useTestStore.getState().startTest(25);
    const state = useTestStore.getState();
    expect(state.age).toBe(25);
    expect(state.questions.length).toBe(72);
    expect(state.currentIndex).toBe(0);
    expect(state.startedAt).toBeGreaterThan(0);
  });

  it('answerQuestion stores answer', () => {
    useTestStore.getState().startTest(25);
    const q = useTestStore.getState().questions[0];
    useTestStore.getState().answerQuestion(q.id, 2);
    const answer = useTestStore.getState().answers[q.id];
    expect(answer).toBeDefined();
    expect(answer.selectedAnswer).toBe(2);
    expect(typeof answer.timeSeconds).toBe('number');
  });

  it('nextQuestion advances index', () => {
    useTestStore.getState().startTest(25);
    expect(useTestStore.getState().currentIndex).toBe(0);
    useTestStore.getState().nextQuestion();
    expect(useTestStore.getState().currentIndex).toBe(1);
  });

  it('nextQuestion does not exceed question count', () => {
    useTestStore.getState().startTest(25);
    for (let i = 0; i < 100; i++) {
      useTestStore.getState().nextQuestion();
    }
    expect(useTestStore.getState().currentIndex).toBe(71);
  });

  it('previousQuestion goes back', () => {
    useTestStore.getState().startTest(25);
    useTestStore.getState().nextQuestion();
    useTestStore.getState().nextQuestion();
    useTestStore.getState().previousQuestion();
    expect(useTestStore.getState().currentIndex).toBe(1);
  });

  it('previousQuestion does not go below 0', () => {
    useTestStore.getState().startTest(25);
    useTestStore.getState().previousQuestion();
    expect(useTestStore.getState().currentIndex).toBe(0);
  });

  it('submitTest produces valid result', () => {
    useTestStore.getState().startTest(25);
    const result = useTestStore.getState().submitTest();
    expect(result.age).toBe(25);
    expect(result.rawScore).toBeGreaterThanOrEqual(0);
    expect(result.rawScore).toBeLessThanOrEqual(72);
    expect(result.iqScore).toBeGreaterThanOrEqual(55);
    expect(result.iqScore).toBeLessThanOrEqual(145);
    expect(result.percentile).toBeGreaterThanOrEqual(0);
    expect(result.percentile).toBeLessThanOrEqual(100);
    expect(result.answers.length).toBe(72);
    expect(result.seriesScores).toHaveProperty('A');
    expect(result.seriesScores).toHaveProperty('E');
    expect(useTestStore.getState().finished).toBe(true);
  });

  it('submitTest respects answered questions', () => {
    useTestStore.getState().startTest(25);
    const qs = useTestStore.getState().questions;
    // Answer first 10 correctly
    for (let i = 0; i < 10; i++) {
      useTestStore.getState().answerQuestion(qs[i].id, qs[i].correctAnswer);
    }
    const result = useTestStore.getState().submitTest();
    expect(result.rawScore).toBeGreaterThanOrEqual(10);
  });

  it('resetTest clears all state', () => {
    useTestStore.getState().startTest(25);
    useTestStore.getState().answerQuestion('A1', 1);
    useTestStore.getState().resetTest();
    const state = useTestStore.getState();
    expect(state.questions.length).toBe(0);
    expect(state.age).toBe(0);
    expect(state.answers).toEqual({});
    expect(state.result).toBeNull();
    expect(state.finished).toBe(false);
  });
});
