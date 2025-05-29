import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import './App.css';
import Header from './components/layout/Header/Header.jsx';
import LeftSidebar from './components/layout/Sidebar/LeftSidebar.jsx'; // 이름 변경 고려: LeftSidebar
import RightSidebar from './components/layout/Sidebar/RightSidebar.jsx'; // <<--- RightSidebar 임포트
// ... (MainPage, AiInfoPageLayout 등 다른 페이지 컴포넌트 임포트)
import MainPage from './pages/MainPage.jsx';
import AiInfoPageLayout from './pages/AiInfoPage/AiInfoPageLayout.jsx';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx';
import AiInfoHomeContentPage from './pages/AiInfoPage/components/AiInfoHomeContentPage.jsx';
import PriceAnalysisContent from './pages/AiInfoPage/components/PriceAnalysisContent.jsx'
import IssueAnalysisContent from './pages/AiInfoPage/components/IssueAnalysisContent.jsx';
import ThemeSectorContent from './pages/AiInfoPage/components/ThemeSectorContent.jsx';
import NewsContent from './pages/AiInfoPage/components/NewsContent.jsx';
import AiPicksPageLayout from './pages/AiPicksPage/AiPicksPageLayout.jsx';
import AiPicksHomeContent from './pages/AiPicksPage/components/AiPicksHomeContent.jsx';
import TodayPicksPage from './pages/AiPicksPage/components/TodayPicksPage.jsx';
import RecommendationsPage from './pages/AiPicksPage/components/RecommendationsPage.jsx';
import ForumPageLayout from './pages/ForumPage/ForumPageLayout.jsx';
import ForumBoardPage from './pages/ForumPage/components/ForumBoardPage.jsx';
import UserProfilePage from './pages/MyPage/components/UserProfilePage.jsx';
import MyPageLayout from './pages/MyPage/MyPageLayout.jsx';
import AiAssistantPage from './pages/MyPage/components/AiAssistantPage.jsx';
import StockDetailPage from './pages/StockDetailPage/StockDetailPage.jsx';
import Footer from './components/layout/Footer/Footer.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import FindUserPage from './pages/FindUserPage/FindUserPage.jsx';
import SignupPage from './pages/SignUpPage/SignUpPage.jsx';
import WritePostPage from './pages/ForumPage/components/WritePostPage.jsx';
import PostDetailPage from './pages/ForumPage/components/PostDetailPage.jsx';
import Signal from './pages/AiPicksPage/components/Signal.jsx';
import UserFavorite from './pages/MyPage/components/UserFavorite.jsx';
import NewsDetailPage from './pages/AiInfoPage/components/NewsDetailPage/NewsDetailPage.jsx';
import PostEditPage from './pages/ForumPage/components/PostEditPage.jsx';



function App() {
  const [currentUser, setCurrentUser] = useState(true); // null-> true로 바꾸면 로그인 완료상태
  
  const handleLoginSuccess = (userData) => { setCurrentUser(userData); };
  const handleLogout = () => { setCurrentUser(null); };
  
  const ProtectedElement = ({ children }) => {
    const location = useLocation();
    if (!currentUser) {
        // 로그인 페이지로 보내면서, 현재 경로를 state에 담아 전달
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
      return children;
    };

  return (
  <Router>

    <div className='App'>


      <LeftSidebar /> 
      <div className="app-body-layout-3col">  
        <Header isLoggedIn={!!currentUser} onLogout={handleLogout} />
        <main className="app-main-content-centered"> 
          <Routes>
            {/* <Route path="/" element={<MainPage />}></Route> */}
            <Route path="/ai-info" element={<AiInfoPageLayout />}>
              <Route index element={<AiInfoHomeContentPage />} />
              <Route path="price-analysis" element={<PriceAnalysisContent />} />
              <Route path="issue-analysis" element={<IssueAnalysisContent />} />
              <Route path="theme-sector" element={<ThemeSectorContent />} />
              <Route path="news" element={<NewsContent />} />
              

            </Route>

            <Route path="/ai-picks" element={<AiPicksPageLayout />}>
              <Route index element={<AiPicksHomeContent />} />
              <Route path="today" element={<TodayPicksPage />} />
              <Route path="recommendations" element={<RecommendationsPage />} />
              <Route path="signal" element={<Signal />} />
            </Route>


            <Route path="/forum" element={<ForumPageLayout />}>
              <Route index element={<ForumBoardPage />} /> {/* 소셜분석이 기본 홈 */}
              <Route path="write" element={
                <ProtectedElement>
                  <WritePostPage />
                </ProtectedElement>
              } />
              <Route path="edit/:postId" element={<PostEditPage />} />

              <Route path="post/:postId" element={<PostDetailPage />} /> </Route>
            <Route 
              path="/mypage" 
              element={
                <ProtectedElement>
                  <MyPageLayout />
                </ProtectedElement>
              } 
            >
              <Route index element={<AiAssistantPage />} /> {/* <<--- /mypage 기본 화면 */}
              <Route path="profile" element={<UserProfilePage currentUser={currentUser} onLogout={handleLogout} />} /> 
              <Route path="favorite" element={<UserFavorite currentUser={currentUser} onLogout={handleLogout} />} />

            </Route>
            <Route path="news/:id" element={<NewsDetailPage />} />
            <Route path="/stock-detail/:stockCode" element={<StockDetailPage />} />
            <Route path="/login" element={!currentUser ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/LoginPage" />} />
            <Route path="/find-user" element={!currentUser ? <FindUserPage /> : <Navigate to="/" replace />} />
            <Route path="/signup" element={!currentUser ? <SignupPage /> : <Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div> {/* app-body-layout-3col 끝 */}
      <RightSidebar /> {/* <<--- 오른쪽 사이드바 컴포넌트 추가 */}
    </div> {/* App 끝 */}
  </Router>
);
}

export default App;