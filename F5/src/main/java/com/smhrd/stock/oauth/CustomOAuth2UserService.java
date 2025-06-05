package com.smhrd.stock.oauth;

import com.smhrd.stock.entity.User;
import com.smhrd.stock.repository.UserRepository;
import com.smhrd.stock.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId(); // google, naver, kakao
        String email = extractEmail(oAuth2User, provider);

        // DB에 사용자 정보 저장 or 조회
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setUserRole("SOCIAL");
                    newUser.setJoinedAt(LocalDateTime.now());
                    return userRepository.save(newUser);
                });

        // ✅ 세션 저장 처리
        HttpSession session = getCurrentHttpSession();
        session.setAttribute("loginUser", user);

        return oAuth2User;
    }

    private String extractEmail(OAuth2User oAuth2User, String provider) {
        // 이메일 추출 로직 (provider별로 다름)
        return (String) oAuth2User.getAttributes().get("email");
    }

    private HttpSession getCurrentHttpSession() {
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        return attr.getRequest().getSession(true); // 세션 가져오기
    }
}
