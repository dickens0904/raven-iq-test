import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AdaptiveLayout from '../../components/AdaptiveLayout';

describe('AdaptiveLayout', () => {
  it('renders children', () => {
    const { container } = render(
      <AdaptiveLayout>
        <div data-testid="child">Hello</div>
      </AdaptiveLayout>
    );
    expect(container.querySelector('[data-testid="child"]')).toBeTruthy();
  });

  it('applies layout class', () => {
    const { container } = render(
      <AdaptiveLayout>
        <div />
      </AdaptiveLayout>
    );
    const layout = container.firstChild as HTMLElement;
    expect(layout.className).toMatch(/layout--/);
  });
});
