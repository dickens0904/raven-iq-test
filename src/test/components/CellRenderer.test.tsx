import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CellRenderer from '../../components/CellRenderer';
import type { MatrixCell } from '../../models/Question';

function makeCell(type: string = 'circle'): MatrixCell {
  return {
    shapes: [{ type: type as any, fill: 'solid', color: 'black', x: 0.5, y: 0.5, size: 0.7 }],
  };
}

describe('CellRenderer', () => {
  it('renders an SVG element', () => {
    const { container } = render(<CellRenderer cell={makeCell()} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('uses custom size', () => {
    const { container } = render(<CellRenderer cell={makeCell()} size={120} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('120');
    expect(svg?.getAttribute('height')).toBe('120');
  });

  it('renders circle shape', () => {
    const { container } = render(<CellRenderer cell={makeCell('circle')} />);
    expect(container.querySelector('circle')).toBeTruthy();
  });

  it('renders square as path', () => {
    const { container } = render(<CellRenderer cell={makeCell('square')} />);
    expect(container.querySelector('path')).toBeTruthy();
  });

  it('renders triangle as path', () => {
    const { container } = render(<CellRenderer cell={makeCell('triangle')} />);
    expect(container.querySelector('path')).toBeTruthy();
  });

  it('renders striped pattern defs', () => {
    const cell: MatrixCell = {
      shapes: [{ type: 'square', fill: 'striped', color: 'black', x: 0.5, y: 0.5, size: 0.7 }],
    };
    const { container } = render(<CellRenderer cell={cell} parentIndex={0} />);
    expect(container.querySelector('pattern')).toBeTruthy();
  });

  it('renders dotted pattern defs', () => {
    const cell: MatrixCell = {
      shapes: [{ type: 'square', fill: 'dotted', color: 'gray', x: 0.5, y: 0.5, size: 0.7 }],
    };
    const { container } = render(<CellRenderer cell={cell} parentIndex={1} />);
    expect(container.querySelector('pattern')).toBeTruthy();
  });

  it('renders multiple shapes in one cell', () => {
    const cell: MatrixCell = {
      shapes: [
        { type: 'circle', fill: 'solid', color: 'black', x: 0.3, y: 0.5, size: 0.4 },
        { type: 'square', fill: 'empty', color: 'gray', x: 0.7, y: 0.5, size: 0.4 },
      ],
    };
    const { container } = render(<CellRenderer cell={cell} />);
    const svgs = container.querySelectorAll('circle, path');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });
});
