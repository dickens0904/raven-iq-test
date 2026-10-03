import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useTestStore } from '../stores/testStore';
import { useHistoryStore } from '../stores/historyStore';

// App component has its own BrowserRouter, so we cannot wrap in MemoryRouter.
// We test it in the default route (home page).
import App from '../App';

describe('App routing', () => {
  beforeEach(() => {
    useTestStore.getState().resetTest();
    useHistoryStore.getState().clearHistory();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(document.querySelector('.layout')).toBeTruthy();
  });

  it('renders home page at default route', () => {
    render(<App />);
    expect(screen.getByText('瑞文标准推理测验')).toBeTruthy();
  });

  it('has navigation header', () => {
    render(<App />);
    expect(screen.getByText('瑞文推理测验')).toBeTruthy();
  });

  it('has bottom navigation', () => {
    render(<App />);
    const nav = document.querySelector('.bottom-nav');
    expect(nav).toBeTruthy();
  });

  it('has 4 nav links in header', () => {
    render(<App />);
    const navLinks = document.querySelectorAll('.nav-link');
    expect(navLinks.length).toBe(4);
  });

  it('has 4 bottom nav items', () => {
    render(<App />);
    const items = document.querySelectorAll('.bottom-nav__item');
    expect(items.length).toBe(4);
  });
});
