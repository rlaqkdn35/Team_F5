import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForumBoardPage.css';

const ForumBoardPage = ({ boardTitle }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const postsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        console.log(`\n[ForumBoardPage] 데이터 요청 시작 - currentPage: ${currentPage}, searchTerm: "${searchTerm}", boardTitle: "${boardTitle}"`);

        axios.get('http://localhost:8084/F5/api/forum/list', {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                page: currentPage,
                search: searchTerm,
                boardTitle: boardTitle,
            }
        })
        .then((response) => {
            const data = response.data;
            console.log('[ForumBoardPage] 전체 응답 데이터:', data);
            console.log('[ForumBoardPage] totalCount:', data.totalCount);
            console.log('[ForumBoardPage] forums 리스트 길이:', Array.isArray(data.forums) ? data.forums.length : 0);

            if (Array.isArray(data.forums)) {
                data.forums.forEach((post, index) => {
                    console.log(`[ForumBoardPage] ${index + 1}번째 게시글 주요 정보:`);
                    console.log(`  forumIdx: ${post.forumIdx ?? 'undefined'}`);
                    console.log(`  forumTitle: ${post.forumTitle ?? 'undefined'}`);
                    console.log(`  nickname: ${post.nickname ?? 'undefined'}`);
                    console.log(`  userId: ${post.userId ?? 'undefined'}`);
                    console.log(`  createdAt: ${post.createdAt ?? 'undefined'}`);
                    console.log(`  forumViews: ${post.forumViews ?? 'undefined'}`);
                    console.log(`  forumRecos: ${post.forumRecos ?? 'undefined'}`);

                    // 추가로 서버에서 오는 실제 키들 확인
                    console.log('  전체 키:', Object.keys(post));
                });
            } else {
                console.warn('[ForumBoardPage] forums 데이터가 배열이 아닙니다.');
            }

            setPosts(data.forums || []);
            const pages = Math.ceil((data.totalCount || 0) / postsPerPage);
            setTotalPages(pages > 0 ? pages : 1);
            setLoading(false);
        })
        .catch((error) => {
            console.error('[ForumBoardPage] 게시글 불러오기 오류:', error);
            setLoading(false);
        });
    }, [currentPage, searchTerm, boardTitle]);

    const filteredPosts = Array.isArray(posts)
        ? posts.filter(post =>
            (post.forumTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.userId?.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : [];

    const handlePostClick = (postId) => {
        console.log(`[ForumBoardPage] 게시글 클릭 - forumIdx: ${postId}`);
        navigate(`/forum/post/${postId}`);
    };

    const handlePageChange = (page) => {
        console.log(`[ForumBoardPage] 페이지 변경 요청 - 새 페이지: ${page}`);
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log(`[ForumBoardPage] 검색어 변경 - 새 검색어: "${searchTerm}"`);
        setCurrentPage(1);
    };

    if (loading) {
        return <div className="forum-board-container">게시글을 불러오는 중입니다...</div>;
    }

    return (
        <div className="forum-board-container">
            <div className="board-header">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="검색어를 입력하세요"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        required
                    />
                    <button type="submit">검색</button>
                </form>
            </div>

            <div className="post-list">
                {filteredPosts.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>제목</th>
                                <th>작성자</th>
                                <th>날짜</th>
                                <th>조회</th>
                                <th>추천</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map((post, index) => {
                                const postNumber = (currentPage - 1) * postsPerPage + index + 1;
                                return (
                                    <tr key={post.forumIdx} onClick={() => handlePostClick(post.forumIdx)} className="post-row">
                                        <td>{postNumber}</td>
                                        <td>{post.forumTitle || '제목 없음'}</td>
                                        <td>{post.nickname || post.userId || '알 수 없음'}</td>
                                        <td>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '날짜 없음'}</td>
                                        <td>{post.forumViews || 0}</td>
                                        <td>{post.forumRecos || 0}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p>게시글이 없습니다. (검색 결과 없음)</p>
                )}
            </div>

            {totalPages > 1 ? (
            <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    이전
                </button>
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    다음
                </button>
            </div>
            ):(
            <div></div>
            )}
            <button onClick={() => navigate('/forum/write')} className="write-post-button">
                글쓰기
            </button>
        </div>

    );
};

export default ForumBoardPage;
