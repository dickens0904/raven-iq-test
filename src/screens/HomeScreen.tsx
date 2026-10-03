import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '../stores/testStore';

export default function HomeScreen() {
  const [ageInput, setAgeInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const startTest = useTestStore(s => s.startTest);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const raw = (e.target as HTMLFormElement).age?.value ?? ageInput;
      const age = Math.round(Number(raw));
      if (!raw || !Number.isFinite(age) || age !== Number(raw)) {
        setError('请输入整数年龄');
        return;
      }
      if (age < 5 || age > 65) {
        setError('年龄必须在 5-65 岁之间');
        return;
      }
      setError(null);
      startTest(age);
      navigate('/test');
    },
    [ageInput, startTest, navigate]
  );

  return (
    <div className="main-content animate-fade-in-up">
      <div className="main-content__inner flex-col gap-lg" style={{ display: 'flex' }}>
        <div className="text-center">
          <h1 className="text-title font-bold" style={{ color: 'var(--color-text)' }}>
            瑞文标准推理测验
          </h1>
          <p className="text-lg color-secondary mt-sm">
            Raven's Progressive Matrices — 标准智商评估
          </p>
        </div>

        <div className="card text-center">
          <p className="text-md" style={{ lineHeight: 1.8 }}>
            本测验包含 72 道图形推理题目，用于评估您的非语言智力水平。
            <br />
            每道题展示一组有规律的图形矩阵，您需要找出缺失的一块。
          </p>
        </div>

        <div className="card" style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <form onSubmit={handleSubmit} className="flex-col gap-md" style={{ display: 'flex' }}>
            <label className="text-md font-medium" htmlFor="age-input">
              请输入您的年龄（5-65岁）
            </label>
            <input
              id="age-input"
              name="age"
              type="number"
              min={5}
              max={65}
              value={ageInput}
              onChange={e => {
                setAgeInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="例如：25"
              className="text-md"
              style={{
                padding: 'var(--spacing-sm) var(--spacing-md)',
                border: `1px solid ${error ? 'var(--color-incorrect)' : 'var(--color-border)'}`,
                borderRadius: 'var(--border-radius)',
                minHeight: 'var(--min-touch-target)',
                backgroundColor: 'var(--color-background)',
                width: '100%',
              }}
            />
            {error && <p className="text-sm color-incorrect">{error}</p>}
            <button type="submit" className="btn btn--primary btn--large w-full">
              开始测验
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--large w-full"
              onClick={() => navigate('/history')}
            >
              查看历史记录
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
