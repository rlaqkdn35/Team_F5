package com.smhrd.stock.controller;

import com.smhrd.stock.entity.User;
import com.smhrd.stock.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j // Lombok 로거 사용
@RestController
@RequestMapping("/user") // 이 컨트롤러의 기본 경로를 /user로 설정
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    
    // 회원가입
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        User registeredUser = userService.register(user);
        log.info("회원가입 성공: {}", registeredUser.getUserId());
        return ResponseEntity.ok(registeredUser);
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, HttpSession session) {
        log.info("로그인 시도: userId: {}", user.getUserId());
        User loginUser = userService.login(user.getUserId(), user.getPw(), session);
        if (loginUser != null) {
            // 세션 ID 로깅 추가 (중요!)
            log.info("로그인 성공! 세션 ID: {}", session.getId());
            log.info("세션에 저장된 사용자: {}", ((User)session.getAttribute("loginUser")).getUserId());
            return ResponseEntity.ok(loginUser);
        } else {
            log.warn("로그인 실패: userId: {}", user.getUserId());
            return ResponseEntity.status(401).body("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
    }
    
    // 현재 로그인된 사용자 정보 확인 (세션 유효성 검증)
    // 이 엔드포인트는 프론트엔드에서 새로고침 시 로그인 상태를 유지하는 데 사용됩니다.
    @GetMapping("/me") // 경로를 /user/me로 설정 (Protected Resource)
    public ResponseEntity<?> getLoggedInUser(HttpSession session) {
        User loginUser = (User) session.getAttribute("loginUser");
        if (loginUser == null) {
            log.warn("세션에 사용자 정보 없음 (getLoggedInUser). 세션 ID: {}", session.getId());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("세션 만료 또는 로그인 필요");
        }
        log.info("세션에서 사용자 정보 가져옴 (getLoggedInUser): {}", loginUser.getUserId());
        return ResponseEntity.ok(loginUser);
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) { // HttpServletRequest를 파라미터로 받음
        log.info("로그아웃 요청 수신됨");
        HttpSession session = request.getSession(false); // 기존 세션이 없으면 null 반환
        if (session != null) {
            log.info("세션 ID: {} 무효화 시작.", session.getId());
            session.invalidate(); // 세션 무효화
            log.info("세션 무효화 완료.");
        } else {
            log.info("활성화된 세션이 없어 무효화할 세션이 없음.");
        }
        // 클라이언트에게 세션 쿠키를 삭제하도록 지시하는 헤더를 보낼 수도 있지만,
        // Spring Security의 기본 로그아웃 처리가 더 효과적입니다.
        return ResponseEntity.ok().body("로그아웃 성공");
    }

    // 회원정보 수정
    @PutMapping("/update")
    public ResponseEntity<?> update(@RequestBody User newUser, HttpSession session) {
        User updatedUser = userService.update(newUser, session);
        if (updatedUser != null) {
            log.info("회원정보 수정 성공: {}", updatedUser.getUserId());
            return ResponseEntity.ok(updatedUser);
        } else {
            log.warn("회원정보 수정 실패: 세션에 사용자 정보 없음.");
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
    }

    // 회원 탈퇴
    @DeleteMapping("/delete")
    public ResponseEntity<?> delete(HttpSession session) {
        userService.delete(session);
        log.info("회원 탈퇴 완료.");
        return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
    }

    // 아이디 찾기 (이메일 기반)
    @PostMapping("/find-id")
    public ResponseEntity<?> findUserId(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<String> userIdOpt = userService.findUserIdByEmail(email);

        return userIdOpt
                .<ResponseEntity<?>>map(userId -> {
                    log.info("아이디 찾기 성공: 이메일 {}로 아이디 {} 찾음", email, userId);
                    return ResponseEntity.ok(Map.of("userId", userId));
                })
                .orElseGet(() -> {
                    log.warn("아이디 찾기 실패: 이메일 {}에 해당하는 사용자 없음", email);
                    return ResponseEntity.status(404).body("등록된 이메일이 없습니다.");
                });
    }

    // 비밀번호 찾기 (아이디 + 이메일 기반)
    @PostMapping("/find-password")
    public ResponseEntity<?> findUserPassword(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String email = request.get("email");

        boolean isValid = userService.validateUserIdAndEmail(userId, email);

        if (isValid) {
            log.info("비밀번호 재설정 유효성 검사 성공: userId {}, email {}", userId, email);
            return ResponseEntity.ok(Map.of("message", "비밀번호 재설정이 완료되었습니다."));
        } else {
            log.warn("비밀번호 재설정 유효성 검사 실패: userId {}, email {}", userId, email);
            return ResponseEntity.status(404).body("일치하는 계정 정보가 없습니다.");
        }
    }
    
    // 프론트엔드의 login/success 호출에 대한 응답 (이전의 /me와 유사하게 작동하도록)
    @GetMapping("/login/success")
    public ResponseEntity<?> loginSuccess(HttpSession session) {
        // 이 엔드포인트는 주로 OAuth2 로그인 후 리다이렉트되어 세션에 저장된 정보를 반환할 때 사용될 수 있습니다.
        // 일반 로그인 후에도 호출될 수 있으므로, 세션에 'loginUser'가 있는지 확인합니다.
        User loginUser = (User) session.getAttribute("loginUser");
        if (loginUser == null) {
            log.warn("login/success 호출되었으나 세션에 사용자 정보 없음!");
            // OAuth2 성공 시 Spring Security가 세션을 만들고 사용자 정보를 저장했어야 함
            // 또는 일반 로그인 후 프론트엔드에서 /me 대신 이곳을 호출한 경우
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("세션에 사용자 정보가 없습니다.");
        }
        log.info("login/success 호출 성공: 세션에서 사용자 정보 가져옴: {}", loginUser.getUserId());
        return ResponseEntity.ok(loginUser);
    }
}