import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PostEditPage.css';

const PostEditPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [originalFileName, setOriginalFileName] = useState('');
    const [stockCode, setStockCode] = useState('');
    const currentUserId = '123'; // 임시 사용자 ID

    useEffect(() => {
        console.log('useEffect 실행, postId:', postId);
        axios.get(`http://localhost:8084/F5/forum/detail/${postId}`)
            .then(response => {
                const forum = response.data.forum;
                console.log('게시글 데이터 받아옴:', forum);
                setTitle(forum.forum_title ?? '');
                setContent(forum.forum_content ?? '');
                setOriginalFileName(forum.forum_file ?? '');
                setStockCode(forum.stock_code ?? '');
            })
            .catch(err => {
                console.error('게시글 불러오기 실패:', err);
                alert('게시글 정보를 불러오는 데 실패했습니다.');
                navigate('/forum');
            });
    }, [postId, navigate]);

    const handleFileChange = (e) => {
        console.log('파일 변경:', e.target.files[0]);
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('수정 제출 클릭 - 상태값들:', { postId, title, content, file, stockCode, currentUserId });

        const formData = new FormData();
        formData.append('forum_title', title);
        formData.append('forum_content', content);
        formData.append('stock_code', stockCode); // 히든 필드로 전달
        formData.append('user_id', currentUserId);

        if (file) {
            formData.append('forum_file', file); // 새 파일이 있으면 첨부
        }

        try {
            await axios.put(`http://localhost:8084/F5/forum/update/${postId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('수정 완료, postId:', postId);
            alert('게시글이 수정되었습니다.');
            navigate(`/forum/post/${postId}`);
        } catch (error) {
            console.error('수정 실패:', error);
            alert('게시글 수정에 실패했습니다.');
        }
    };

    const handleCancel = () => {
        console.log('취소 버튼 클릭, postId:', postId);
        navigate(`/forum/post/${postId}`);
    };

    return (
        <div className="post-edit-container">
            <h2>게시글 수정</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-group">
                    <label>제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>내용</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={10}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>이미지 파일 (선택)</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    {originalFileName && (
                        <p>현재 이미지: {originalFileName}</p>
                    )}
                </div>

                {/* 히든 처리된 stock_code */}
                <input type="hidden" name="stock_code" value={stockCode} />

                <div className="form-actions">
                    <button type="submit" className="submit-button">수정 완료</button>
                    <button type="button" onClick={handleCancel}>취소</button>
                </div>
            </form>
        </div>
    );
};

export default PostEditPage;
