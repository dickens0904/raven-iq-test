import type { MatrixCell, Shape } from '../models/Question';

interface CellRendererProps {
  cell: MatrixCell;
  size?: number;
  parentIndex?: number;
}

const COLOR_MAP: Record<Shape['color'], string> = {
  black: '#202124',
  white: '#ffffff',
  gray: '#9aa0a6',
};

function getPath(type: Shape['type'], size: number): string {
  const r = size / 2;
  switch (type) {
    case 'circle':
      return ''; // handled separately
    case 'square':
      return `M${-r} ${-r} L${r} ${-r} L${r} ${r} L${-r} ${r} Z`;
    case 'triangle':
      return `M0 ${-r} L${r} ${r} L${-r} ${r} Z`;
    case 'diamond':
      return `M0 ${-r} L${r} 0 L0 ${r} L${-r} 0 Z`;
    case 'cross':
      return `M${-r * 0.3} ${-r} L${r * 0.3} ${-r} L${r * 0.3} ${-r * 0.3} L${r} ${-r * 0.3} L${r} ${r * 0.3} L${r * 0.3} ${r * 0.3} L${r * 0.3} ${r} L${-r * 0.3} ${r} L${-r * 0.3} ${r * 0.3} L${-r} ${r * 0.3} L${-r} ${-r * 0.3} L${-r * 0.3} ${-r * 0.3} Z`;
    case 'line':
      return `M${-r} 0 L${r} 0`;
    case 'pentagon': {
      const pts: string[] = [];
      for (let i = 0; i < 5; i++) {
        const angle = Math.PI / 2 + (2 * Math.PI * i) / 5;
        pts.push(`${r * Math.cos(angle)} ${-r * Math.sin(angle)}`);
      }
      return `M${pts.join(' L')} Z`;
    }
    case 'hexagon': {
      const pts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * i) / 3;
        pts.push(`${r * Math.cos(angle)} ${-r * Math.sin(angle)}`);
      }
      return `M${pts.join(' L')} Z`;
    }
    default:
      return '';
  }
}

function getFillProps(
  shape: Shape,
  index: number,
  parentIndex: number
): { fill: string; stroke: string; strokeWidth: number } {
  const color = COLOR_MAP[shape.color];
  switch (shape.fill) {
    case 'solid':
      return { fill: color, stroke: 'none', strokeWidth: 0 };
    case 'empty':
      return { fill: 'none', stroke: color, strokeWidth: 2 };
    case 'striped':
      return { fill: `url(#stripe-${parentIndex}-${index})`, stroke: 'none', strokeWidth: 0 };
    case 'dotted':
      return { fill: `url(#dot-${parentIndex}-${index})`, stroke: 'none', strokeWidth: 0 };
    default:
      return { fill: color, stroke: 'none', strokeWidth: 0 };
  }
}

function getPatternDefs(shapes: Shape[], parentIndex: number): React.ReactNode[] {
  return shapes.map((shape, i) => {
    if (shape.fill === 'striped') {
      return (
        <pattern
          key={`stripe-${parentIndex}-${i}`}
          id={`stripe-${parentIndex}-${i}`}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="3" height="6" fill={COLOR_MAP[shape.color]} />
        </pattern>
      );
    }
    if (shape.fill === 'dotted') {
      return (
        <pattern
          key={`dot-${parentIndex}-${i}`}
          id={`dot-${parentIndex}-${i}`}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="3" cy="3" r="1.5" fill={COLOR_MAP[shape.color]} />
        </pattern>
      );
    }
    return null;
  });
}

function renderShape(shape: Shape, index: number, cellSize: number, parentIndex: number) {
  const cx = shape.x * cellSize;
  const cy = shape.y * cellSize;
  const shapeSize = shape.size * cellSize * 0.45;
  const fillProps = getFillProps(shape, index, parentIndex);
  const transform = shape.rotation
    ? `translate(${cx}, ${cy}) rotate(${shape.rotation})`
    : `translate(${cx}, ${cy})`;

  if (shape.type === 'circle') {
    return (
      <circle key={index} cx={0} cy={0} r={shapeSize / 2} transform={transform} {...fillProps} />
    );
  }

  if (shape.type === 'line') {
    return (
      <path
        key={index}
        d={getPath(shape.type, shapeSize)}
        transform={transform}
        fill="none"
        stroke={COLOR_MAP[shape.color]}
        strokeWidth={2}
        strokeLinecap="round"
      />
    );
  }

  const d = getPath(shape.type, shapeSize);
  if (!d) return null;

  return <path key={index} d={d} transform={transform} {...fillProps} />;
}

export default function CellRenderer({ cell, size = 80, parentIndex = 0 }: CellRendererProps) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <defs>{getPatternDefs(cell.shapes, parentIndex)}</defs>
      {cell.shapes.map((shape, i) => renderShape(shape, i, size, parentIndex))}
    </svg>
  );
}
