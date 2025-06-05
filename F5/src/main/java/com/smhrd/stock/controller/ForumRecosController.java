package com.smhrd.stock.controller;

import com.smhrd.stock.service.ForumRecosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forum-recos")
@RequiredArgsConstructor
public class ForumRecosController {

    private final ForumRecosService service;

    @PostMapping("/toggle-recommend")
    public ResponseEntity<String> toggleRecommend(
            @RequestParam String userId,
            @RequestParam Integer forumIdx
    ) {
        boolean isRecommended = service.toggleRecommend(userId, forumIdx);
        if (isRecommended) {
            return ResponseEntity.ok("추천 완료");
        } else {
            return ResponseEntity.ok("추천이 취소되었습니다.");
        }
    }
}
