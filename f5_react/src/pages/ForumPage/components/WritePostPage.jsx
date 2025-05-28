import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WritePostPage.css';

const WritePostPage = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [selectedStockCode, setSelectedStockCode] = useState(''); // 선택된 종목 코드 상태
    const [userId, setUserId] = useState('user123'); // 예시, 실제 로그인된 유저 아이디 넣기

    const pageTitle = "새 글 작성";

    // 예시: 자동 완성을 위한 종목 데이터 (실제로는 API에서 가져오는 것이 일반적입니다)
    const stockOptions = [
        { code: '005930', name: '삼성전자' },
        { code: '000660', name: 'SK하이닉스' },
        { code: '035720', name: '카카오' },
        { code: '005380', name: '현대차' },
        { code: '005490', name: 'POSCO홀딩스' },
        { code: '068270', name: '셀트리온' },
        { code: '207940', name: '삼성바이오로직스' },
        { code: '051910', name: 'LG화학' },
        { code: '035420', name: '네이버' },
        { code: '000270', name: '기아' },
    ];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setAttachedFile(file);
        if (file) {
            console.log("선택된 파일:", file.name, file.size, file.type);
        }
    };

    const handleStockCodeChange = (e) => {
        setSelectedStockCode(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        // 선택된 종목 코드가 유효한지 확인 (선택 사항, 필요에 따라 강화)
        const isValidStockCode = stockOptions.some(stock =>
            `${stock.code} (${stock.name})` === selectedStockCode || stock.code === selectedStockCode
        );

        // 사용자가 아무것도 선택하지 않거나 유효하지 않은 값을 입력했을 때 경고
        if (selectedStockCode.trim() && !isValidStockCode) {
            alert("유효한 종목 코드를 선택하거나 정확하게 입력해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append('forum_title', title);
        formData.append('forum_content', content);
        // 실제 전송 시에는 '005930 (삼성전자)' 형태가 아닌 '005930'만 전송해야 합니다.
        // 여기서는 예시로 통째로 보내지만, 백엔드 요구사항에 맞게 파싱 필요
        formData.append('stock_code', selectedStockCode.split(' ')[0]); // 괄호 안의 종목명 제거
        formData.append('user_id', userId);
        if (attachedFile) {
            formData.append('forum_file', attachedFile);
        }

        try {
            const response = await axios.post('http://localhost:8084/F5/api/forum/insert', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            alert("게시글이 성공적으로 작성되었습니다!");
            navigate('/forum');
        } catch (error) {
            console.error("게시글 작성 중 오류 발생:", error);
            alert("게시글 작성에 실패했습니다.");
        }
    };

    const handleCancel = () => {
        navigate(-1);
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
                    <label htmlFor="stockSearch">관련 종목:</label>
                    <input
                        list="stockOptions"
                        id="stockSearch"
                        name="stockSearch"
                        value={selectedStockCode}
                        onChange={handleStockCodeChange}
                        placeholder="종목명 또는 종목코드 입력 (예: 삼성전자 또는 005930)"
                    />
                    <datalist id="stockOptions">
                        {stockOptions.map((stock) => (
                            <option key={stock.code} value={`${stock.code} (${stock.name})`}>
                                {stock.name} ({stock.code})
                            </option>
                        ))}
                    </datalist>
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
                <div className="form-group file-upload-group">
                    <label htmlFor="file">첨부 파일:</label>
                    <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                    />
                    {attachedFile && (
                        <p className="selected-file-info">선택된 파일: {attachedFile.name} ({Math.round(attachedFile.size / 1024)} KB)</p>
                    )}
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-button">작성 완료</button>
                    <button type="button" onClick={handleCancel} className="cancel-button">취소</button>
                </div>
            </form>
        </div>
    );
};

export default WritePostPage;