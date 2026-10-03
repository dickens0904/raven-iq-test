import { create } from 'zustand';
import type { TestResult } from '../models/TestResult';

const STORAGE_KEY = 'raven-iq-history';

function loadHistory(): TestResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TestResult[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: TestResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage 可能已满，静默失败
  }
}

interface HistoryState {
  history: TestResult[];
  addResult: (result: TestResult) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>(set => ({
  history: loadHistory(),

  addResult: result => {
    set(state => {
      // 去重：避免重复添加同一结果
      if (state.history.some(h => h.id === result.id)) {
        return state;
      }
      const updated = [result, ...state.history];
      saveHistory(updated);
      return { history: updated };
    });
  },

  clearHistory: () => {
    saveHistory([]);
    set({ history: [] });
  },
}));
