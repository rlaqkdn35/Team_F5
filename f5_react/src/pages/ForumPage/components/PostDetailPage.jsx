// pages/ForumPage/components/PostDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PostDetailPage.css';

const PostDetailPage = () => {
    // URL 파라미터에서 게시글 ID만 가져옵니다. boardType은 제거합니다.
    const { postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    // 게시판 타입에 따른 한글 제목 매핑 함수는 이제 필요 없거나 간소화됩니다.
    // 이 페이지는 특정 boardType이 아닌 통합 게시판의 게시글을 보여주기 때문입니다.
    // const getBoardTitle = (type) => { ... } // 이 함수는 필요 없습니다.

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const mockPost = {
                id: parseInt(postId),
                // boardType: boardType, // 이 속성도 이제 Mock 데이터에서 필요 없습니다.
                title: `통합 게시판 게시글 제목 ${postId}`, // 통합 게시판 제목으로 변경
                author: `사용자${Math.floor(Math.random() * 100) + 1}`,
                date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toLocaleDateString('ko-KR'),
                views: Math.floor(Math.random() * 1000) + 100,
                content: `이것은 통합 게시판의 ${postId}번 게시글에 대한 가짜 상세 내용입니다. 백엔드가 없으므로 이 내용은 임시로 생성되었습니다. 여기에는 게시글의 더 길고 자세한 내용이 들어갑니다.

                주식 시장은 복잡하고 예측 불가능한 요소들로 가득합니다. 기업 실적, 거시 경제 지표, 국제 정세, 기술 혁신 등 다양한 요인들이 주가에 영향을 미칩니다. 이러한 변수들을 분석하고 투자 결정을 내리는 것은 쉽지 않은 일입니다.

                하지만 꾸준한 학습과 정보 수집, 그리고 자신만의 투자 원칙을 세우는 것이 중요합니다. 단순히 소문에 의존하거나 단기적인 변동에 일희일비하기보다는, 장기적인 관점에서 기업의 본질적인 가치를 평가하고 인내심을 가지고 투자하는 자세가 필요합니다.

                오늘의 시장 동향은 어떠했는지, 특별히 주목할 만한 이슈는 없었는지 함께 이야기 나눠봅시다. 건강한 투자 습관을 통해 모두 성공적인 투자를 하시길 바랍니다!`,
                comments: [
                    { id: 1, author: '댓글러1', text: '좋은 정보 감사합니다!', date: '2023-05-26' },
                    { id: 2, author: '댓글러2', text: '저도 같은 생각입니다.', date: '2023-05-26' },
                ]
            };
            setPost(mockPost);
            setLoading(false);
        }, 500);
    }, [postId]); // postId가 변경될 때만 데이터를 다시 불러옵니다. boardType은 필요 없습니다.

    if (loading) {
        return <div className="post-detail-container">게시글을 불러오는 중입니다...</div>;
    }

    if (!post) {
        return <div className="post-detail-container">게시글을 찾을 수 없습니다.</div>;
    }

    return (
        <div className="post-detail-container">
            <div className="post-detail-header">
                <h2>{post.title}</h2>
                <div className="post-meta">
                    <span>작성자: **{post.author}**</span>
                    <span>날짜: {post.date}</span>
                    <span>조회수: {post.views}</span>
                </div>
            </div>
            <div className="post-content">
                <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
            </div>

            <div className="comments-section">
                <h3>댓글 ({post.comments.length})</h3>
                {post.comments.length > 0 ? (
                    <ul className="comments-list">
                        {post.comments.map(comment => (
                            <li key={comment.id} className="comment-item">
                                <div className="comment-meta">
                                    <strong>{comment.author}</strong>
                                    <span>{comment.date}</span>
                                </div>
                                <p>{comment.text}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-comments">아직 댓글이 없습니다.</p>
                )}
            </div>

            <div className="post-actions">
                <button onClick={() => navigate(`/forum`)} className="back-button"> {/* /forum으로 이동 */}
                    목록으로
                </button>
            </div>
        </div>
    );
};

export default PostDetailPage;