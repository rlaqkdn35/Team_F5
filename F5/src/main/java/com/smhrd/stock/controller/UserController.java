package com.smhrd.stock.controller;

import com.smhrd.stock.dto.SessionUser;
import com.smhrd.stock.entity.User;
import com.smhrd.stock.repository.UserRepository;
import com.smhrd.stock.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;
    // 회원가입
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        User registeredUser = userService.register(user);
        return ResponseEntity.ok(registeredUser);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        Object loginUser = session.getAttribute("loginUser");
        if (loginUser instanceof SessionUser user) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        }
    }
    // 회원정보 수정
    @PutMapping("/update")
    public ResponseEntity<?> update(@RequestBody User user, HttpSession session) {
        User updatedUser = userService.update(user, session);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        } else {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
    }

    // 회원 탈퇴
    @DeleteMapping("/delete")
    public ResponseEntity<?> delete(HttpSession session) {
        userService.delete(session);
        return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
    }

    // 아이디 찾기 (이메일 기반)
    @PostMapping("/find-id")
    public ResponseEntity<?> findUserId(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<String> userIdOpt = userService.findUserIdByEmail(email);

        return userIdOpt
                .<ResponseEntity<?>>map(userId -> ResponseEntity.ok(Map.of("userId", userId)))
                .orElseGet(() -> ResponseEntity.status(404).body("등록된 이메일이 없습니다."));
    }

    // 비밀번호 찾기 (아이디 + 이메일 기반)
    @PostMapping("/find-password")
    public ResponseEntity<?> findUserPassword(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String email = request.get("email");

        boolean isValid = userService.validateUserIdAndEmail(userId, email);

        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "비밀번호 재설정이 완료되었습니다."));
        } else {
            return ResponseEntity.status(404).body("일치하는 계정 정보가 없습니다.");
        }
    }
    
    @GetMapping("/session")
    public Map<String, Object> getSessionUser(HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        Object user = session.getAttribute("loginUser");
        if (user != null) {
            result.put("user", user);
        } else {
            result.put("user", null);
        }
        return result;
    }
    
    }

