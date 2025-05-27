// ForumBoardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForumBoardPage.css';

// writePostPath, postDetailBasePath prop을 제거합니다.
const ForumBoardPage = ({ boardTitle }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    // Mock 데이터 생성 함수는 동일합니다.
    const generateMockPosts = (count, page, currentBoardTitle) => {
        const mockData = [];
        for (let i = 1; i <= count; i++) {
            const postId = (page - 1) * count + i;
            mockData.push({
                id: postId,
                title: `${currentBoardTitle} 게시글 제목 ${postId}`,
                author: `사용자${Math.floor(Math.random() * 100) + 1}`,
                date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toLocaleDateString('ko-KR'),
                views: Math.floor(Math.random() * 1000),
                comments: Math.floor(Math.random() * 50)
            });
        }
        return mockData;
    };

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const mockPosts = generateMockPosts(10, currentPage, boardTitle);
            setPosts(mockPosts);
            setLoading(false);
        }, 500);
    }, [currentPage, boardTitle]);

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePostClick = (postId) => {
        // 게시글 상세 경로도 직접 하드코딩
        navigate(`/forum/post/${postId}`);
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
    };

    if (loading) {
        return <div className="forum-board-container">게시글을 불러오는 중입니다...</div>;
    }

    return (
        <div className="forum-board-container">
            <div className="board-header">
                <h2>토론실</h2>
                {/* 글쓰기 버튼 클릭 시 경로를 직접 지정 */}
                <button onClick={() => navigate('/forum/write')} className="write-post-button">
                    글쓰기
                </button>
            </div>

            <div className="search-bar">
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
                                <th>댓글</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map((post) => (
                                <tr key={post.id} onClick={() => handlePostClick(post.id)} className="post-row">
                                    <td>{post.id}</td>
                                    <td>{post.title}</td>
                                    <td>{post.author}</td>
                                    <td>{post.date}</td>
                                    <td>{post.views}</td>
                                    <td>{post.comments}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>게시글이 없습니다. (검색 결과 없음)</p>
                )}
            </div>

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
        </div>
    );
};

export default ForumBoardPage;