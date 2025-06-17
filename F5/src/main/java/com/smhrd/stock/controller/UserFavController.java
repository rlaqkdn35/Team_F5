package com.smhrd.stock.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.stock.dto.UserFavStockDetailDto;
import com.smhrd.stock.entity.UserFav;
import com.smhrd.stock.service.UserFavService;


@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/userfav")
public class UserFavController {
	private final UserFavService userFavService;

    public UserFavController(UserFavService userFavService) {
        this.userFavService = userFavService;
    }

    // 관심 종목 추가 (POST /api/users/{userId}/favorites/{stockCode})
    @PostMapping("/{userId}/favorites/{stockCode}")
    public ResponseEntity<UserFav> addFavorite(
            @PathVariable String userId,
            @PathVariable String stockCode) {
        UserFav userFav = userFavService.addFavorite(userId, stockCode);
        if (userFav != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(userFav); // 201 Created
        } else {
            // 이미 존재할 경우 409 Conflict 또는 200 OK (멱등성)
            // 여기서는 409 Conflict를 반환하여 이미 등록된 상태임을 알림
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    // 관심 종목 삭제 (DELETE /api/users/{userId}/favorites/{stockCode})
    @DeleteMapping("/{userId}/favorites/{stockCode}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable String userId,
            @PathVariable String stockCode) {
        boolean removed = userFavService.removeFavorite(userId, stockCode);
        if (removed) {
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 404 Not Found (삭제할 대상이 없었음)
        }
    }

    // 특정 사용자의 모든 관심 종목 조회 (GET /api/users/{userId}/favorites)
    @GetMapping("/{userId}/favorites")
    public List<UserFav> getUserFavorites(@PathVariable String userId) {
        return userFavService.getFavoritesByUserId(userId);
    }

    // 특정 주식이 관심 종목인지 확인 (GET /api/users/{userId}/favorites/check/{stockCode})
    @GetMapping("/{userId}/favorites/check/{stockCode}")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            @PathVariable String userId,
            @PathVariable String stockCode) {
        boolean isFavorite = userFavService.isFavorite(userId, stockCode);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isFavorite", isFavorite);
        return ResponseEntity.ok(response); // 200 OK
    }
    
    
    @GetMapping("/list") // <-- React 요청에 맞춤: /list
    public ResponseEntity<List<UserFavStockDetailDto>> getUserFavoriteStocks(
            @RequestParam("userId") String userId) { 
        if (userId == null || userId.trim().isEmpty()) {
            System.out.println("경고: 관심 종목 조회 요청에 userId가 누락되었거나 유효하지 않습니다.");
            return ResponseEntity.badRequest().build();
        }
        System.out.println("사용자 '" + userId + "'의 관심 종목 상세 목록 조회 요청 수신.");

        List<UserFavStockDetailDto> favStocks = userFavService.getUserFavoriteStocksWithDetails(userId);

        return ResponseEntity.ok(favStocks);
    }
}