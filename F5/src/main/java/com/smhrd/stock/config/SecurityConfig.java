package com.smhrd.stock.config;

import com.smhrd.stock.oauth.CustomOAuth2SuccessHandler;
import com.smhrd.stock.oauth.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import jakarta.servlet.http.HttpServletResponse; // HttpServletResponse 임포트

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000")); // React 앱 주소
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*")); // 모든 헤더 허용 (필요에 따라 더 구체적으로 명시)
        config.setAllowCredentials(true); // 중요: 쿠키(JSESSIONID)를 주고받기 위해 필수
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // API 통신 시 일반적으로 비활성화
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(

                    // --- 인증 없이 접근 허용할 경로들 (애플리케이션 내부 경로 기준) ---
                    "/", // 루트 경로
                    // API 관련
                    "/stocks/",
                    "/stocks/**",
                    "/forum/",
                    "/forum/**",
                    "/forum/update/",
                    "/forum/update/**",
                    "/forum/detail/",
                    "/forum/detail/**",
                    "/forum-recos/",
                    "/forum-recos/**",
                    "/stock/daily/",
                    "/stock/daily/**",
                    "/news/list/",                    
                    "/news/list/**",  
                    "/news/detail/",
                    "/news/detail/**",
                    "/stock/latest-data/",
                    "/stock/latest-data/**",
                    "/user/register", // 회원가입 API (추가 고려)
                    "/user/login",    // 사용자 정의 로그인 처리 API
                    "/user/logout",   // 사용자 정의 로그아웃 처리 API
                    "/user/me",    // 현재 사용자 정보 (인증 필요 시 여기서 제외)
                    "/user/login/success", // 로그인 성공 리다이렉션 (서버 내부용)
                    "/user/find-id",       // 아이디 찾기 API (추가 고려)
                    "/user/find-password", // 비밀번호 찾기 API (추가 고려)
                    // OAuth2 관련 (Spring Security 내부 처리 경로 및 커스텀 경로)
                    "/oauth2/**",             // 예: "/login/oauth2/code/*", "/oauth2/authorization/*"
                    // 정적 리소스
                    "/static/**", "/favicon.ico", "/js/**", "/css/**", "/images/**",
                    // 공개 API
                    "/keyword/keywordData",
                    "/public-api/**",
                 // 채팅 메시지 저장 API 경로 추가
                    "/chat/message", // 메시지 저장 API
                    "/chat/message/**", // 혹시 하위 경로가 생길 경우 대비

                    // 채팅 이력 조회 API 경로 추가 (필요하다면)
                    "/chat/history/**", // 채팅 이력 조회
                    "/chat/room-id/**", // croom_idx 조회 API (만약 추가했다면)

                    // 웹소켓 연결 경로는 일반적으로 Spring Security의 HTTP 요청 필터 체인을 거치지 않습니다.
                    // 웹소켓 자체의 인증/인가 처리는 별도로 WebSocketHandler 등에서 구현해야 합니다.
                    // 하지만 웹소켓 핸드셰이크 요청이 HTTP이므로, `/ws/chat` 경로도 permitAll이 필요할 수 있습니다.
                    "/ws/chat", // 웹소켓 핸드셰이크 요청
                    "/ws/chat/**", // 웹소켓 핸드셰이크 요청
                    "/stocks/stocklist",
                    "/stocks/stockinfo/**",
                    "/userfav/",
                    "/userfav/**",
                    "/stock",
                    "/stock/**",
                    "/stock/latest/**"
                ).permitAll() // 위에 명시된 경로들은 인증 없이 접근 허용   
                .anyRequest().authenticated() // 그 외 모든 요청은 반드시 인증 필요
            )
            .formLogin(formLogin -> formLogin.disable()) // Spring Security의 기본 폼 로그인 비활성화
            .httpBasic(httpBasic -> httpBasic.disable()) // HTTP Basic 인증 비활성화

            // 세션 관리 설정: 세션이 필요할 때만 생성 (STATELESS가 아님)
            .sessionManagement(sessionManagement -> sessionManagement
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .sessionFixation(sessionFixation -> sessionFixation.changeSessionId()) // 세션 고정 공격 방지
                // .maximumSessions(1) // 동시 세션 제어 필요 시 활성화
                // .maxSessionsPreventsLogin(false)
                // .expiredUrl("/login?expired=true")
            )
            // 로그아웃 설정
            .logout(logout -> logout

                .logoutUrl("/user/logout") // 백엔드 컨텍스트 패스 포함
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(HttpServletResponse.SC_OK); // 로그아웃 성공 시 200 OK 응답
                    response.getWriter().write("Logout successful"); // 응답 본문 추가
                })
                .invalidateHttpSession(true) // HTTP 세션 무효화
                .deleteCookies("JSESSIONID") // JSESSIONID 쿠키 삭제
                .permitAll()
            )
            // OAuth2 로그인 설정
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(customOAuth2SuccessHandler)
            );
            
        return http.build();
    }
}