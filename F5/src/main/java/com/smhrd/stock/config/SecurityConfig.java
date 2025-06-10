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
                    "/public-api/**"
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