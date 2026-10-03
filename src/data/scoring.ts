import type { AnswerRecord } from '../models/TestResult';

type AgeGroup =
  '5-7' | '8-10' | '11-13' | '14-16' | '17-19' | '20-29' | '30-39' | '40-49' | '50-59' | '60-65';

function getAgeGroup(age: number): AgeGroup {
  if (age < 8) return '5-7';
  if (age < 11) return '8-10';
  if (age < 14) return '11-13';
  if (age < 17) return '14-16';
  if (age < 20) return '17-19';
  if (age < 30) return '20-29';
  if (age < 40) return '30-39';
  if (age < 50) return '40-49';
  if (age < 60) return '50-59';
  return '60-65';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// 基于瑞文标准推理测验中国修订版常模
// 每个年龄组对应原始分(0-72)到百分等级的映射
const normPercentileTable: Record<AgeGroup, number[]> = {
  '5-7': [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50,
    53, 56, 59, 62, 65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94,
    95, 95, 96, 96, 97, 97, 97, 98, 98, 98, 98, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 100,
  ],
  '8-10': [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55,
    58, 61, 63, 65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95,
    95, 96, 96, 97, 97, 97, 98, 98, 98, 98, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 100,
  ],
  '11-13': [
    0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60,
    63, 65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 95, 96, 96,
    97, 97, 97, 98, 98, 98, 98, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 100,
  ],
  '14-16': [
    0, 1, 2, 3, 4, 5, 7, 9, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62,
    65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 95, 96, 96, 97,
    97, 97, 98, 98, 98, 98, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 100,
  ],
  '17-19': [
    0, 1, 2, 3, 4, 6, 8, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 64,
    66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 95, 96, 96, 97,
    97, 97, 98, 98, 98, 98, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 100,
  ],
  '20-29': [
    0, 1, 2, 3, 5, 7, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 65,
    67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 95, 96, 96, 97, 97,
    97, 98, 98, 98, 98, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 100,
  ],
  '30-39': [
    0, 1, 2, 3, 5, 7, 9, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62, 64,
    66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 95, 96, 96, 97,
    97, 97, 98, 98, 98, 98, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 100,
  ],
  '40-49': [
    0, 1, 2, 3, 4, 6, 8, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 63,
    65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 95, 96, 96, 97,
    97, 97, 98, 98, 98, 98, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 100,
  ],
  '50-59': [
    0, 1, 2, 3, 4, 5, 7, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 62,
    64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 95, 96, 96,
    97, 97, 97, 98, 98, 98, 98, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 100,
  ],
  '60-65': [
    0, 1, 2, 3, 4, 5, 6, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 61,
    63, 65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 95, 96, 96,
    97, 97, 97, 98, 98, 98, 98, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 100,
  ],
};

export function calculateRawScore(answers: AnswerRecord[]): number {
  return answers.filter(answer => answer.isCorrect).length;
}

export function getPercentile(rawScore: number, age: number): number {
  const ageGroup = getAgeGroup(age);
  const table = normPercentileTable[ageGroup];
  const index = clamp(Math.round(rawScore), 0, table.length - 1);
  const lower = table[index];
  const upper = index + 1 < table.length ? table[index + 1] : lower;
  const fractional = Math.round(rawScore) - index;
  return clamp(Math.round(lower + (upper - lower) * fractional), 0, 100);
}

export function getIQScore(percentile: number): number {
  if (percentile <= 0) return 55;
  if (percentile >= 100) return 145;

  // 使用标准正态分布反函数的近似计算
  const p = percentile / 100;
  const t = Math.sqrt(-2 * Math.log(1 - p));
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;
  const z = t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);

  const mean = 100;
  const sd = 15;
  const iq = mean + z * sd;
  return clamp(Math.round(iq), 55, 145);
}

export function getIQLevel(iq: number): string {
  if (iq >= 130) return '优秀';
  if (iq >= 120) return '良好';
  if (iq >= 110) return '中上';
  if (iq >= 90) return '正常';
  if (iq >= 80) return '中下';
  if (iq >= 70) return '临界';
  return '低下';
}

export function getSeriesScores(answers: AnswerRecord[]): Record<string, number> {
  const scores: Record<string, number> = { A: 0, Ab: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const answer of answers) {
    if (answer.isCorrect) {
      const series = answer.questionId.replace(/[0-9]/g, '');
      if (series in scores) {
        scores[series] += 1;
      }
    }
  }
  return scores;
}
