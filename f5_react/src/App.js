import React, { useState, useEffect } from 'react'; // useEffect 임포트
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
} from 'react-router-dom';
import axios from 'axios';

import './App.css';

// ... (기존 임포트 유지) ...
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
import UserProfileEditPage from './pages/UserProfileEditPage/UserProfileEditPage.jsx';

function ProtectedElement({ currentUser, children }) {
    const location = useLocation();
    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
}

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // 로그인 상태 확인 중임을 나타내는 로딩 상태

    // 앱 로드 시 세션 유효성 검사 (새로고침 시 로그인 상태 유지)
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                // withCredentials: true를 통해 브라우저가 저장된 JSESSIONID를 자동으로 보냄
                const response = await axios.get('http://localhost:8084/F5/user/me', {
                    withCredentials: true,
                });
                setCurrentUser(response.data); // 세션이 유효하면 사용자 정보 설정
                console.log('세션 확인 성공:', response.data);
            } catch (error) {
                console.error('세션 확인 중 오류 (로그인되지 않음 또는 세션 만료):', error.response ? error.response.status : error.message);
                setCurrentUser(null); // 세션 만료 또는 없음
            } finally {
                setLoading(false); // 로딩 완료
            }
        };

        checkLoginStatus();
    }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행

    const handleLoginSuccess = (userData) => {
        setCurrentUser(userData);
    };

    const handleLogout = async () => {
        try {
            // 백엔드 컨텍스트 패스 포함
            await axios.post('http://localhost:8084/F5/user/logout', {}, {
                withCredentials: true,
            });
            setCurrentUser(null);
            alert('로그아웃 되었습니다.');
            console.log('로그아웃 성공.');
        } catch (error) {
            console.error('로그아웃 중 오류:', error);
            // 오류가 발생해도 클라이언트 상태는 로그아웃으로 처리
            setCurrentUser(null);
            alert('로그아웃 실패!');
        }
    };

    // 로딩 중일 때 아무것도 렌더링하지 않거나 로딩 스피너를 보여줄 수 있습니다.
    if (loading) {
        return <div>Loading authentication status...</div>; // 로딩 스피너 등
    }

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
                            <Route path="/news/:newsIdx" element={<NewsDetailPage />} />                            <Route path="/stock-detail/:stockCode" element={<StockDetailPage />} />
                            <Route path="/find-user" element={<FindUserPage />} />
                            <Route path="/edit-profile" element={<UserProfileEditPage 
                                                                 currentUser={currentUser}
                                                                onLogout={handleLogout}
                                                                />} />
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
                <RightSidebar currentUser={currentUser} />
            </div>
        </Router>
    );
}

export default App;