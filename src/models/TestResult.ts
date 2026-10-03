export interface TestResult {
  id: string;
  date: string; // ISO date string
  age: number;
  totalTimeSeconds: number;
  answers: AnswerRecord[];
  rawScore: number; // 0-72
  percentile: number; // 0-100
  iqScore: number;
  iqLevel: string; // 优秀/良好/正常/中下/低下
  seriesScores: {
    A: number;
    Ab: number;
    B: number;
    C: number;
    D: number;
    E: number;
  };
}

export interface AnswerRecord {
  questionId: string;
  selectedAnswer: number; // 0-indexed
  isCorrect: boolean;
  timeSeconds: number;
}
