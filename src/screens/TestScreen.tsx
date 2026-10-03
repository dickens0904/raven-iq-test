import { useEffect, useRef, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTestStore } from '../stores/testStore';
import { useDeviceType } from '../utils/device';
import { formatTime } from '../utils/time';
import QuestionPanel from '../components/QuestionPanel';

export default function TestScreen() {
  const {
    questions,
    currentIndex,
    answers,
    startedAt,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitTest,
  } = useTestStore();

  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSubmitRef = useRef(false);
  const [elapsed, setElapsed] = useState(0);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  // Timer: update every second
  useEffect(() => {
    if (!startedAt) return;
    const tick = () => {
      setElapsed(Math.round(Date.now() / 1000) - startedAt);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  // Auto-submit at 40 minutes (guard against repeated calls)
  useEffect(() => {
    if (elapsed >= 2400 && !autoSubmitRef.current) {
      autoSubmitRef.current = true;
      submitTest();
      navigate('/result');
    }
  }, [elapsed, submitTest, navigate]);

  // Handle answer selection
  const handleSelect = useCallback(
    (index: number) => {
      if (!currentQuestion) return;
      answerQuestion(currentQuestion.id, index);

      // Clear any pending advance
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }

      // If not last question, auto-advance after 300ms
      if (!isLast) {
        advanceTimerRef.current = setTimeout(() => {
          nextQuestion();
        }, 300);
      }
    },
    [currentQuestion, isLast, answerQuestion, nextQuestion]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  // Keyboard support (PC only)
  useEffect(() => {
    if (deviceType === 'mobile') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1-8 for answer selection
      const num = Number(e.key);
      if (num >= 1 && num <= 8 && currentQuestion && num <= currentQuestion.optionsCount) {
        e.preventDefault();
        handleSelect(num - 1);
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          previousQuestion();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (isLast) {
            submitTest();
            navigate('/result');
          } else if (selectedAnswer) {
            nextQuestion();
          }
          break;
        case 'Enter':
          if (isLast) {
            e.preventDefault();
            submitTest();
            navigate('/result');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    deviceType,
    currentQuestion,
    selectedAnswer,
    isLast,
    handleSelect,
    previousQuestion,
    nextQuestion,
    submitTest,
    navigate,
  ]);

  // Touch swipe support (mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      // Only handle horizontal swipes (not vertical)
      if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;

      if (dx < 0) {
        // Swipe left → next question or submit
        if (isLast) {
          submitTest();
          navigate('/result');
        } else if (selectedAnswer) {
          nextQuestion();
        }
      } else {
        // Swipe right → previous question
        previousQuestion();
      }
    },
    [selectedAnswer, isLast, nextQuestion, previousQuestion]
  );

  // No questions started
  if (questions.length === 0) {
    return (
      <div className="main-content animate-fade-in">
        <div className="main-content__inner">
          <div className="card text-center">
            <p className="text-lg">请先在首页设置年龄并开始测验</p>
            <Link to="/" className="btn btn--primary mt-lg" style={{ display: 'inline-flex' }}>
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Timer class
  const timerClass =
    elapsed >= 2340 ? 'timer timer--danger' : elapsed > 2160 ? 'timer timer--warning' : 'timer';

  // Progress percentage
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div
      className="main-content animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="main-content__inner flex-col gap-lg" style={{ display: 'flex' }}>
        {/* Progress bar */}
        <div>
          <div className="flex-between mb-sm">
            <span className="text-sm color-secondary">
              {currentIndex + 1} / {questions.length}
            </span>
            <span className={timerClass}>⏱ {formatTime(elapsed)}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Series label */}
        <div className="question-card__header">
          <span className="question-card__number">
            系列 {currentQuestion.series} · 第 {currentQuestion.number} 题
          </span>
        </div>

        {/* Question */}
        <QuestionPanel
          question={currentQuestion}
          selectedIndex={selectedAnswer?.selectedAnswer}
          onSelect={handleSelect}
          showKeyboardHints={deviceType !== 'mobile'}
        />

        {/* Navigation */}
        <div className="flex-between gap-md">
          <button
            className="btn btn--secondary"
            onClick={previousQuestion}
            disabled={currentIndex === 0}
            style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
          >
            上一题
          </button>

          {isLast ? (
            <button
              className="btn btn--primary"
              onClick={() => {
                submitTest();
                navigate('/result');
              }}
            >
              提交测验
            </button>
          ) : (
            <button
              className="btn btn--secondary"
              onClick={nextQuestion}
              disabled={!selectedAnswer}
              style={{ opacity: selectedAnswer ? 1 : 0.5 }}
            >
              下一题
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
