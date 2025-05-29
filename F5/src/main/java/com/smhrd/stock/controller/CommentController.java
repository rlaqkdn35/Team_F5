package com.smhrd.stock.controller;

import com.smhrd.stock.entity.Comment;
import com.smhrd.stock.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/forum")
@CrossOrigin(origins = "http://localhost:3000") // 필요 시 추가
public class CommentController {

    @Autowired
    private CommentService commentService;

    // 댓글 등록
    @PostMapping("/{postId}/comments")
    public Map<String, Object> addComment(
            @PathVariable("postId") int postId,
            @RequestBody Map<String, String> payload
    ) {
        System.out.println("Payload received: " + payload);
        String userId = payload.get("user_id");
        String content = payload.get("content");
        System.out.println("userId=" + userId + ", content=" + content);

        // null 체크
        if (userId == null || content == null) {
            throw new IllegalArgumentException("user_id or content is missing");
        }

        Comment saved = commentService.saveComment(postId, userId, content);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "댓글 등록 완료");
        result.put("commentId", saved.getCmtIdx());
        return result;
    }


    @GetMapping("/{postId}/comments")
    public List<Map<String, Object>> getComments(@PathVariable("postId") int postId) {
        System.out.println("댓글 조회 요청 - postId: " + postId);
        
        List<Comment> comments = commentService.getCommentsByForumId(postId);
        System.out.println("조회된 댓글 수: " + comments.size());
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Comment c : comments) {
            System.out.println("댓글 id: " + c.getCmtIdx() + ", 작성자: " + c.getUserId() + ", 내용: " + c.getCmtContent());
            
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getCmtIdx());               
            map.put("author", c.getUserId());           
            map.put("date", c.getCreatedAt().toString().split(" ")[0]); 
            map.put("text", c.getCmtContent());         
            result.add(map);
        }
        return result;
    }

}
