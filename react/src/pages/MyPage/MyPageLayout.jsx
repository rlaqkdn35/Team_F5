import React from 'react';
import { Outlet } from 'react-router-dom';
// SubNavigation 컴포넌트의 정확한 경로를 확인해주세요.
import SubNavigation from '../../components/common/SubNavigation/SubNavigation.jsx'; 
import './MyPageLayout.css'; // 이 레이아웃의 스타일 파일

// MyPage 섹션 하위 메뉴 링크 정의
const myPageSubNavLinks = [
  { name: 'AI 비서', path: '/mypage' }, // '/mypage'의 기본(index) 화면으로 설정
  { name: '관심 종목', path: '/mypage/favorite' }, 
  { name: '계정 정보', path: '/mypage/profile' }, 
];

const MyPageLayout = () => {
  return (
    <div className="my-page-layout-container">
      {/* 페이지 제목은 필요에 따라 여기에 추가하거나, 각 하위 페이지 컴포넌트에서 개별적으로 관리할 수 있습니다. */}
      {/* 예: <h1 className="mypage-section-title">My Page</h1> */}
      <SubNavigation links={myPageSubNavLinks} basePath="/mypage" />
      <div className="mypage-content-outlet">
        <Outlet /> {/* 여기에 'AI 비서' 또는 '계정 정보' 페이지 내용이 렌더링됩니다. */}
      </div>
    </div>
  );
};

export default MyPageLayout;