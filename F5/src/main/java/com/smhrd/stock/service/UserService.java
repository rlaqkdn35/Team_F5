package com.smhrd.stock.service;

import com.smhrd.stock.entity.User;
import com.smhrd.stock.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User register(User user) {
        user.setJoinedAt(LocalDateTime.now());
        user.setUserRole("ROLE_USER");
        return userRepository.save(user);
    }

    public User login(String email, String pw, HttpSession session) {
        Optional<User> userOpt = userRepository.findByEmailAndPw(email, pw);
        if (userOpt.isPresent()) {
            session.setAttribute("loginUser", userOpt.get());
            return userOpt.get();
        }
        return null;
    }

    public User update(User newUser, HttpSession session) {
        User currentUser = (User) session.getAttribute("loginUser");
        if (currentUser != null) {
            currentUser.setNickname(newUser.getNickname());
            currentUser.setPw(newUser.getPw());
            return userRepository.save(currentUser);
        }
        return null;
    }

    public void delete(HttpSession session) {
        User user = (User) session.getAttribute("loginUser");
        if (user != null) {
            userRepository.deleteById(user.getUserId());
            session.invalidate();
        }
    }

    public User saveOAuthUser(String email, String nickname, String provider, String providerId, HttpSession session) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            return User.builder()
                    .userId(email)  // OAuth 사용자는 이메일을 userId로 활용
                    .email(email)
                    .nickname(nickname)
                    .provider(provider)
                    .providerId(providerId)
                    .userRole("ROLE_USER")
                    .joinedAt(LocalDateTime.now())
                    .build();
        });
        session.setAttribute("loginUser", user);
        return userRepository.save(user);
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
