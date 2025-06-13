import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForumBoardPage.css'; // 필요에 따라 CSS 파일 경로 조정

const ForumBoardPage = ({ boardTitle }) => {
    // 서버에서 불러온 모든 게시글을 저장할 상태
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    // 현재 페이지 번호 (클라이언트 측 페이지네이션)
    const [currentPage, setCurrentPage] = useState(1);
    // 총 페이지 수 (클라이언트 측 필터링된 데이터 기준)
    const [totalPages, setTotalPages] = useState(1);
    // 검색어 상태
    const [searchTerm, setSearchTerm] = useState('');
    // 한 페이지에 보여줄 게시글 수
    const postsPerPage = 10;

    const navigate = useNavigate(); // 라우팅을 위한 훅

    // 컴포넌트 마운트 시 또는 boardTitle 변경 시 모든 게시글을 서버에서 불러옵니다.
    useEffect(() => {
        setLoading(true); // 로딩 상태 시작
        // console.log(`[ForumBoardPage] 모든 게시글 로드 시작 - boardTitle: "${boardTitle}"`);

        axios.get('http://localhost:8084/F5/forum/list', {
            withCredentials: true, // 쿠키 등 인증 정보 포함
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                // 서버가 boardTitle에 맞는 '모든' 게시글을 보내주도록 요청
                boardTitle: boardTitle,
            }
        })
        .then((response) => {
            const data = response.data;
            // console.log('[ForumBoardPage] 서버 응답 데이터:', data);

            if (Array.isArray(data.forums)) {
                setAllPosts(data.forums); // 받아온 모든 게시글을 allPosts 상태에 저장
                // console.log('[ForumBoardPage] 총 로드된 게시글 수:', data.forums.length);
            } else {
                console.warn('[ForumBoardPage] forums 데이터가 배열이 아닙니다.');
                setAllPosts([]);
            }
            setLoading(false); // 로딩 상태 종료
            setCurrentPage(1); // 새로운 데이터 로드 시 항상 1페이지로 초기화
            setSearchTerm(''); // 새로운 게시판 로드시 검색어 초기화 (선택 사항)
        })
        .catch((error) => {
            console.error('[ForumBoardPage] 게시글 불러오기 오류:', error);
            setLoading(false); // 오류 발생 시에도 로딩 종료
            setAllPosts([]); // 오류 발생 시 게시글 초기화
        });
    }, [boardTitle]); // boardTitle이 변경될 때만 이 useEffect를 다시 실행합니다.

    // useMemo를 사용하여 검색 필터링 및 페이지네이션 로직을 최적화합니다.
    // allPosts, currentPage, searchTerm, postsPerPage 중 하나라도 변경될 때만 재계산됩니다.
    const paginatedPostsData = useMemo(() => {
        // 1. 게시글을 'createdAt' 기준으로 내림차순 정렬 (가장 최근 글이 위로)
        // Date 객체로 변환하여 비교하므로, 'createdAt' 값이 유효한 날짜 문자열이어야 합니다.
        const sortedPosts = [...allPosts].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0); // 유효하지 않은 날짜 처리 (0으로 초기화하여 가장 과거로 간주)
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0); // 유효하지 않은 날짜 처리
            return dateB.getTime() - dateA.getTime(); // 내림차순 정렬 (최신 날짜가 먼저 오도록)
        });

        // 2. 검색어에 따라 게시글 필터링
        const filteredPosts = sortedPosts.filter(post =>
            (post.forumTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             post.userId?.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // 3. 필터링된 게시글의 총 개수
        const totalFilteredCount = filteredPosts.length;

        // 4. 필터링된 게시글을 기반으로 총 페이지 수 계산
        // 게시글이 0개일 경우 최소 1페이지는 표시되도록 합니다.
        const calculatedTotalPages = Math.ceil(totalFilteredCount / postsPerPage);
        const finalTotalPages = calculatedTotalPages > 0 ? calculatedTotalPages : 1;

        // 5. 현재 페이지에 맞는 게시글만 추출 (페이지네이션 슬라이싱)
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const currentPaginatedPosts = filteredPosts.slice(startIndex, endIndex);

        return {
            posts: currentPaginatedPosts, // 현재 페이지에 실제로 표시할 게시글 목록
            totalCount: totalFilteredCount, // 검색 필터링된 전체 게시글 수
            totalPages: finalTotalPages // 검색 필터링된 게시글에 대한 총 페이지 수
        };
    }, [allPosts, currentPage, searchTerm, postsPerPage]); // 의존성 배열

    // useMemo에서 계산된 totalPages를 컴포넌트의 totalPages 상태에 반영합니다.
    // 이렇게 해야 페이지네이션 UI가 올바르게 업데이트됩니다.
    useEffect(() => {
        setTotalPages(paginatedPostsData.totalPages);
    }, [paginatedPostsData.totalPages]);

    // 게시글 클릭 시 상세 페이지로 이동하는 함수
    const handlePostClick = (postId) => {
        console.log(`[ForumBoardPage] 게시글 클릭 - forumIdx: ${postId}`);
        navigate(`/forum/post/${postId}`); // postId를 사용하여 URL 생성
    };

    // 페이지 번호 클릭 또는 '이전'/'다음' 버튼 클릭 시 페이지를 변경하는 함수
    const handlePageChange = (page) => {
        console.log(`[ForumBoardPage] 페이지 변경 요청 - 새 페이지: ${page}`);
        // 유효한 페이지 범위 내에서만 페이지 변경을 허용합니다.
        if (page > 0 && page <= paginatedPostsData.totalPages) {
            setCurrentPage(page);
        }
    };

    // 검색 버튼 클릭 시 호출되는 함수
    const handleSearch = (e) => {
        e.preventDefault(); // 폼 제출의 기본 동작(페이지 새로고침) 방지
        console.log(`[ForumBoardPage] 검색어 변경 - 새 검색어: "${searchTerm}"`);
        setCurrentPage(1); // 검색 시 항상 1페이지로 이동하여 검색 결과의 시작을 보여줍니다.
    };

    // 로딩 중일 때 표시할 UI
    if (loading) {
        return <div className="forum-board-container">게시글을 불러오는 중입니다...</div>;
    }

    return (
        <div className="forum-board-container">
            {/* 게시판 헤더 및 검색 폼 */}
            <div className="board-header">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="검색어를 입력하세요"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        // 검색 시 input이 필수는 아님 (빈 검색어로도 검색 가능)
                    />
                    <button type="submit">검색</button>
                </form>
            </div>

            {/* 게시글 목록 테이블 */}
            <div className="post-list">
                {/* paginatedPostsData.posts에 게시글이 있을 경우 테이블 렌더링 */}
                {paginatedPostsData.posts.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>번호</th> {/* 번호 열 다시 추가 */}
                                <th>제목</th>
                                <th>작성자</th>
                                <th>날짜</th>
                                <th>조회</th>
                                <th>추천</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* 현재 페이지에 해당하는 게시글만 맵핑하여 렌더링 */}
                            {paginatedPostsData.posts.map((post, index) => {
                                // 게시글 번호 계산: (현재 페이지 - 1) * 페이지당 게시글 수 + 현재 페이지 내 인덱스 + 1
                                // 이 계산은 최신순 정렬된 전체 목록에서 현재 게시글의 상대적 위치를 번호로 보여줍니다.
                                const postNumber = (currentPage - 1) * postsPerPage + index + 1;
                                // `key` prop은 React가 목록의 항목을 식별하는 데 도움을 줍니다. `forumIdx`는 고유해야 합니다.
                                return (
                                    <tr key={post.forumIdx} onClick={() => handlePostClick(post.forumIdx)} className="post-row">
                                        <td>{postNumber}</td> {/* 계산된 번호 표시 */}
                                        <td>{post.forumTitle || '제목 없음'}</td> {/* 제목이 없을 경우 대비 */}
                                        <td>{post.nickname || post.userId || '알 수 없음'}</td> {/* 닉네임 또는 ID 표시 */}
                                        <td>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '날짜 없음'}</td> {/* 날짜 형식화 */}
                                        <td>{post.forumViews || 0}</td> {/* 조회수가 없을 경우 0 */}
                                        <td>{post.forumRecos || 0}</td> {/* 추천수가 없을 경우 0 */}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    // 게시글이 없을 경우 메시지 표시
                    <p>게시글이 없습니다. (검색 결과 없음)</p>
                )}
            </div>

            {/* 페이지네이션 버튼 섹션 */}
            {/* 총 페이지 수가 1을 초과할 때만 페이지네이션 UI를 표시 */}
            {paginatedPostsData.totalPages > 1 ? (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1} // 첫 페이지에서는 '이전' 버튼 비활성화
                    >
                        이전
                    </button>
                    {/* 페이지 번호 버튼들을 동적으로 생성 */}
                    {[...Array(paginatedPostsData.totalPages)].map((_, index) => (
                        <button
                            key={index + 1} // 각 버튼의 고유 key
                            onClick={() => handlePageChange(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''} // 현재 페이지에 'active' 클래스 적용
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === paginatedPostsData.totalPages} // 마지막 페이지에서는 '다음' 버튼 비활성화
                    >
                        다음
                    </button>
                </div>
            ) : (
                // 총 페이지 수가 1 이하면 빈 div를 렌더링 (또는 아무것도 렌더링하지 않음)
                <div></div>
            )}
            
            {/* 글쓰기 버튼 */}
            <button onClick={() => navigate('/forum/write')} className="write-post-button">
                글쓰기
            </button>
        </div>
    );
};

export default ForumBoardPage;