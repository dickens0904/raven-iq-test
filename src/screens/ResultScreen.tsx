import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTestStore } from '../stores/testStore';
import { useHistoryStore } from '../stores/historyStore';
import { formatTime } from '../utils/time';
import { exportResultToPDF } from '../utils/pdfExport';

const SERIES_LABELS: Record<string, string> = {
  A: 'A 系列',
  Ab: 'Ab 系列',
  B: 'B 系列',
  C: 'C 系列',
  D: 'D 系列',
  E: 'E 系列',
};

export default function ResultScreen() {
  const result = useTestStore(s => s.result);
  const resetTest = useTestStore(s => s.resetTest);
  const addResult = useHistoryStore(s => s.addResult);
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  // Auto-save on mount to prevent data loss
  useEffect(() => {
    if (result && !saved) {
      addResult(result);
      setSaved(true);
    }
  }, [result, saved, addResult]);

  const handleSave = useCallback(() => {
    if (!result || saved) return;
    addResult(result);
    setSaved(true);
  }, [result, saved, addResult]);

  const handleRetry = useCallback(() => {
    resetTest();
    navigate('/');
  }, [resetTest, navigate]);

  const handleExport = useCallback(() => {
    if (!result) return;
    exportResultToPDF(result);
  }, [result]);

  if (!result) {
    return (
      <div className="main-content animate-fade-in">
        <div className="main-content__inner">
          <div className="empty-state">
            <div className="empty-state__icon">📊</div>
            <p className="empty-state__text">暂无测试结果</p>
            <Link to="/" className="btn btn--primary">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const seriesEntries = Object.entries(result.seriesScores) as [string, number][];

  return (
    <div className="main-content animate-fade-in-up">
      <div
        className="main-content__inner flex-col gap-lg"
        style={{ display: 'flex', maxWidth: 640, margin: '0 auto' }}
      >
        {/* Result card */}
        <div className="result-card card">
          <p className="result-card__label">您的智商分数</p>
          <p className="result-card__score">{result.iqScore}</p>
          <span className="result-card__level">{result.iqLevel}</span>
        </div>

        {/* Stats row */}
        <div className="card flex-between" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
          <div className="text-center" style={{ flex: '1 1 0', minWidth: 80 }}>
            <p className="text-xs color-secondary">原始分</p>
            <p className="text-lg font-bold">{result.rawScore}/72</p>
          </div>
          <div className="text-center" style={{ flex: '1 1 0', minWidth: 80 }}>
            <p className="text-xs color-secondary">百分位</p>
            <p className="text-lg font-bold">{result.percentile}%</p>
          </div>
          <div className="text-center" style={{ flex: '1 1 0', minWidth: 80 }}>
            <p className="text-xs color-secondary">用时</p>
            <p className="text-lg font-bold">{formatTime(result.totalTimeSeconds)}</p>
          </div>
        </div>

        {/* Series breakdown */}
        <div className="card">
          <h3 className="text-md font-medium mb-md">各系列得分</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--spacing-sm)',
            }}
          >
            {seriesEntries.map(([series, score]) => (
              <div
                key={series}
                className="text-center"
                style={{
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <p className="text-xs color-secondary">{SERIES_LABELS[series] ?? series}</p>
                <p className="text-lg font-bold color-primary">{score}/12</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-center gap-md" style={{ flexWrap: 'wrap' }}>
          <button
            className="btn btn--primary"
            onClick={handleSave}
            disabled={saved}
            style={{ opacity: saved ? 0.7 : 1 }}
          >
            {saved ? '已保存 ✓' : '保存到历史'}
          </button>
          <button className="btn btn--secondary" onClick={handleRetry}>
            重新测验
          </button>
          <button className="btn btn--secondary" onClick={handleExport}>
            导出 PDF
          </button>
        </div>
      </div>
    </div>
  );
}
