export interface Question {
  id: string; // e.g. "A1", "Ab3", "B5", "C8", "D12", "E10"
  series: 'A' | 'Ab' | 'B' | 'C' | 'D' | 'E';
  number: number; // 1-12 within each series
  optionsCount: number; // 6 for A/Ab/B, 8 for C/D/E
  correctAnswer: number; // 0-indexed answer
  // SVG-based pattern data for rendering the matrix
  matrixCells: MatrixCell[]; // 8 cells (top-left to bottom-right, excluding missing)
  missingCellPosition: number; // which cell is missing (0-8)
  options: MatrixCell[]; // 6 or 8 option cells
}

export interface MatrixCell {
  shapes: Shape[];
}

export type ShapeType =
  'circle' | 'square' | 'triangle' | 'diamond' | 'cross' | 'line' | 'pentagon' | 'hexagon';

export interface Shape {
  type: ShapeType;
  fill: 'solid' | 'empty' | 'striped' | 'dotted';
  color: 'black' | 'white' | 'gray';
  x: number; // 0-1 relative position
  y: number; // 0-1 relative position
  size: number; // 0-1 relative size
  rotation?: number; // degrees
}
