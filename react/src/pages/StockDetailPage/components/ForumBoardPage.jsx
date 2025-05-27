// src/pages/ForumPage/components/ForumBoardPage.jsx
// ... (import 및 목업 데이터 함수 등은 이전 답변 내용 참고) ...

const ForumBoardPage = ({
  boardTitle,
  boardApiEndpoint,
  items, // 데이터를 직접 받을 수 있도록
  writePostPath,    
  postDetailBasePath, 
  showWriteButton = true, 
  authorColumnName = "작성자", 
  showLikesColumn = true,    
  showViewsColumn = true,     
}) => {
  // ... (useState, useEffect 데이터 로딩 로직은 이전과 유사)
  // useEffect에서 items prop이 있으면 API 호출 대신 items 사용하도록 수정
  const [allPosts, setAllPosts] = useState(items || []);
  const [displayPosts, setDisplayPosts] = useState([]);
  const [loading, setLoading] = useState(!items); // items prop 있으면 초기 로딩 false
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (items && items.length >= 0) { // items prop이 있으면 그것을 사용
      setAllPosts(items);
      setLoading(false);
      setCurrentPage(1); // 데이터 변경 시 첫 페이지로
      return; 
    }
    // items prop이 없으면 boardApiEndpoint로 데이터 로드
    if (boardApiEndpoint) { // boardApiEndpoint가 있을 때만 fetch
        setLoading(true);
        const fetchedPosts = getMockGenericBoardData(boardApiEndpoint, 1, ITEMS_PER_PAGE, searchTerm);
        setAllPosts(fetchedPosts);
        setLoading(false);
        setCurrentPage(1); 
    } else {
        setAllPosts([]); // 둘 다 없으면 빈 배열
        setLoading(false);
    }
  }, [boardApiEndpoint, searchTerm, items]); // items도 의존성 배열에 추가

  useEffect(() => {
    const indexOfLastPost = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstPost = indexOfLastPost - ITEMS_PER_PAGE;
    setDisplayPosts(allPosts.slice(indexOfFirstPost, indexOfLastPost));
  }, [currentPage, allPosts]);

  // ... (핸들러 함수들) ...
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = (e) => { e.preventDefault(); console.log(`"${boardTitle || '목록'}" 검색:`, searchTerm); };
  const handleWritePost = () => { if (writePostPath) navigate(writePostPath); };
  const totalPages = Math.ceil(allPosts.length / ITEMS_PER_PAGE);


  return (
    <div className="forum-board-page"> {/* 이 div에 boardType 같은 클래스 추가해서 CSS 분기 가능 */}
      <div className="page-header-fbp">
        {boardTitle && <h2 className="page-main-title-fbp">{boardTitle}</h2>}
        {showWriteButton && writePostPath && (
          <button onClick={handleWritePost} className="write-post-button-fbp">
            <FaPen style={{marginRight: '5px'}} /> 글쓰기
          </button>
        )}
      </div>

      {loading ? (
        <p className="loading-message-fbp">데이터를 불러오는 중입니다...</p>
      ) : (
        <>
          <div className="post-list-table-fbp">
            <div className="table-header-fbp">
              <span className="col-num-fbp">번호</span>
              <span className="col-title-fbp">제목</span>
              <span className="col-author-fbp">{authorColumnName}</span>
              <span className="col-date-fbp">날짜</span>
              {showViewsColumn && <span className="col-views-fbp">조회</span>}
              {showLikesColumn && <span className="col-likes-fbp">추천</span>}
              {/* 리포트 탭의 '목표가'와 같은 추가/다른 컬럼은 이 기본 구조에서는 표시 어려움 */}
            </div>
            <ul className="table-body-fbp">
              {displayPosts.length > 0 ? displayPosts.map((post, index) => (
                <li key={post.id || `post-${index}`} className="table-row-fbp"> {/* post.id가 없을 경우 대비 */}
                  <span className="col-num-fbp">{allPosts.indexOf(post) + 1}</span>
                  <span className="col-title-fbp">
                    {postDetailBasePath && post.id ? ( // post.id가 있어야 상세 링크 생성
                       <Link to={`${postDetailBasePath}/${post.id}`}>{post.title}</Link>
                    ) : (
                       <span>{post.title}</span>
                    )}
                  </span>
                  <span className="col-author-fbp">{post.author}</span>
                  <span className="col-date-fbp">{post.date}</span>
                  {showViewsColumn && <span className="col-views-fbp">{post.views?.toLocaleString()}</span>}
                  {showLikesColumn && <span className="col-likes-fbp">{post.likes}</span>}
                </li>
              )) : (
                <li className="no-posts-message-fbp">표시할 내용이 없습니다.</li>
              )}
            </ul>
          </div>
          {/* ... (검색창, 페이지네이션) ... */}
          <div className="list-footer-fbp">
            <form onSubmit={handleSearchSubmit} className="search-bar-fbp">
              <input type="text" placeholder={`${authorColumnName}, 제목 검색`} value={searchTerm} onChange={handleSearchChange} />
              <button type="submit"><FaSearch /></button>
            </form>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </>
      )}
    </div>
  );
};

// PropTypes 정의 (이전과 동일 + items 추가)
ForumBoardPage.propTypes = {
  boardTitle: PropTypes.string,
  boardApiEndpoint: PropTypes.string, // items가 제공되지 않으면 필수
  items: PropTypes.array, // 데이터를 직접 전달받을 경우
  writePostPath: PropTypes.string,
  postDetailBasePath: PropTypes.string,
  showWriteButton: PropTypes.bool,
  authorColumnName: PropTypes.string,
  showLikesColumn: PropTypes.bool,
  showViewsColumn: PropTypes.bool,
};
ForumBoardPage.defaultProps = { // 기본값 설정
    showWriteButton: true,
    authorColumnName: "작성자",
    showLikesColumn: true,
    showViewsColumn: true,
};


export default ForumBoardPage;