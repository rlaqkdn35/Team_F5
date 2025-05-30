package com.smhrd.stock.service;

import com.smhrd.stock.entity.Comment;
import com.smhrd.stock.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    // 댓글 등록
    public Comment saveComment(int forumIdx, String userId, String content) {
        Comment comment = new Comment();
        comment.setForumIdx(forumIdx);           // setForumIdx로 변경
        comment.setUserId(userId);                // setUserId로 변경
        comment.setCmtContent(content);           // setCmtContent로 변경
        comment.setCreatedAt(new Timestamp(System.currentTimeMillis())); // setCreatedAt로 변경

        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByForumId(int forumIdx) {
        System.out.println("서비스 - 댓글 리스트 조회 forumIdx: " + forumIdx);
        List<Comment> comments = commentRepository.findByForumIdxOrderByCreatedAtAsc(forumIdx);
        System.out.println("서비스 - 조회된 댓글 수: " + comments.size());
        return comments;
    }

}
