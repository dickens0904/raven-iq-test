import { create } from 'zustand';
import type { Question } from '../models/Question';
import type { AnswerRecord, TestResult } from '../models/TestResult';
import { getAllQuestions } from '../data/questions';
import {
  calculateRawScore,
  getPercentile,
  getIQScore,
  getIQLevel,
  getSeriesScores,
} from '../data/scoring';

export interface TestAnswer {
  selectedAnswer: number;
  isCorrect: boolean;
  timeSeconds: number;
}

interface TestState {
  age: number;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, TestAnswer>;
  startedAt: number;
  questionStartedAt: number;
  finished: boolean;
  result: TestResult | null;
  startTest: (age: number) => void;
  answerQuestion: (questionId: string, answerIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitTest: () => TestResult;
  resetTest: () => void;
}

function nowSeconds(): number {
  return Math.round(Date.now() / 1000);
}

export const useTestStore = create<TestState>((set, get) => ({
  age: 0,
  questions: [],
  currentIndex: 0,
  answers: {},
  startedAt: 0,
  questionStartedAt: 0,
  finished: false,
  result: null,

  startTest: age => {
    set({
      age,
      questions: getAllQuestions(),
      currentIndex: 0,
      answers: {},
      startedAt: nowSeconds(),
      questionStartedAt: nowSeconds(),
      finished: false,
      result: null,
    });
  },

  answerQuestion: (questionId, answerIndex) => {
    const { questions, answers, questionStartedAt } = get();
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const timeSeconds = Math.max(1, nowSeconds() - questionStartedAt);
    const isCorrect = answerIndex === question.correctAnswer;
    const record: TestAnswer = { selectedAnswer: answerIndex, isCorrect, timeSeconds };

    set({ answers: { ...answers, [questionId]: record } });
  },

  nextQuestion: () => {
    const { currentIndex, questions, questionStartedAt } = get();
    const nextIndex = Math.min(currentIndex + 1, questions.length - 1);
    set({
      currentIndex: nextIndex,
      questionStartedAt: currentIndex === nextIndex ? questionStartedAt : nowSeconds(),
    });
  },

  previousQuestion: () => {
    const { currentIndex, questionStartedAt } = get();
    const prevIndex = Math.max(currentIndex - 1, 0);
    set({
      currentIndex: prevIndex,
      questionStartedAt: currentIndex === prevIndex ? questionStartedAt : nowSeconds(),
    });
  },

  submitTest: () => {
    const { age, questions, answers, startedAt } = get();
    const totalTimeSeconds = Math.max(1, nowSeconds() - startedAt);

    const answerRecords: AnswerRecord[] = questions.map(question => {
      const answer = answers[question.id];
      return {
        questionId: question.id,
        selectedAnswer: answer?.selectedAnswer ?? -1,
        isCorrect: answer?.isCorrect ?? false,
        timeSeconds: answer?.timeSeconds ?? 0,
      };
    });

    const rawScore = calculateRawScore(answerRecords);
    const percentile = getPercentile(rawScore, age);
    const iqScore = getIQScore(percentile);
    const iqLevel = getIQLevel(iqScore);
    const seriesScores = getSeriesScores(answerRecords) as TestResult['seriesScores'];

    const result: TestResult = {
      id: `test-${startedAt}`,
      date: new Date(startedAt * 1000).toISOString(),
      age,
      totalTimeSeconds,
      answers: answerRecords,
      rawScore,
      percentile,
      iqScore,
      iqLevel,
      seriesScores,
    };

    set({ finished: true, result });
    return result;
  },

  resetTest: () => {
    set({
      age: 0,
      questions: [],
      currentIndex: 0,
      answers: {},
      startedAt: 0,
      questionStartedAt: 0,
      finished: false,
      result: null,
    });
  },
}));
