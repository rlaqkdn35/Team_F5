package com.smhrd.stock.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.stock.entity.Comment;
import com.smhrd.stock.entity.ForumDTO;
import com.smhrd.stock.entity.StockForum;
import com.smhrd.stock.repository.CommentRepository;
import com.smhrd.stock.repository.ForumRepository;

@Service
public class ForumService {

	@Autowired
	private ForumRepository repository;

	@Autowired
	private CommentRepository commentRepository;  // 댓글 레포 추가 주입
	
	public List<StockForum> boardList() {
		return repository.findAll();
	}

	public void boardInsert(StockForum vo) {
		repository.save(vo);
	}

	@Transactional
	public void boardDelete(Integer forumIdx) {
	    // 1. 해당 게시글에 달린 댓글 삭제
	    commentRepository.deleteByForumIdx(forumIdx);

	    // 2. 게시글 삭제
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
		// 1. 기존 게시글 조회
		StockForum existingForum = repository.findById(updatedForum.getForum_idx())
				.orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));

		// 2. 기존 엔티티 값 변경 (createdAt은 변경하지 않음)
		existingForum.setForum_title(updatedForum.getForum_title());
		existingForum.setForum_content(updatedForum.getForum_content());
		existingForum.setStock_code(updatedForum.getStock_code());
		existingForum.setUser_id(updatedForum.getUser_id());

		// 3. 파일명이 새로 들어오면 변경, 없으면 유지
		if (updatedForum.getForum_file() != null) {
			existingForum.setForum_file(updatedForum.getForum_file());
		}

		// 4. updatedAt은 @PreUpdate가 자동 갱신 처리
		// 별도의 save 호출 필요 없음 (JPA 변경 감지 기능)
	}

	// 게시글 + 댓글 목록 같이 가져오기 (DTO 반환)
	public ForumDTO getForumDetailWithComments(Integer forumId) {
		StockForum forum = repository.findById(forumId).orElse(null);
		if (forum == null) {
			return null;
		}
		List<Comment> comments = commentRepository.findByForumIdxOrderByCreatedAtAsc(forumId);
		return new ForumDTO(forum, comments);
	}

	@Transactional
	public void incrementViewCount(Integer forumIdx) {
	    Optional<StockForum> optionalForum = repository.findById(forumIdx);
	    if (optionalForum.isPresent()) {
	        StockForum forum = optionalForum.get();
	        forum.setForum_views(forum.getForum_views() + 1);
	        repository.save(forum);
	    } else {
	        throw new RuntimeException("해당 게시글이 존재하지 않습니다: " + forumIdx);
	    }
	}



	
}
