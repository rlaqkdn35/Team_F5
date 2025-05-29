package com.smhrd.stock.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smhrd.stock.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByForumIdxOrderByCreatedAtAsc(int forumIdx);
    
    @Modifying
    @Query("delete from Comment c where c.forumIdx = :forumIdx")
    void deleteByForumIdx(@Param("forumIdx") Integer forumIdx);

}
