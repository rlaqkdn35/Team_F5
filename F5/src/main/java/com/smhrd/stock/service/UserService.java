package com.smhrd.stock.service;

import com.smhrd.stock.entity.User;
import com.smhrd.stock.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional; // 트랜잭션 관리를 위해 추가 (필요 시)
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Lombok 로거 사용

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j // Lombok 로거 사용
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 회원가입
    @Transactional // 트랜잭션 관리
    public User register(User user) {
        log.info("회원가입 프로세스 시작: {}", user.getUserId());
        user.setJoinedAt(LocalDateTime.now().withNano(0)); // 나노초 제거
        user.setUserRole("ROLE_USER");
        user.setPw(passwordEncoder.encode(user.getPw())); // 비밀번호 암호화 필수
        User savedUser = userRepository.save(user);
        log.info("회원가입 성공: {}", savedUser.getUserId());
        return savedUser;
    }

    // 로그인
    public User login(String userId, String pw, HttpSession session) {
        log.info("로그인 시도 - userId: {}", userId);

        Optional<User> userOpt = userRepository.findByUserId(userId); // @Id 필드 기준 find
        // 또는 userRepository.findByUserId(userId); (userId가 유니크하고 인덱싱되어 있다면)

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            log.info("사용자 찾음 - userId: {}", user.getUserId());

            if (passwordEncoder.matches(pw, user.getPw())) {
                session.setAttribute("loginUser", user);
                log.info("UserService: 세션에 loginUser 저장됨. 세션 ID: {}", session.getId());
                log.info("UserService: 세션 속성 확인: loginUser = {}", session.getAttribute("loginUser"));
                return user;
            } else {
                log.warn("비밀번호 불일치! - userId: {}", userId);
            }
        } else {
            log.warn("아이디를 찾을 수 없음! - userId: {}", userId);
        }
        
        log.warn("로그인 실패 - userId: {}", userId);
        return null; // 로그인 실패
    }


    // 회원정보 수정
    @Transactional
    public User update(User newUser, HttpSession session) {
        User currentUser = (User) session.getAttribute("loginUser");
        if (currentUser != null) {
            // 비밀번호가 변경되었을 경우에만 암호화하여 저장
            if (newUser.getPw() != null && !newUser.getPw().isEmpty()) {
                currentUser.setPw(passwordEncoder.encode(newUser.getPw()));
            }
            currentUser.setNickname(newUser.getNickname());
            // 필요한 다른 필드 업데이트

            User updatedUser = userRepository.save(currentUser);
            // 세션 정보도 업데이트 (필요 시, 일반적으로는 객체 참조로 자동 업데이트됨)
            session.setAttribute("loginUser", updatedUser);
            log.info("회원정보 수정 성공: {}", updatedUser.getUserId());
            return updatedUser;
        }
        return null;
    }

    // 회원 삭제
    @Transactional
    public void delete(HttpSession session) {
        User user = (User) session.getAttribute("loginUser");
        if (user != null) {
            userRepository.deleteById(user.getUserId());
            session.invalidate();
            log.info("회원 탈퇴 및 세션 무효화 완료: {}", user.getUserId());
        } else {
            log.warn("회원 탈퇴 실패: 세션에 사용자 정보가 없음.");
        }
    }

    // OAuth2 사용자 저장 또는 업데이트
    @Transactional
    public User saveOAuthUser(String email, String nickname, String provider, String providerId, HttpSession session) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("새로운 OAuth2 사용자 등록: 이메일 {}", email);
            return User.builder()
                        .userId(email) // OAuth 사용자는 이메일을 userId로 활용
                        .email(email)
                        .nickname(nickname)
                        .provider(provider)
                        .providerId(providerId)
                        .userRole("ROLE_USER") // SOCIAL 대신 일반 USER 롤
                        .joinedAt(LocalDateTime.now().withNano(0))
                        .build();
        });
        // 기존 사용자라면 nickname, provider, providerId 업데이트 (선택 사항)
        // user.setNickname(nickname);
        // user.setProvider(provider);
        // user.setProviderId(providerId);
        
        User savedUser = userRepository.save(user);
        session.setAttribute("loginUser", savedUser); // 세션에 저장
        log.info("OAuth2 사용자 세션 저장 및 정보 저장/업데이트 완료: {}", savedUser.getUserId());
        return savedUser;
    }

    public User getSessionUser(HttpSession session) {
        return (User) session.getAttribute("loginUser");
    }

    public Optional<String> findUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getUserId);
    }
    public boolean validateUserIdAndEmail(String userId, String email) {
        Optional<User> userOpt = userRepository.findByUserIdAndEmail(userId, email);
        return userOpt.isPresent();
    }
}