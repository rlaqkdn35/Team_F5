import React, { useState, useEffect } from 'react';
import './UserProfileEditPage.css'; // 관련 CSS 파일
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios'; // ⭐️ axios 임포트 추가

const UserProfileEditPage = ({ currentUser, onLogout, onUserUpdate }) => {
    const navigate = useNavigate();

    // 폼 필드를 위한 상태 정의
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // 폼 제출 상태 및 메시지
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // currentUser prop이 변경될 때마다 폼 필드 초기화 (사용자 정보 로드 또는 변경 시)
    useEffect(() => {
        if (currentUser) {
            setNickname(currentUser.nickname || '');
            setEmail(currentUser.email || '');
            // 비밀번호 필드는 보안상 항상 빈 문자열로 시작
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            // 메시지 초기화
            setSuccessMessage('');
            setErrorMessage('');
        }
    }, [currentUser]); // currentUser가 변경될 때마다 이 훅 실행

    // currentUser가 없으면 로그인 페이지로 리다이렉트 (보호된 라우트 역할)
    useEffect(() => {
        if (!currentUser) {
            console.log('User not logged in, redirecting to /login');
            navigate('/login');
        } else {
            console.log('UserProfileEditPage - currentUser:', currentUser);
        }
    }, [currentUser, navigate]); // currentUser 또는 navigate 함수가 변경될 때마다 이 훅 실행

    // currentUser가 아직 로드되지 않았을 경우 (초기 렌더링 시점)
    if (!currentUser) {
        return (
            <div className="user-profile-edit-container">
                <h2>회원 정보 수정</h2>
                <p className="loading-message">사용자 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault(); // 기본 폼 제출 동작 방지

        // 메시지 및 로딩 상태 초기화
        setSuccessMessage('');
        setErrorMessage('');
        setIsLoading(true);

        // 서버로 전송할 사용자 정보 객체
        let updatedInfo = {
            userId: currentUser.userId, // 현재 사용자 ID는 반드시 포함되어야 함
            nickname: nickname,
            email: email,
        };
        
        // --- 클라이언트 측 유효성 검사 ---
        if (!nickname.trim()) {
            setErrorMessage('닉네임을 입력해주세요.');
            setIsLoading(false);
            return;
        }
        if (nickname.length > 20) {
            setErrorMessage('닉네임은 20자 이내로 입력해주세요.');
            setIsLoading(false);
            return;
        }
        // 간단한 이메일 정규식 검사
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrorMessage('유효한 이메일 주소를 입력해주세요.');
            setIsLoading(false);
            return;
        }

        // 비밀번호 변경 필드가 하나라도 채워져 있으면 비밀번호 변경 로직 수행
        const isPasswordChangeAttempt = currentPassword || newPassword || confirmNewPassword;
        if (isPasswordChangeAttempt) {
            if (!currentPassword) {
                setErrorMessage('비밀번호 변경을 원하시면 현재 비밀번호를 입력해주세요.');
                setIsLoading(false);
                return;
            }
            if (newPassword && newPassword.length < 3) {
                setErrorMessage('새 비밀번호는 최소 8자 이상이어야 합니다.');
                setIsLoading(false);
                return;
            }
            if (newPassword !== confirmNewPassword) {
                setErrorMessage('새 비밀번호가 일치하지 않습니다.');
                setIsLoading(false);
                return;
            }
            if (newPassword && newPassword === currentPassword) {
                setErrorMessage('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
                setIsLoading(false);
                return;
            }
            // 유효성 검사 통과 시 비밀번호 정보 추가
            updatedInfo.currentPassword = currentPassword;
            updatedInfo.newPassword = newPassword;
        }

        console.log('API로 전송할 데이터:', updatedInfo);

        // --- 백엔드 API 호출 (Axios 사용) ---
        try {
            // ⭐️ Axios는 기본적으로 JSON을 다루기 때문에 'Content-Type': 'application/json' 헤더를
            // 명시할 필요가 없으며, data를 JSON.stringify할 필요도 없습니다.
            // ⭐️ 세션 쿠키를 자동으로 보내려면 `withCredentials: true`를 설정해야 합니다.
            const response = await axios.put('http://localhost:8084/F5/user/update', updatedInfo, {
                withCredentials: true // 세션 쿠키를 요청에 포함
            });

            // Axios는 응답이 2xx 범위일 때만 `then` 블록으로 넘어가고,
            // 2xx 범위가 아니면 `catch` 블록으로 넘어갑니다.
            // 따라서 response.ok 체크가 필요 없습니다.
            const data = response.data; // Axios는 응답 데이터를 `response.data`로 제공

            setSuccessMessage('회원 정보가 성공적으로 업데이트되었습니다!');
            setErrorMessage('');
            console.log('회원 정보 업데이트 성공 응답:', data);

            // 비밀번호가 변경된 경우 (newPassword 필드가 존재했으면)
            if (isPasswordChangeAttempt && newPassword) {
                 alert('비밀번호가 변경되어 다시 로그인해야 합니다.');
                 onLogout(); // 부모 컴포넌트의 로그아웃 함수 호출
                 navigate('/login'); // 로그인 페이지로 이동
            } else {
                // 비밀번호 변경이 없었다면 비밀번호 필드만 초기화
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                
                // 닉네임이나 이메일이 변경되었을 경우, 부모 컴포넌트의 currentUser 상태 업데이트
                // `onUserUpdate` prop이 존재하고 함수라면 호출
                if (onUserUpdate && typeof onUserUpdate === 'function') {
                    onUserUpdate(data); // 서버에서 받은 최신 사용자 정보로 상태 업데이트
                }
            }
        } catch (error) {
            // Axios는 2xx 범위 외의 응답을 모두 에러로 처리하여 catch 블록으로 보냅니다.
            console.error('회원 정보 업데이트 에러:', error);

            let message = '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            if (error.response) {
                // 서버에서 응답이 왔지만, 2xx 범위가 아닌 경우 (예: 400, 401, 404, 500 등)
                message = `회원 정보 업데이트 실패: ${error.response.data || error.response.statusText || '알 수 없는 오류'}`;
                console.error('서버 응답 에러 데이터:', error.response.data);
                console.error('서버 응답 상태:', error.response.status);

                if (error.response.status === 401) {
                    message = '세션이 만료되었거나 인증되지 않았습니다. 다시 로그인해주세요.';
                    alert(message); // 사용자에게 알림
                    onLogout();
                    navigate('/login');
                }
            } else if (error.request) {
                // 요청이 전송되었지만 응답을 받지 못한 경우 (네트워크 문제)
                message = '서버에서 응답이 없습니다. 서버가 실행 중인지 확인해주세요.';
            } else {
                // 요청을 설정하는 과정에서 발생한 에러
                message = '요청을 보내는 중 오류가 발생했습니다.';
            }
            setErrorMessage(message);

        } finally {
            setIsLoading(false); // 로딩 상태 해제
        }
    };

    // 취소 버튼 핸들러: 이전 페이지로 이동
    const handleCancel = () => {
        navigate(-1); 
    };

    return (
        <div className="user-profile-edit-container">
            <h2>회원 정보 수정</h2>
            {/* 성공/에러 메시지 표시 */}
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>아이디</label>
                    {/* 아이디는 변경 불가 (읽기 전용) */}
                    <input type="text" value={currentUser.userId || '정보 없음'} readOnly className="read-only" />
                </div>

                <div className="form-group">
                    <label htmlFor="nickname">닉네임</label>
                    <input
                        type="text"
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        maxLength="20"
                        disabled={isLoading} // 로딩 중에는 입력 비활성화
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">이메일</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className="password-change-section">
                    <h3>비밀번호 변경</h3>
                    <div className="form-group">
                        <label htmlFor="current-password">현재 비밀번호</label>
                        <input
                            type="password"
                            id="current-password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            autoComplete="current-password" // 자동 완성 힌트
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="new-password">새 비밀번호</label>
                        <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password" // 자동 완성 힌트
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm-new-password">새 비밀번호 확인</label>
                        <input
                            type="password"
                            id="confirm-new-password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            autoComplete="new-password" // 자동 완성 힌트
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="save-button" disabled={isLoading}>
                        {isLoading ? '저장 중...' : '정보 저장'} {/* 로딩 중 텍스트 변경 */}
                    </button>
                    <button type="button" className="cancel-button" onClick={handleCancel} disabled={isLoading}>
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

// PropTypes를 사용하여 prop 타입 검사 (개발 모드에서 유용)
UserProfileEditPage.propTypes = {
    currentUser: PropTypes.shape({
        userId: PropTypes.string.isRequired,
        nickname: PropTypes.string,
        email: PropTypes.string,
        // 기타 사용자 정보 필드...
    }),
    onLogout: PropTypes.func.isRequired,
    onUserUpdate: PropTypes.func, // 추가된 prop: 사용자 정보 업데이트 콜백
};

export default UserProfileEditPage;