package com.smhrd.stock.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.entity.ForumRecos;

@Repository
public interface ForumRecoRepository extends JpaRepository<ForumRecos, Long> {

    // 특정 유저가 특정 게시글에 추천한 기록이 있는지 확인
    Optional<ForumRecos> findByUserIdAndForumIdx(String userId, Integer forumIdx);
}