import type { Question, MatrixCell, Shape, ShapeType } from '../models/Question';

// ============================================================
// Seeded PRNG (LCG)
// ============================================================

function seededRandom(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

// ============================================================
// Shape & Cell helpers
// ============================================================

function makeShape(
  type: ShapeType,
  fill: Shape['fill'],
  color: Shape['color'],
  size = 0.7,
  rotation = 0
): Shape {
  return { type, fill, color, x: 0.5, y: 0.5, size, rotation };
}

function makeCell(
  type: ShapeType,
  fill: Shape['fill'],
  color: Shape['color'],
  size = 0.7,
  rotation = 0
): MatrixCell {
  return { shapes: [makeShape(type, fill, color, size, rotation)] };
}

function makeDualCell(
  t1: ShapeType,
  f1: Shape['fill'],
  c1: Shape['color'],
  t2: ShapeType,
  f2: Shape['fill'],
  c2: Shape['color'],
  size = 0.55
): MatrixCell {
  return {
    shapes: [makeShape(t1, f1, c1, size), makeShape(t2, f2, c2, size)],
  };
}

/** Pick an element from an array using the RNG. */
function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Pick n unique elements from arr. */
function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const copy = arr.slice();
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

// ============================================================
// Fisher-Yates shuffle (in-place)
// ============================================================

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

// ============================================================
// Cell identity helper (for uniqueness checks)
// ============================================================

function cellKey(c: MatrixCell): string {
  return JSON.stringify(c);
}

/** Ensure all cells in the list are unique; dedup if needed. */
function uniqueCells(cells: MatrixCell[]): MatrixCell[] {
  const seen = new Set<string>();
  const result: MatrixCell[] = [];
  for (const c of cells) {
    const k = cellKey(c);
    if (!seen.has(k)) {
      seen.add(k);
      result.push(c);
    }
  }
  return result;
}

/** Build unique distractors that differ from `correct` and from each other. */
function buildDistractors(correct: MatrixCell, pool: MatrixCell[], needed: number): MatrixCell[] {
  const correctKey = cellKey(correct);
  const seen = new Set<string>([correctKey]);
  const result: MatrixCell[] = [];
  for (const c of pool) {
    if (result.length >= needed) break;
    const k = cellKey(c);
    if (!seen.has(k)) {
      seen.add(k);
      result.push(c);
    }
  }
  // If we still don't have enough, generate variations
  const extraTypes: ShapeType[] = [
    'circle',
    'square',
    'triangle',
    'diamond',
    'cross',
    'pentagon',
    'hexagon',
  ];
  const extraFills: Shape['fill'][] = ['solid', 'empty', 'striped'];
  const extraColors: Shape['color'][] = ['black', 'gray'];
  let seed = 42;
  while (result.length < needed) {
    seed++;
    const rng = seededRandom(seed);
    const c = makeCell(
      pick(extraTypes, rng),
      pick(extraFills, rng),
      pick(extraColors, rng),
      0.5 + rng() * 0.3
    );
    const k = cellKey(c);
    if (!seen.has(k)) {
      seen.add(k);
      result.push(c);
    }
  }
  return result;
}

/** Build the final options array: correct + distractors, shuffled, then find correct index. */
function buildOptions(
  correct: MatrixCell,
  distractorPool: MatrixCell[],
  count: number,
  rng: () => number
): { options: MatrixCell[]; correctAnswer: number } {
  const distractors = buildDistractors(correct, distractorPool, count - 1);
  const all = shuffle([correct, ...distractors], rng);
  const correctAnswer = all.findIndex(c => cellKey(c) === cellKey(correct));
  return { options: all, correctAnswer };
}

// ============================================================
// Shape / fill / color arrays for generation
// ============================================================

const SHAPE_TYPES: ShapeType[] = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'cross',
  'pentagon',
  'hexagon',
];
const FILLS: Shape['fill'][] = ['solid', 'empty', 'striped'];
const COLORS: Shape['color'][] = ['black', 'gray'];

/** Number of series for computing missingCellPosition. */
const SERIES_ORDER: Question['series'][] = ['A', 'Ab', 'B', 'C', 'D', 'E'];

function seriesIndex(series: Question['series']): number {
  return SERIES_ORDER.indexOf(series);
}

// ============================================================
// Series A: Shape identity pattern (easiest)
//
// Rule: Each row has the same shape type.
//       Each column has a specific fill/color combination.
//       The missing cell can be deduced from its row's shape
//       and its column's fill/color.
// ============================================================

function generateSeriesA(
  _number: number,
  rng: () => number
): {
  grid: MatrixCell[][];
  missingPos: number;
  distractorPool: MatrixCell[];
} {
  // Choose 3 shape types for the 3 rows
  const rowShapes = pickN(SHAPE_TYPES, 3, rng);

  // Choose 3 (fill, color) combos for the 3 columns
  const colAttrs: [Shape['fill'], Shape['color']][] = [
    ['solid', 'black'],
    ['empty', 'black'],
    ['solid', 'gray'],
  ];
  // Slight randomization: maybe swap order
  if (rng() > 0.5) {
    colAttrs.push(colAttrs.shift()!); // rotate
  }
  if (rng() > 0.5) {
    [colAttrs[1], colAttrs[2]] = [colAttrs[2], colAttrs[1]];
  }

  const grid: MatrixCell[][] = [];
  const pool: MatrixCell[] = [];

  for (let r = 0; r < 3; r++) {
    const row: MatrixCell[] = [];
    for (let c = 0; c < 3; c++) {
      const cell = makeCell(rowShapes[r], colAttrs[c][0], colAttrs[c][1]);
      row.push(cell);
      pool.push(cell);
    }
    grid.push(row);
  }

  // Build distractor pool with attribute swaps
  for (const shape of rowShapes) {
    for (const attr of colAttrs) {
      pool.push(makeCell(shape, attr[0], attr[1]));
    }
  }
  // Add some wrong-shape, wrong-fill combinations
  for (let i = 0; i < 3; i++) {
    const wrongShape = pick(
      SHAPE_TYPES.filter(s => !rowShapes.includes(s)),
      rng
    );
    const wrongAttr = pick(colAttrs, rng);
    pool.push(makeCell(wrongShape, wrongAttr[0], wrongAttr[1]));
    // Wrong shape but right fill for a different row
    pool.push(makeCell(wrongShape, colAttrs[i % 3][0], colAttrs[i % 3][1]));
  }

  return { grid, missingPos: -1, distractorPool: uniqueCells(pool) };
}

// ============================================================
// Series Ab: Shape progression
//
// Rule: Across each row, shapes follow a numeric progression
//       (e.g. 3-sided → 4-sided → 5-sided). The progression
//       seed differs by row.
// ============================================================

function generateSeriesAb(
  _number: number,
  rng: () => number
): {
  grid: MatrixCell[][];
  missingPos: number;
  distractorPool: MatrixCell[];
} {
  // Use shapes ordered by "sides" approximately:
  // circle(1?), triangle(3), square(4), pentagon(5), hexagon(6), diamond(4?), cross(?)
  // Let's define a side-count ordering for progression
  const orderedShapes: ShapeType[] = [
    'triangle',
    'square',
    'pentagon',
    'hexagon',
    'circle',
    'diamond',
    'cross',
  ];

  // Each row starts at a different offset into the shape list
  const rowStarts = [0, 3, 5].map(s => (s + Math.floor(rng() * 2)) % orderedShapes.length);
  const step = 1 + Math.floor(rng() * 2); // step 1 or 2

  const colFills = pickN(FILLS, 3, rng);
  const colColors: Shape['color'][] = ['black', 'black', 'gray'];

  const grid: MatrixCell[][] = [];
  const pool: MatrixCell[] = [];

  for (let r = 0; r < 3; r++) {
    const row: MatrixCell[] = [];
    for (let c = 0; c < 3; c++) {
      const shapeIdx = (rowStarts[r] + c * step) % orderedShapes.length;
      const cell = makeCell(orderedShapes[shapeIdx], colFills[c], colColors[c % 3]);
      row.push(cell);
      pool.push(cell);
    }
    grid.push(row);
  }

  // Distractors: wrong step, wrong starting shape
  for (let i = 0; i < 10; i++) {
    const wrongShape = pick(orderedShapes, rng);
    const wrongFill = pick(FILLS, rng);
    const wrongColor = pick(COLORS, rng);
    pool.push(makeCell(wrongShape, wrongFill, wrongColor));
  }

  return { grid, missingPos: -1, distractorPool: uniqueCells(pool) };
}

// ============================================================
// Series B: Attribute combination
//
// Rule: Row determines fill, column determines shape type.
//       Fill and shape type vary independently, forming a
//       grid of all combinations.
// ============================================================

function generateSeriesB(
  _number: number,
  rng: () => number
): {
  grid: MatrixCell[][];
  missingPos: number;
  distractorPool: MatrixCell[];
} {
  const rowFills = pickN(FILLS, 3, rng);
  const colShapes = pickN(SHAPE_TYPES, 3, rng);
  const rowColors: Shape['color'][] = ['black', 'black', 'gray'];
  if (rng() > 0.5) [rowColors[0], rowColors[2]] = [rowColors[2], rowColors[0]];

  const grid: MatrixCell[][] = [];
  const pool: MatrixCell[] = [];

  for (let r = 0; r < 3; r++) {
    const row: MatrixCell[] = [];
    for (let c = 0; c < 3; c++) {
      const cell = makeCell(colShapes[c], rowFills[r], rowColors[r]);
      row.push(cell);
      pool.push(cell);
    }
    grid.push(row);
  }

  // Distractors: wrong combination of fill+shape
  for (let i = 0; i < 12; i++) {
    const wrongFill = pick(FILLS, rng);
    const wrongShape = pick(SHAPE_TYPES, rng);
    const wrongColor = pick(COLORS, rng);
    pool.push(makeCell(wrongShape, wrongFill, wrongColor));
  }

  return { grid, missingPos: -1, distractorPool: uniqueCells(pool) };
}

// ============================================================
// Series C: Arithmetic / XOR pattern
//
// Rule: Row 3 = Row 1 XOR Row 2.
//       When the same shape appears in the same position in
//       both row 1 and row 2, it cancels out (disappears).
//       When shapes differ, both appear in row 3.
// ============================================================

function generateSeriesC(
  _number: number,
  rng: () => number
): {
  grid: MatrixCell[][];
  missingPos: number;
  distractorPool: MatrixCell[];
} {
  const grid: MatrixCell[][] = [];

  // Generate row 1 and row 2 with single shapes
  for (let r = 0; r < 2; r++) {
    const row: MatrixCell[] = [];
    for (let c = 0; c < 3; c++) {
      row.push(makeCell(pick(SHAPE_TYPES, rng), pick(FILLS, rng), pick(COLORS, rng), 0.6));
    }
    grid.push(row);
  }

  // Row 3: XOR logic - same shape+fill+color cancels, otherwise combine
  const row3: MatrixCell[] = [];
  for (let c = 0; c < 3; c++) {
    const cell1 = grid[0][c];
    const cell2 = grid[1][c];
    const s1 = cell1.shapes[0];
    const s2 = cell2.shapes[0];

    if (s1.type === s2.type && s1.fill === s2.fill && s1.color === s2.color) {
      // Cancel out → empty cell (single small dot to indicate empty)
      row3.push(makeCell('circle', 'empty', 'gray', 0.2));
    } else {
      // Both shapes appear
      row3.push(makeDualCell(s1.type, s1.fill, s1.color, s2.type, s2.fill, s2.color, 0.45));
    }
  }
  grid.push(row3);

  // Distractors: plausible wrong combinations
  const pool: MatrixCell[] = [];
  for (let c = 0; c < 3; c++) {
    const s1 = grid[0][c].shapes[0];
    const s2 = grid[1][c].shapes[0];
    // Only one of the two shapes (missing one)
    pool.push(makeCell(s1.type, s1.fill, s1.color, 0.6));
    pool.push(makeCell(s2.type, s2.fill, s2.color, 0.6));
    // Swapped order dual
    pool.push(makeDualCell(s2.type, s2.fill, s2.color, s1.type, s1.fill, s1.color, 0.45));
  }
  // Extra random distractors
  for (let i = 0; i < 6; i++) {
    pool.push(makeCell(pick(SHAPE_TYPES, rng), pick(FILLS, rng), pick(COLORS, rng), 0.6));
  }

  return { grid, missingPos: -1, distractorPool: uniqueCells(pool) };
}

// ============================================================
// Series D: Rotation pattern
//
// Rule: Each shape rotates 90° clockwise across columns.
//       Col 1: 0°, Col 2: 90°, Col 3: 180°.
//       Fill and color remain constant across a row.
// ============================================================

function generateSeriesD(
  _number: number,
  rng: () => number
): {
  grid: MatrixCell[][];
  missingPos: number;
  distractorPool: MatrixCell[];
} {
  const grid: MatrixCell[][] = [];
  const pool: MatrixCell[] = [];

  const rowShapes = pickN(SHAPE_TYPES, 3, rng);
  const rowFills = pickN(FILLS, 3, rng);
  const rowColors = pickN(COLORS, 3, rng);

  for (let r = 0; r < 3; r++) {
    const row: MatrixCell[] = [];
    for (let c = 0; c < 3; c++) {
      const rotation = c * 90;
      const cell = makeCell(rowShapes[r], rowFills[r], rowColors[r], 0.7, rotation);
      row.push(cell);
      pool.push(cell);
    }
    grid.push(row);
  }

  // Distractors: wrong rotation, wrong shape, wrong fill
  for (let r = 0; r < 3; r++) {
    for (let rot = 0; rot < 3; rot++) {
      pool.push(makeCell(rowShapes[r], rowFills[r], rowColors[r], 0.7, rot * 90));
    }
  }
  // Wrong shapes with same rotation pattern
  for (let i = 0; i < 6; i++) {
    const wrongShape = pick(
      SHAPE_TYPES.filter(s => !rowShapes.includes(s)),
      rng
    );
    const wrongRotation = Math.floor(rng() * 4) * 90;
    pool.push(makeCell(wrongShape, pick(FILLS, rng), pick(COLORS, rng), 0.7, wrongRotation));
  }

  return { grid, missingPos: -1, distractorPool: uniqueCells(pool) };
}

// ============================================================
// Series E: Multi-rule pattern (hardest)
//
// Rule: Multiple simultaneous rules:
//   1) Shape type progresses across columns (row-specific progression)
//   2) Fill alternates or cycles across rows
//   3) Size increases or decreases down columns
// ============================================================

function generateSeriesE(
  _number: number,
  rng: () => number
): {
  grid: MatrixCell[][];
  missingPos: number;
  distractorPool: MatrixCell[];
} {
  const orderedShapes: ShapeType[] = [
    'circle',
    'triangle',
    'square',
    'diamond',
    'pentagon',
    'hexagon',
  ];
  const rowShapeStarts = [0, 2, 4].map(s => (s + Math.floor(rng() * 2)) % orderedShapes.length);
  const shapeStep = 1;

  // Fill cycles: row 0 = solid, row 1 = empty, row 2 = striped
  const rowFillsCycle: Shape['fill'][] = ['solid', 'empty', 'striped'];

  // Size increases down rows
  const rowSizes = [0.5, 0.6, 0.7];

  // Color is constant per column
  const colColors: Shape['color'][] = ['black', 'black', 'gray'];

  const grid: MatrixCell[][] = [];
  const pool: MatrixCell[] = [];

  for (let r = 0; r < 3; r++) {
    const row: MatrixCell[] = [];
    for (let c = 0; c < 3; c++) {
      const shapeIdx = (rowShapeStarts[r] + c * shapeStep) % orderedShapes.length;
      const cell = makeCell(orderedShapes[shapeIdx], rowFillsCycle[r], colColors[c], rowSizes[r]);
      row.push(cell);
      pool.push(cell);
    }
    grid.push(row);
  }

  // Distractors: break one or more rules
  for (let i = 0; i < 12; i++) {
    const wrongShape = pick(orderedShapes, rng);
    const wrongFill = pick(FILLS, rng);
    const wrongColor = pick(COLORS, rng);
    pool.push(makeCell(wrongShape, wrongFill, wrongColor, 0.3 + rng() * 0.5));
  }

  return { grid, missingPos: -1, distractorPool: uniqueCells(pool) };
}

// ============================================================
// Main generation logic
// ============================================================

type Generator = (
  number: number,
  rng: () => number
) => {
  grid: MatrixCell[][];
  missingPos: number;
  distractorPool: MatrixCell[];
};

const GENERATORS: Record<Question['series'], Generator> = {
  A: generateSeriesA,
  Ab: generateSeriesAb,
  B: generateSeriesB,
  C: generateSeriesC,
  D: generateSeriesD,
  E: generateSeriesE,
};

function optionsCountFor(series: Question['series']): number {
  return series === 'A' || series === 'Ab' || series === 'B' ? 6 : 8;
}

function generateQuestion(series: Question['series'], number: number, seed: number): Question {
  const rng = seededRandom(seed);
  const generator = GENERATORS[series];
  const { grid, distractorPool } = generator(number, rng);

  // Determine missing position: varies per question
  const si = seriesIndex(series);
  const missingPos = (si * 12 + number - 1) % 9;

  // Flatten grid to row-major array of 9 cells
  const allCells: MatrixCell[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      allCells.push(grid[r][c]);
    }
  }

  // The correct answer is the cell at the missing position
  const correctAnswer = allCells[missingPos];

  // matrixCells = all 9 cells excluding the missing one, in row-major order
  const matrixCells: MatrixCell[] = allCells.filter((_, i) => i !== missingPos);

  // Build options
  const count = optionsCountFor(series);
  const { options, correctAnswer: correctIdx } = buildOptions(
    correctAnswer,
    distractorPool,
    count,
    rng
  );

  return {
    id: `${series}${number}`,
    series,
    number,
    optionsCount: count,
    correctAnswer: correctIdx,
    matrixCells,
    missingCellPosition: missingPos,
    options,
  };
}

// ============================================================
// Generate all 72 questions
// ============================================================

const ALL_SERIES: Question['series'][] = ['A', 'Ab', 'B', 'C', 'D', 'E'];

function generateAllQuestions(): Question[] {
  const questions: Question[] = [];
  for (const series of ALL_SERIES) {
    for (let num = 1; num <= 12; num++) {
      // Unique seed per question: series_index * 1000 + number * 7 + salt
      const si = seriesIndex(series);
      const seed = si * 1000 + num * 7 + 31337;
      questions.push(generateQuestion(series, num, seed));
    }
  }
  return questions;
}

export const ALL_QUESTIONS: Question[] = generateAllQuestions();

export function getQuestion(id: string): Question | undefined {
  return ALL_QUESTIONS.find(question => question.id === id);
}

export function getAllQuestions(): Question[] {
  return ALL_QUESTIONS;
}
