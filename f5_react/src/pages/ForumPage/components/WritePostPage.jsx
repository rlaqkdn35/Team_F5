import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WritePostPage.css';

const WritePostPage = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [selectedStockCode, setSelectedStockCode] = useState(''); // 선택된 종목 코드 상태
    const [userId, setUserId] = useState('123'); // 예시, 실제 로그인된 유저 아이디 넣기
    const [stockOptions, setStockOptions] = useState([]); // 서버에서 받아올 종목 리스트

    const pageTitle = "새 글 작성";

    // 서버에서 종목 리스트를 가져오는 useEffect
    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const response = await axios.get('http://localhost:8084/F5/api/stocks');
                // response.data가 [{stock_code, stock_name, ...}, ...] 형태라고 가정
                setStockOptions(response.data);
            } catch (error) {
                console.error('종목 정보를 가져오는 중 오류 발생:', error);
                setStockOptions([]); // 에러시 빈 배열
            }
        };
        fetchStocks();
    }, []);

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

        // 선택된 종목 코드가 유효한지 확인
        const isValidStockCode = stockOptions.some(stock =>
            `${stock.stock_code} (${stock.stock_name})` === selectedStockCode || stock.stock_code === selectedStockCode
        );

        if (selectedStockCode.trim() && !isValidStockCode) {
            alert("유효한 종목 코드를 선택하거나 정확하게 입력해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append('forum_title', title);
        formData.append('forum_content', content);
        formData.append('stock_code', selectedStockCode.split(' ')[0]); // '005930 (삼성전자)' -> '005930'
        formData.append('user_id', userId);
        if (attachedFile) {
            formData.append('forum_file', attachedFile);
        }

        try {
            await axios.post('http://localhost:8084/F5/api/forum/insert', formData, {
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
                        placeholder="종목명 또는 종목코드 입력"
                    />
                    <datalist id="stockOptions">
                        {stockOptions.map((stock) => (
                            <option key={stock.stock_code} value={`${stock.stock_code} (${stock.stock_name})`}>
                                {stock.stock_name} ({stock.stock_code})
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
                        <p className="selected-file-info">
                            선택된 파일: {attachedFile.name} ({Math.round(attachedFile.size / 1024)} KB)
                        </p>
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
