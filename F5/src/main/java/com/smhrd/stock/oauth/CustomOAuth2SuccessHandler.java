package com.smhrd.stock.oauth;

import java.io.IOException;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.smhrd.stock.dto.SessionUser;
import com.smhrd.stock.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        Object principal = authentication.getPrincipal();
        String email = null;

        if (principal instanceof OAuth2User oauth2User) {
            Map<String, Object> attributes = oauth2User.getAttributes();

            if (attributes.containsKey("kakao_account")) {
                Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
                email = (String) kakaoAccount.get("email");
            } else if (attributes.containsKey("response")) {
                Map<String, Object> responseMap = (Map<String, Object>) attributes.get("response");
                email = (String) responseMap.get("email");
            } else {
                email = (String) attributes.get("email");
            }
        }

        if (email != null) {
            userRepository.findByEmail(email)
                .ifPresent(user -> {
                    SessionUser sessionUser = new SessionUser(user.getEmail(), user.getNickname());
                    request.getSession().setAttribute("loginUser", sessionUser);
                });
        } else {
            System.out.println("[OAuth2 Success Handler] 이메일 추출 실패");
        }

        response.sendRedirect("http://localhost:3000");
    }
}
