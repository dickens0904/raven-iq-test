import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CellRenderer from '../../components/CellRenderer';
import type { MatrixCell } from '../../models/Question';

describe('CellRenderer advanced', () => {
  describe('all shape types', () => {
    const shapes = [
      'circle',
      'square',
      'triangle',
      'diamond',
      'cross',
      'line',
      'pentagon',
      'hexagon',
    ] as const;
    for (const type of shapes) {
      it(`renders ${type} without error`, () => {
        const cell: MatrixCell = {
          shapes: [{ type, fill: 'solid', color: 'black', x: 0.5, y: 0.5, size: 0.7 }],
        };
        const { container } = render(<CellRenderer cell={cell} />);
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
        // Should have at least one rendered shape element
        const shapes = svg!.querySelectorAll('circle, path');
        expect(shapes.length).toBeGreaterThanOrEqual(1);
      });
    }
  });

  describe('all fill types', () => {
    const fills = ['solid', 'empty', 'striped', 'dotted'] as const;
    for (const fill of fills) {
      it(`renders ${fill} fill correctly`, () => {
        const cell: MatrixCell = {
          shapes: [{ type: 'square', fill, color: 'black', x: 0.5, y: 0.5, size: 0.7 }],
        };
        const { container } = render(<CellRenderer cell={cell} />);
        expect(container.querySelector('svg')).toBeTruthy();
      });
    }
  });

  describe('all colors', () => {
    const colors = ['black', 'white', 'gray'] as const;
    for (const color of colors) {
      it(`renders ${color} color`, () => {
        const cell: MatrixCell = {
          shapes: [{ type: 'circle', fill: 'solid', color, x: 0.5, y: 0.5, size: 0.7 }],
        };
        const { container } = render(<CellRenderer cell={cell} />);
        expect(container.querySelector('svg')).toBeTruthy();
      });
    }
  });

  describe('rotation', () => {
    it('renders shape with rotation', () => {
      const cell: MatrixCell = {
        shapes: [
          {
            type: 'square',
            fill: 'solid',
            color: 'black',
            x: 0.5,
            y: 0.5,
            size: 0.7,
            rotation: 45,
          },
        ],
      };
      const { container } = render(<CellRenderer cell={cell} />);
      const path = container.querySelector('path');
      expect(path?.getAttribute('transform')).toContain('rotate(45)');
    });

    it('renders shape without rotation', () => {
      const cell: MatrixCell = {
        shapes: [{ type: 'square', fill: 'solid', color: 'black', x: 0.5, y: 0.5, size: 0.7 }],
      };
      const { container } = render(<CellRenderer cell={cell} />);
      const path = container.querySelector('path');
      expect(path?.getAttribute('transform')).not.toContain('rotate');
    });
  });

  describe('multi-shape cells', () => {
    it('renders 3 shapes in one cell', () => {
      const cell: MatrixCell = {
        shapes: [
          { type: 'circle', fill: 'solid', color: 'black', x: 0.3, y: 0.3, size: 0.3 },
          { type: 'square', fill: 'empty', color: 'gray', x: 0.7, y: 0.3, size: 0.3 },
          { type: 'triangle', fill: 'solid', color: 'black', x: 0.5, y: 0.7, size: 0.3 },
        ],
      };
      const { container } = render(<CellRenderer cell={cell} />);
      const svgElements = container.querySelectorAll('circle, path');
      expect(svgElements.length).toBe(3);
    });
  });

  describe('line shape', () => {
    it('renders line with stroke', () => {
      const cell: MatrixCell = {
        shapes: [{ type: 'line', fill: 'solid', color: 'black', x: 0.5, y: 0.5, size: 0.8 }],
      };
      const { container } = render(<CellRenderer cell={cell} />);
      const path = container.querySelector('path');
      expect(path).toBeTruthy();
      expect(path?.getAttribute('stroke')).toBeTruthy();
    });
  });

  describe('pattern definitions', () => {
    it('creates stripe pattern for striped fill', () => {
      const cell: MatrixCell = {
        shapes: [{ type: 'square', fill: 'striped', color: 'black', x: 0.5, y: 0.5, size: 0.7 }],
      };
      const { container } = render(<CellRenderer cell={cell} parentIndex={5} />);
      const pattern = container.querySelector('pattern');
      expect(pattern).toBeTruthy();
      expect(pattern?.id).toContain('stripe');
    });

    it('creates dot pattern for dotted fill', () => {
      const cell: MatrixCell = {
        shapes: [{ type: 'square', fill: 'dotted', color: 'gray', x: 0.5, y: 0.5, size: 0.7 }],
      };
      const { container } = render(<CellRenderer cell={cell} parentIndex={3} />);
      const pattern = container.querySelector('pattern');
      expect(pattern).toBeTruthy();
      expect(pattern?.id).toContain('dot');
    });

    it('no patterns for solid fill', () => {
      const cell: MatrixCell = {
        shapes: [{ type: 'square', fill: 'solid', color: 'black', x: 0.5, y: 0.5, size: 0.7 }],
      };
      const { container } = render(<CellRenderer cell={cell} />);
      expect(container.querySelector('pattern')).toBeNull();
    });
  });

  describe('SVG attributes', () => {
    it('uses parentIndex in pattern IDs', () => {
      const cell: MatrixCell = {
        shapes: [{ type: 'square', fill: 'striped', color: 'black', x: 0.5, y: 0.5, size: 0.7 }],
      };
      const { container: c1 } = render(<CellRenderer cell={cell} parentIndex={0} />);
      const { container: c2 } = render(<CellRenderer cell={cell} parentIndex={99} />);
      const p1 = c1.querySelector('pattern')?.id;
      const p2 = c2.querySelector('pattern')?.id;
      expect(p1).not.toBe(p2);
    });
  });
});
