import { useState, useCallback } from 'react';
import { useHistoryStore } from '../stores/historyStore';
import { formatTime } from '../utils/time';
import { exportResultToPDF } from '../utils/pdfExport';
import type { TestResult } from '../models/TestResult';

const SERIES_LABELS: Record<string, string> = {
  A: 'A 系列',
  Ab: 'Ab 系列',
  B: 'B 系列',
  C: 'C 系列',
  D: 'D 系列',
  E: 'E 系列',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

function HistoryDetail({ result }: { result: TestResult }) {
  const seriesEntries = Object.entries(result.seriesScores) as [string, number][];
  return (
    <div style={{ padding: 'var(--spacing-md) 0' }}>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-sm)' }}
      >
        {seriesEntries.map(([series, score]) => (
          <div
            key={series}
            className="text-center"
            style={{
              padding: 'var(--spacing-xs)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <p className="text-xs color-secondary">{SERIES_LABELS[series] ?? series}</p>
            <p className="text-sm font-bold color-primary">{score}/12</p>
          </div>
        ))}
      </div>
      <div className="flex-between mt-md text-sm color-secondary">
        <span>百分位：{result.percentile}%</span>
        <span>原始分：{result.rawScore}/72</span>
      </div>
    </div>
  );
}

export default function HistoryScreen() {
  const history = useHistoryStore(s => s.history);
  const clearHistory = useHistoryStore(s => s.clearHistory);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  }, []);

  if (history.length === 0) {
    return (
      <div className="main-content animate-fade-in">
        <div className="main-content__inner">
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <p className="empty-state__text">暂无历史记录</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content animate-fade-in">
      <div
        className="main-content__inner flex-col gap-lg"
        style={{ display: 'flex', maxWidth: 720, margin: '0 auto' }}
      >
        {/* Header */}
        <div className="flex-between">
          <h2 className="text-xl font-bold">
            历史记录
            <span
              className="text-sm font-medium color-secondary"
              style={{ marginLeft: 'var(--spacing-sm)' }}
            >
              共 {history.length} 条
            </span>
          </h2>
          <button className="btn btn--secondary" onClick={clearHistory}>
            清空历史
          </button>
        </div>

        {/* List */}
        <div className="history-list">
          {history.map(item => (
            <div key={item.id}>
              <div
                className="history-item"
                onClick={() => handleToggle(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle(item.id);
                  }
                }}
              >
                <div>
                  <p className="history-item__date">{formatDate(item.date)}</p>
                  <p className="text-sm color-secondary mt-xs">
                    年龄 {item.age} · 用时 {formatTime(item.totalTimeSeconds)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <span className="history-item__score">{item.iqScore}</span>
                  <span className="text-sm color-secondary">{item.iqLevel}</span>
                  <button
                    className="btn btn--secondary"
                    style={{
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      minHeight: 32,
                      fontSize: 'var(--font-size-xs)',
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      exportResultToPDF(item);
                    }}
                  >
                    导出
                  </button>
                </div>
              </div>
              {expandedId === item.id && <HistoryDetail result={item} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
