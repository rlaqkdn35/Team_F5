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
    const currentUserId = '12341234'; // 임시 사용자 ID

    useEffect(() => {
        console.log('[useEffect] postId:', postId);

        const fetchPostDetail = async () => {
            try {
                console.log(`[GET] 게시글 상세 정보 요청: /F5/forum/detail/${postId}`);
                const response = await axios.get(`http://localhost:8084/F5/forum/detail/${postId}`, {
                    withCredentials: true,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                console.log('[GET] 게시글 상세 응답:', response);

                const forum = response.data?.forum;

                if (!forum) {
                    console.warn('[GET] forum 데이터 없음 또는 비어 있음:', response.data);
                    alert('게시글 데이터를 불러올 수 없습니다.');
                    navigate('/forum');
                    return;
                }

                console.log('[GET] forum 데이터:', forum);
                setTitle(forum.forum_title ?? '');
                setContent(forum.forum_content ?? '');
                setOriginalFileName(forum.forum_file ?? '');
                setStockCode(forum.stockCode ?? '');

                console.log('[State] 상태 초기화 완료:', {
                    forum_title: forum.forum_title,
                    forum_content: forum.forum_content,
                    forum_file: forum.forum_file,
                    stockCode: forum.stockCode
                });

            } catch (err) {
                console.error('[GET] 게시글 불러오기 실패:', err);
                alert('게시글 정보를 불러오는 데 실패했습니다.');
                navigate('/forum');
            }
        };

        fetchPostDetail();
    }, [postId, navigate]);
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        console.log('[File Change] 선택된 파일:', selectedFile);
        setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('[Submit] 게시글 수정 요청 시작');
        console.log('[Submit] 현재 입력값:', {
            postId,
            title,
            content,
            file,
            stockCode,
            currentUserId
        });

        const formData = new FormData();
        formData.append('forum_title', title);
        formData.append('forum_content', content);
        formData.append('stockCode', stockCode);
        formData.append('user_id', currentUserId);

        if (file) {
            console.log('[Submit] 새 파일 포함됨:', file.name);
            formData.append('forum_file', file);
        } else {
            console.log('[Submit] 파일 없음, 기존 파일 유지');
        }

        try {
            console.log(`[PUT] 게시글 수정 요청: /F5/forum/update/${postId}`);
            const response = await axios.put(
                `http://localhost:8084/F5/forum/update/${postId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );
            console.log('[PUT] 게시글 수정 완료 응답:', response);

            alert('게시글이 수정되었습니다.');
            navigate(`/forum/post/${postId}`);
        } catch (error) {
            console.error('[PUT] 게시글 수정 실패:', error);
            alert('게시글 수정에 실패했습니다.');
        }
    };

    const handleCancel = () => {
        console.log('[Cancel] 수정 취소 - 이동할 postId:', postId);
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
                        onChange={(e) => {
                            console.log('[Input] 제목 변경:', e.target.value);
                            setTitle(e.target.value);
                        }}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>내용</label>
                    <textarea
                        value={content}
                        onChange={(e) => {
                            console.log('[Input] 내용 변경:', e.target.value);
                            setContent(e.target.value);
                        }}
                        rows={10}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>이미지 파일 (선택)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {originalFileName && (
                        <p>현재 이미지: {originalFileName}</p>
                    )}
                </div>

                <input type="hidden" name="stockCode" value={stockCode} />

                <div className="form-actions">
                    <button type="submit" className="submit-button">수정 완료</button>
                    <button type="button" onClick={handleCancel}>취소</button>
                </div>
            </form>
        </div>
    );
};

export default PostEditPage;
