import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WritePostPage.css';

const WritePostPage = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [selectedStockCode, setSelectedStockCode] = useState('');
    const [userId, setUserId] = useState('123');
    const [stockOptions, setStockOptions] = useState([]);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const response = await axios.get('http://localhost:8084/F5/api/stocks');
                setStockOptions(response.data);
            } catch (error) {
                console.error('종목 정보를 가져오는 중 오류 발생:', error);
                setStockOptions([]);
            }
        };
        fetchStocks();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setAttachedFile(file);
    };

    const handleStockCodeChange = (e) => {
        const inputValue = e.target.value;
        setSelectedStockCode(inputValue);

        if (inputValue.trim() === '') {
            setFilteredStocks([]);
            setShowDropdown(false);
            return;
        }

        const filtered = stockOptions.filter(stock =>
            `${stock.stock_code} ${stock.stock_name}`.toLowerCase().includes(inputValue.toLowerCase())
        );

        setFilteredStocks(filtered.slice(0, 10)); // 최대 10개만 표시
        setShowDropdown(true);
    };

    const handleSelectStock = (stock) => {
        const value = `${stock.stock_code} (${stock.stock_name})`;
        setSelectedStockCode(value);
        setFilteredStocks([]);
        setShowDropdown(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        const stockCode = selectedStockCode.split(' ')[0];

        const isValidStockCode = stockOptions.some(stock => stock.stock_code === stockCode);

        if (selectedStockCode.trim() && !isValidStockCode) {
            alert("유효한 종목을 선택해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append('forum_title', title);
        formData.append('forum_content', content);
        formData.append('stock_code', stockCode);
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
            <h2>새 글 작성</h2>
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
                        type="text"
                        id="stockSearch"
                        value={selectedStockCode}
                        onChange={handleStockCodeChange}
                        placeholder="종목 코드 또는 이름 입력 (예: 005930 또는 삼성전자)"
                        autoComplete="off"
                        onFocus={() => {
                            if (filteredStocks.length > 0) setShowDropdown(true);
                        }}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    />
                    {showDropdown && (
                        <ul className="dropdown">
                            {filteredStocks.map(stock => (
                                <li
                                    key={stock.stock_code}
                                    onClick={() => handleSelectStock(stock)}
                                >
                                    {stock.stock_code} ({stock.stock_name})
                                </li>
                            ))}
                        </ul>
                    )}
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
