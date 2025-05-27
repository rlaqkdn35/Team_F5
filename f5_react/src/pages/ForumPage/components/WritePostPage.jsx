// pages/ForumPage/components/WritePostPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WritePostPage.css';

const WritePostPage = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [attachedFile, setAttachedFile] = useState(null); // 첨부 파일 상태 추가

    const pageTitle = "새 글 작성";

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        // 선택된 파일들을 가져옵니다. (다중 파일 선택을 허용하지 않는다면 e.target.files[0]만 사용)
        const file = e.target.files[0];
        setAttachedFile(file); // 선택된 첫 번째 파일을 상태에 저장
        if (file) {
            console.log("선택된 파일:", file.name, file.size, file.type);
            // 실제 파일 업로드는 여기서 백엔드 API 호출을 통해 이루어집니다.
            // 예: uploadFileToBackend(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 제목이나 내용이 비어있는 경우 간단한 유효성 검사
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        // 실제로는 여기에서 제목, 내용, attachedFile을 백엔드로 전송하는 로직이 들어갑니다.
        console.log("제목:", title);
        console.log("내용:", content);
        if (attachedFile) {
            console.log("첨부 파일:", attachedFile.name);
            // 백엔드 통신 시, FormData를 사용하여 파일과 다른 데이터를 함께 보냅니다.
            /*
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('file', attachedFile);
            
            // 예시: axios.post('/api/posts', formData, {
            //   headers: {
            //     'Content-Type': 'multipart/form-data'
            //   }
            // });
            */
        } else {
            console.log("첨부 파일 없음");
        }

        alert(`'${title}' 게시글이 (가상으로) 작성되었습니다!`);

        // 글쓰기 완료 후 통합 게시판 목록 페이지로 이동
        navigate(`/forum`);
    };

    const handleCancel = () => {
        navigate(-1); // 이전 페이지로 돌아갑니다.
    };

    return (
        <div className="write-post-container">
            <h2>{pageTitle}</h2>
            <form onSubmit={handleSubmit} className="write-post-form">
                <div className="form-group">
                    <label htmlFor="title">제목:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="content">내용:</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="15"
                        placeholder="내용을 입력하세요"
                        required
                    ></textarea>
                </div>
                {/* 첨부 파일 입력 필드 추가 */}
                <div className="form-group file-upload-group">
                    <label htmlFor="file">첨부 파일:</label>
                    <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        // multiple // 여러 파일 선택을 허용하려면 이 속성을 추가
                    />
                    {attachedFile && (
                        <p className="selected-file-info">선택된 파일: {attachedFile.name} ({Math.round(attachedFile.size / 1024)} KB)</p>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        작성 완료
                    </button>
                    <button type="button" onClick={handleCancel} className="cancel-button">
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WritePostPage;