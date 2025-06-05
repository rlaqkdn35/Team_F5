package com.smhrd.stock.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.stock.dto.ForumDTO;
import com.smhrd.stock.dto.ForumListResponse;
import com.smhrd.stock.dto.ForumSummaryDTO;
import com.smhrd.stock.entity.Comment;
import com.smhrd.stock.entity.StockForum;
import com.smhrd.stock.repository.CommentRepository;
import com.smhrd.stock.repository.ForumRepository;
import com.smhrd.stock.repository.UserRepository;

@Service
public class ForumService {

    @Autowired
    private ForumRepository repository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    public List<StockForum> boardList() {
        return repository.findAll();
    }

    public void boardInsert(StockForum vo) {
        repository.save(vo);
    }

    @Transactional
    public void boardDelete(Integer forumIdx) {
        commentRepository.deleteByForumIdx(forumIdx);
        repository.deleteById(forumIdx);
    }

    public StockForum getForumDetail(Integer forumId) {
        System.out.println("[ForumService] 게시글 상세 조회 시도: " + forumId);
        return repository.findById(forumId).orElse(null);
    }

    public StockForum findById(Integer forumIdx) {
        return repository.findById(forumIdx).orElse(null);
    }

    @Transactional
    public void boardUpdate(StockForum updatedForum) {
        StockForum existingForum = repository.findById(updatedForum.getForum_idx())
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));

        existingForum.setForum_title(updatedForum.getForum_title());
        existingForum.setForum_content(updatedForum.getForum_content());
        existingForum.setStock_code(updatedForum.getStock_code());
        existingForum.setUser_id(updatedForum.getUser_id());

        if (updatedForum.getForum_file() != null) {
            existingForum.setForum_file(updatedForum.getForum_file());
        }
    }

    // 게시글 + 댓글 + 작성자 닉네임 조회 (추천 여부는 여기서 처리하지 않고 컨트롤러에서 처리)
    public ForumDTO getForumDetailWithComments(Integer forumId) {
        System.out.println("[ForumService] getForumDetailWithComments 호출 - forumId: " + forumId);

        StockForum forum = repository.findById(forumId).orElse(null);
        if (forum == null) {
            System.out.println("[ForumService] 게시글이 존재하지 않습니다: " + forumId);
            return null;
        }

        System.out.println("[ForumService] 게시글 정보: " + forum);

        List<Comment> comments = commentRepository.findByForumIdxOrderByCreatedAtAsc(forumId);
        System.out.println("[ForumService] 댓글 개수: " + comments.size());

        String nickname = null;
        if (forum.getUser_id() != null && !forum.getUser_id().isEmpty()) {
            System.out.println("[ForumService] 작성자 user_id: " + forum.getUser_id());

            Optional<String> optNickname = userRepository.findNicknameByUserId(forum.getUser_id());
            System.out.println("[ForumService] userRepository.findNicknameByUserId 결과 Optional: " + optNickname);

            nickname = optNickname.orElse(null);
            System.out.println("[ForumService] 조회된 닉네임: " + nickname);
        } else {
            System.out.println("[ForumService] user_id가 null이거나 비어있음");
        }

        // 추천 여부 필드는 false 기본값으로 반환, 실제 추천 여부는 컨트롤러에서 세팅
        return new ForumDTO(forum, comments, nickname, false);
    }

    @Transactional
    public void incrementViewCount(Integer forumIdx) {
        StockForum forum = repository.findById(forumIdx)
                .orElseThrow(() -> new RuntimeException("해당 게시글이 존재하지 않습니다: " + forumIdx));
        forum.setForum_views(forum.getForum_views() + 1);
        repository.save(forum);
    }

    // 게시글 목록 + 닉네임 포함해서 반환
    public ForumListResponse getForumListWithCount() {
        List<StockForum> forums = repository.findAll();
        long totalCount = forums.size();

        List<ForumSummaryDTO> forumDTOs = new ArrayList<>();

        for (StockForum forum : forums) {
            String nickname = null;
            if (forum.getUser_id() != null && !forum.getUser_id().isEmpty()) {
                Optional<String> optNickname = userRepository.findNicknameByUserId(forum.getUser_id());
                nickname = optNickname.orElse(null);
            }

            ForumSummaryDTO dto = new ForumSummaryDTO(
                    forum.getForum_idx(),
                    forum.getForum_title(),
                    forum.getUser_id(),
                    nickname,
                    forum.getCreatedAt(),
                    forum.getForum_views(),
                    forum.getForum_recos()
            );
            forumDTOs.add(dto);
        }

        return new ForumListResponse(totalCount, forumDTOs);
    }
}
