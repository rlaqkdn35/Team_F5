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
        axios.get('http://localhost:8084/F5/api/forum/list', {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then((response) => {
            const data = response.data;
            // console.log('[ForumBoardPage] 전체 응답:', data);
            // console.log('[ForumBoardPage] totalCount:', data.totalCount);
            // console.log('[ForumBoardPage] forums 리스트 개수:', data.forums?.length);

            setPosts(data.forums || []);
            const pages = Math.ceil((data.totalCount || 0) / postsPerPage);
            setTotalPages(pages > 0 ? pages : 1);
            setLoading(false);
        })
        .catch((error) => {
            console.error('[ForumBoardPage] 게시글 불러오기 오류:', error);
            setLoading(false);
        });
    }, [currentPage, boardTitle]);

    const filteredPosts = Array.isArray(posts)
        ? posts.filter(post =>
            (post.forum_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.user_id?.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : [];

    const handlePostClick = (postId) => {
        navigate(`/forum/post/${postId}`);
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // const handleSearch = (e) => {
    //     e.preventDefault();
    //     setCurrentPage(1);
    // };

    if (loading) {
        return <div className="forum-board-container">게시글을 불러오는 중입니다...</div>;
    }

    return (
        <div className="forum-board-container">
            <div className="board-header">
                <button onClick={() => navigate('/forum/write')} className="write-post-button">
                    글쓰기
                </button>
                <input
                    type="text"
                    placeholder="검색어를 입력하세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    required
                />
                {/* input속성만 있어도 충분할 거 같음
                <form onSubmit={handleSearch}>
                    <button type="submit">검색</button>
                </form> */}
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
                                    <tr key={post.forum_idx} onClick={() => handlePostClick(post.forum_idx)} className="post-row">
                                        <td>{postNumber}</td>
                                        <td>{post.forum_title}</td>
                                        <td>{post.user_id}</td>
                                        <td>{new Date(post.updatedAt).toLocaleDateString()}</td>
                                        <td>{post.forum_views || 0}</td>
                                        <td>{post.forum_recos || 0}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p>게시글이 없습니다. (검색 결과 없음)</p>
                )}
            </div>

            {totalPages > 1 && (
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
            )}
        </div>
    );
};

export default ForumBoardPage;
