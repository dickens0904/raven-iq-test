import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import AdaptiveLayout from './components/AdaptiveLayout';
import { getDeviceType, isTouchDevice } from './utils/device';
import { getTheme, applyTheme } from './utils/theme';
import HomeScreen from './screens/HomeScreen';
import TestScreen from './screens/TestScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';
import './App.css';

function AppHeader() {
  return (
    <header className="app-header">
      <NavLink to="/" className="app-header__title" style={{ textDecoration: 'none' }}>
        瑞文推理测验
      </NavLink>
      <nav className="app-header__nav">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
          end
        >
          首页
        </NavLink>
        <NavLink
          to="/test"
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
        >
          测验
        </NavLink>
        <NavLink
          to="/result"
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
        >
          结果
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
        >
          历史
        </NavLink>
      </nav>
    </header>
  );
}

function NotFoundPage() {
  return (
    <div className="main-content animate-fade-in">
      <div className="main-content__inner">
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <p className="empty-state__text">页面不存在</p>
          <Link to="/" className="btn btn--primary">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
        }
        end
      >
        <span className="bottom-nav__icon">🏠</span>
        <span>首页</span>
      </NavLink>
      <NavLink
        to="/test"
        className={({ isActive }) =>
          `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
        }
      >
        <span className="bottom-nav__icon">📝</span>
        <span>测验</span>
      </NavLink>
      <NavLink
        to="/result"
        className={({ isActive }) =>
          `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
        }
      >
        <span className="bottom-nav__icon">📊</span>
        <span>结果</span>
      </NavLink>
      <NavLink
        to="/history"
        className={({ isActive }) =>
          `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
        }
      >
        <span className="bottom-nav__icon">📋</span>
        <span>历史</span>
      </NavLink>
    </nav>
  );
}

export default function App() {
  useEffect(() => {
    const deviceType = getDeviceType();
    const theme = getTheme(deviceType);
    applyTheme(theme);

    if (isTouchDevice()) {
      document.body.classList.add('touch-device');
    }
  }, []);

  return (
    <BrowserRouter>
      <AdaptiveLayout>
        <AppHeader />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/test" element={<TestScreen />} />
          <Route path="/result" element={<ResultScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <BottomNav />
      </AdaptiveLayout>
    </BrowserRouter>
  );
}
