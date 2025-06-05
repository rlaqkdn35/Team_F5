package com.smhrd.stock.config;

import com.smhrd.stock.oauth.CustomOAuth2SuccessHandler;
import com.smhrd.stock.oauth.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // 추가 권장
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List; // List 임포트

@Configuration
@EnableWebSecurity // 명시적으로 웹 보안 활성화 (Spring Boot 자동 구성에 의존하지 않음)
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // 허용할 출처를 명시적으로 설정합니다.
        config.setAllowedOrigins(List.of("http://localhost:3000")); // 프론트엔드 주소
        // 허용할 HTTP 메소드를 설정합니다. OPTIONS는 Preflight 요청 처리를 위해 포함하는 것이 좋습니다.
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // 자격 증명(쿠키 등) 허용 여부를 설정합니다.
        config.setAllowCredentials(true);
        // 허용할 요청 헤더를 설정합니다.
        config.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type", "X-Requested-With", "Accept"));
        // 클라이언트가 접근할 수 있도록 허용할 응답 헤더를 설정합니다. (예: JWT 토큰 반환 시)
        // config.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 경로("/**")에 대해 위에서 정의한 CORS 설정을 등록합니다.
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CORS 설정 적용
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 2. CSRF 보호 비활성화 (Stateless API 또는 세션 기반이더라도 특정 상황에서는 비활성화)
            .csrf(csrf -> csrf.disable())
            // 3. HTTP 요청에 대한 인가 규칙 설정
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    // --- 인증 없이 접근 허용할 경로들 (애플리케이션 내부 경로 기준) ---
                    "/", // 루트 경로
                    // API 관련
                    "/api/register", // 회원가입 API (추가 고려)
                    "/api/login",    // 사용자 정의 로그인 처리 API
                    "/api/logout",   // 사용자 정의 로그아웃 처리 API
                    // "/api/me",    // 현재 사용자 정보 (인증 필요 시 여기서 제외)
                    "/api/login/success", // 로그인 성공 리다이렉션 (서버 내부용)
                    "/api/find-id",       // 아이디 찾기 API (추가 고려)
                    "/api/find-password", // 비밀번호 찾기 API (추가 고려)
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
            // 4. 폼 기반 로그인 설정
            .formLogin(form -> form
                // Spring Security가 제공하는 로그인 페이지 대신 커스텀 로그인 페이지 사용 시
                // .loginPage("/login") // 예시: 로그인 폼을 보여주는 페이지 경로 (Controller에서 매핑)
                .loginProcessingUrl("/api/login") // 로그인 폼 데이터가 POST될 URL (Spring Security가 이 요청을 처리)
                                                  // UserController의 @PostMapping("/api/login")과 충돌 가능성 있음.
                                                  // 만약 UserController에서 직접 로그인 처리 시 이 URL은 변경하거나,
                                                  // formLogin().disable() 후 커스텀 필터로 처리
                .defaultSuccessUrl("/api/login/success", true) // 로그인 성공 시 리다이렉트될 기본 URL
                .failureUrl("/login?error=true") // 로그인 실패 시 리다이렉트될 URL (Thymeleaf 등에서 오류 메시지 처리)
                .permitAll() // 로그인 페이지, 처리 URL, 실패 URL 등은 모두 접근 허용
            )
            // 5. 로그아웃 설정
            .logout(logout -> logout
                .logoutUrl("/api/logout") // 로그아웃을 처리할 URL
                .logoutSuccessUrl("/login?logout=true") // 로그아웃 성공 시 리다이렉트될 URL
                .invalidateHttpSession(true) // HTTP 세션 무효화
                .deleteCookies("JSESSIONID", "remember-me") // JSESSIONID 및 기타 쿠키 삭제
                .permitAll()
            )
            // 6. OAuth2 로그인 설정
            .oauth2Login(oauth2 -> oauth2
                // 커스텀 로그인 페이지가 있다면 설정
                // .loginPage("/login")
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService) // 커스텀 OAuth2 사용자 정보 서비스 지정
                )
                .successHandler(customOAuth2SuccessHandler) // OAuth2 로그인 성공 후 처리 핸들러 지정
                // .failureHandler(...) // OAuth2 로그인 실패 시 핸들러 (필요 시)
            );
            // 7. 세션 관리 (필요에 따라 추가 설정)
            // .sessionManagement(session -> session
            //     .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // 필요 시 세션 생성
            //     .maximumSessions(1) // 동시 세션 제어
            //     .expiredUrl("/login?expired=true") // 세션 만료 시 이동할 URL
            // );

        return http.build();
    }
}