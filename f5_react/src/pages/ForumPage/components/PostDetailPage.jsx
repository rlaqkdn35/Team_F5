import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PostDetailPage.css';
import { FaHeart } from 'react-icons/fa';
import { FaHeartCrack } from 'react-icons/fa6';

const PostDetailPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [hasRecommended, setHasRecommended] = useState(false);

    // 로컬스토리지에서 userId 가져오기 (없으면 null 또는 undefined)
    const currentUserId = localStorage.getItem('userId'); // 빈 문자열 기본값 제거

    // 게시글 + 댓글 + 추천 여부 불러오기
    const fetchPost = () => {
        setLoading(true);
        setError(null);

        axios.get(`http://localhost:8084/F5/forum/detail/${postId}`, {
            params: {
                userId: currentUserId || '' // 서버에서 userId가 null/undefined일 경우 빈 문자열로 처리
            }
        })
        .then(response => {
            const data = response.data;

            const postData = {
                id: data.forum?.forum_idx,
                title: data.forum?.forum_title,
                author: data.forum?.user_id,
                user_nickname: data.nickname,
                date: data.forum?.createdAt ? new Date(data.forum.createdAt).toLocaleDateString('ko-KR') : '',
                views: data.forum?.forum_views || 0,
                content: data.forum?.forum_content,
                forum_file: data.forum?.forum_file,
                comments: data.comments || []
            };

            setPost(postData);
            // 로그인 상태일 때만 추천 여부 설정
            setHasRecommended(currentUserId ? data.userRecommended || false : false);
            setLoading(false);
        })
        .catch(err => {
            console.error('게시글 조회 중 오류 발생:', err);
            setError('게시글을 불러오는 데 실패했습니다.');
            setLoading(false);
        });
    };

    useEffect(() => {
        const key = `viewed_forum_${postId}`;
        const lastViewed = localStorage.getItem(key);
        const now = Date.now();

        if (!lastViewed || now - lastViewed > 300000) {
            axios.put(`http://localhost:8084/F5/forum/view/${postId}`)
                .then(() => {
                    localStorage.setItem(key, now);
                    fetchPost();
                })
                .catch((err) => {
                    console.error("조회수 증가 실패:", err);
                    fetchPost();
                });
        } else {
            fetchPost();
        }
    }, [postId, currentUserId]); // currentUserId가 변경될 때도 fetchPost를 다시 호출하도록 추가 (선택적)

    const handleDelete = () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            axios.delete(`http://localhost:8084/F5/forum/delete/${post.id}`)
                .then(() => {
                    alert('게시글이 삭제되었습니다.');
                    navigate('/forum');
                })
                .catch(err => {
                    console.error('[handleDelete] 게시글 삭제 중 오류 발생:', err);
                    alert('삭제 실패');
                });
        }
    };

    const handleEdit = () => {
        navigate(`/forum/edit/${postId}`);
    };

    const handleCommentSubmit = async () => {
        if (!currentUserId) { // 로그인 여부 확인 추가
            alert('로그인 후 댓글을 작성할 수 있습니다.');
            return;
        }
        if (!newComment.trim()) {
            alert('댓글을 입력하세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            await axios.post(`http://localhost:8084/F5/forum/${postId}/comments`, {
                user_id: currentUserId, // 이미 String 타입의 userId를 보냄
                content: newComment
            });

            setNewComment('');
            fetchPost();
        } catch (error) {
            console.error('댓글 등록 실패:', error);
            alert('댓글 등록 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 추천 토글 함수
    const handleRecommendToggle = async () => {
        if (!currentUserId) { // 로그인 여부 확인 추가
            alert('로그인 후 추천할 수 있습니다.');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8084/F5/forum-recos/toggle-recommend`, null, {
                params: {
                    userId: currentUserId,
                    forumIdx: post.id
                }
            });

            if (response.data === "추천 완료") {
                setHasRecommended(true);
                alert("추천이 완료되었습니다.");
            } else {
                setHasRecommended(false);
                alert("추천이 취소되었습니다.");
            }
        } catch (error) {
            console.error("추천 토글 실패:", error);
            alert("추천 처리 중 오류가 발생했습니다.");
        }
    };

    if (loading) return <div className="post-detail-container">게시글을 불러오는 중입니다...</div>;
    if (error) return <div className="post-detail-container">{error}</div>;
    if (!post) return <div className="post-detail-container">게시글을 찾을 수 없습니다.</div>;

    const imageUrl = `http://localhost:8084/F5/forum/images/${post.forum_file}`;

    return (
        <div>
            <div className="post-detail-container">
                <div className="post-detail-header">
                    <h2>{post.title}</h2>
                    <div className="post-meta">
                        <span>작성자: <strong>{post.user_nickname}</strong></span>
                        <span>날짜: {post.date}</span>
                        <span>조회수: {post.views}</span>
                        {/* 로그인한 사용자에게만 추천 버튼 표시 또는 비활성화 */}
                        <button onClick={handleRecommendToggle} disabled={!currentUserId}>
                            {hasRecommended ? (
                                <>
                                    <FaHeartCrack /> 추천 취소
                                </>
                            ) : (
                                <>
                                    <FaHeart /> 추천하기
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="post-content">
                    <p>{post.content}</p>

                    {post.forum_file && (
                        <div className="post-image">
                            <img
                                src={imageUrl}
                                alt="첨부 이미지"
                                onError={e => {
                                    console.error('이미지 로딩 실패:', e.target.src);
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="post-actions">
                    <button onClick={() => navigate('/forum')} className="back-button">
                        목록으로
                    </button>

                    {/* 로그인한 사용자가 게시글 작성자인 경우에만 수정/삭제 버튼 표시 */}
                    {post.author === currentUserId && (
                        <>
                            <button onClick={handleEdit} className="edit-button">
                                수정
                            </button>
                            <button onClick={handleDelete} className="delete-button">
                                삭제
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="comments-section">
                <h3>댓글 ({post.comments.length})</h3>
                {post.comments.length > 0 ? (
                    <ul className="comments-list">
                        {post.comments.map(comment => (
                            <li key={comment.cmtIdx} className="comment-item">
                                <p>{comment.cmtContent}</p>
                                <div className="comment-meta">
                                    <strong>{comment.userId}</strong>
                                    <span>{new Date(comment.createdAt).toLocaleDateString('ko-KR')}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-comments">아직 댓글이 없습니다.</p>
                )}

                <div className="comment-form">
                    <textarea
                        placeholder="댓글을 입력하세요"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        // 로그인하지 않았으면 댓글 입력창 비활성화
                        disabled={!currentUserId || isSubmitting}
                    />
                    <button
                        onClick={handleCommentSubmit}
                        disabled={!currentUserId || isSubmitting} // 로그인하지 않았으면 버튼 비활성화
                    >
                        {isSubmitting ? '등록 중...' : '댓글 등록'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostDetailPage;