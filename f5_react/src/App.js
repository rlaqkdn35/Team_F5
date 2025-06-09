// App.js
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import axios from 'axios';

import './App.css';

import Header from './components/layout/Header/Header.jsx';
import LeftSidebar from './components/layout/Sidebar/LeftSidebar.jsx';
import RightSidebar from './components/layout/Sidebar/RightSidebar.jsx';
import Footer from './components/layout/Footer/Footer.jsx';

import LoginPage from './pages/LoginPage/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage/SignUpPage.jsx';
import FindUserPage from './pages/FindUserPage/FindUserPage.jsx';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx';
import StockDetailPage from './pages/StockDetailPage/StockDetailPage.jsx';
import NewsDetailPage from './pages/AiInfoPage/components/NewsDetailPage/NewsDetailPage.jsx';

import AiInfoPageLayout from './pages/AiInfoPage/AiInfoPageLayout.jsx';
import AiInfoHomeContentPage from './pages/AiInfoPage/components/AiInfoHomeContentPage.jsx';
import PriceAnalysisContent from './pages/AiInfoPage/components/PriceAnalysisContent.jsx';
import IssueAnalysisContent from './pages/AiInfoPage/components/IssueAnalysisContent.jsx';
import ThemeSectorContent from './pages/AiInfoPage/components/ThemeSectorContent.jsx';
import NewsContent from './pages/AiInfoPage/components/NewsContent.jsx';

import AiPicksPageLayout from './pages/AiPicksPage/AiPicksPageLayout.jsx';
import AiPicksHomeContent from './pages/AiPicksPage/components/AiPicksHomeContent.jsx';
import TodayPicksPage from './pages/AiPicksPage/components/TodayPicksPage.jsx';
import RecommendationsPage from './pages/AiPicksPage/components/RecommendationsPage.jsx';
import Signal from './pages/AiPicksPage/components/Signal.jsx';

import ForumPageLayout from './pages/ForumPage/ForumPageLayout.jsx';
import ForumBoardPage from './pages/ForumPage/components/ForumBoardPage.jsx';
import WritePostPage from './pages/ForumPage/components/WritePostPage.jsx';
import PostDetailPage from './pages/ForumPage/components/PostDetailPage.jsx';
import PostEditPage from './pages/ForumPage/components/PostEditPage.jsx';

import MyPageLayout from './pages/MyPage/MyPageLayout.jsx';
import AiAssistantPage from './pages/MyPage/components/AiAssistantPage.jsx';
import UserProfilePage from './pages/MyPage/components/UserProfilePage.jsx';
import UserFavorite from './pages/MyPage/components/UserFavorite.jsx';
import MainPage from './pages/MainPage/MainPage.jsx';


function ProtectedElement({ currentUser, children }) {
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // 로그인 세션 유지 체크
    fetch('http://localhost:8084/F5/api/me', {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    axios
      .post(
        'http://localhost:8084/F5/logout',
        {},
        {
          withCredentials: true,
        }
      )
      .then(() => setCurrentUser(null))
      .catch(() => setCurrentUser(null));
  };

  return (
    <Router>
      <div className="App">
        <LeftSidebar />
        <div className="app-body-layout-3col">
          <Header isLoggedIn={!!currentUser} onLogout={handleLogout} />
          <main className="app-main-content-centered">
            <Routes>
              <Route path="/Main" element={<MainPage />} />

              {/* AI INFO */}
              <Route path="/" element={<Navigate to="/ai-info" replace />} />
              <Route path="/ai-info" element={<AiInfoPageLayout />}>
                <Route index element={<AiInfoHomeContentPage />} />
                <Route path="price-analysis" element={<PriceAnalysisContent />} />
                <Route path="issue-analysis" element={<IssueAnalysisContent />} />
                <Route path="theme-sector" element={<ThemeSectorContent />} />
                <Route path="news" element={<NewsContent />} />
              </Route>

              {/* AI PICKS */}
              <Route path="/ai-picks" element={<AiPicksPageLayout />}>
                <Route index element={<AiPicksHomeContent />} />
                <Route path="today" element={<TodayPicksPage />} />
                <Route path="recommendations" element={<RecommendationsPage />} />
                <Route path="signal" element={<Signal />} />
              </Route>

              {/* FORUM */}
              <Route path="/forum" element={<ForumPageLayout />}>
                <Route index element={<ForumBoardPage />} />
                <Route
                  path="write"
                  element={
                    <ProtectedElement currentUser={currentUser}>
                      <WritePostPage />
                    </ProtectedElement>
                  }
                />
                <Route path="edit/:postId" element={<PostEditPage />} />
                <Route path="post/:postId" element={<PostDetailPage />} />
              </Route>

              {/* MYPAGE */}
              <Route
                path="/mypage"
                element={
                  <ProtectedElement currentUser={currentUser}>
                    <MyPageLayout />
                  </ProtectedElement>
                }
              >
                <Route index element={<AiAssistantPage />} />
                <Route
                  path="profile"
                  element={
                    <UserProfilePage
                      currentUser={currentUser}
                      onLogout={handleLogout}
                    />
                  }
                />
                <Route
                  path="favorite"
                  element={
                    <UserFavorite
                      currentUser={currentUser}
                      onLogout={handleLogout}
                    />
                  }
                />
              </Route>

              {/* 기타 페이지 */}
              <Route path="/news/:id" element={<NewsDetailPage />} />
              <Route path="/stock-detail/:stockCode" element={<StockDetailPage />} />
              <Route path="/find-user" element={<FindUserPage />} />

              {/* 로그인/회원가입 */}
              <Route
                path="/signup"
                element={!currentUser ? <SignUpPage /> : <Navigate to="/" replace />}
              />
              <Route
                path="/login"
                element={
                  !currentUser ? (
                    <LoginPage onLoginSuccess={handleLoginSuccess} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <RightSidebar />
      </div>
    </Router>
  );
}

export default App;
