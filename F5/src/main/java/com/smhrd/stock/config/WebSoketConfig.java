package com.smhrd.stock.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import com.smhrd.stock.handler.WebSoketChatHandler; // WebSoketChatHandler 임포트 확인

import java.util.Map;
// Objects 임포트가 필요하다면 추가
// import java.util.Objects; 

@Configuration
@EnableWebSocket
public class WebSoketConfig implements WebSocketConfigurer {

    private final WebSocketHandler webSocketHandler;

    public WebSoketConfig(WebSoketChatHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler, "/ws/chat")
                .setAllowedOriginPatterns("*") // 모든 오리진 허용 (개발 단계에서만 사용)
                // !!! 여기가 중요: addInterceptors()를 withSockJS() 이전에 호출 !!!
                .addInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
                        String croomIdx = UriComponentsBuilder.fromUri(request.getURI())
                                                             .build()
                                                             .getQueryParams()
                                                             .toSingleValueMap()
                                                             .get("croomIdx");

                        if (croomIdx != null && !croomIdx.isEmpty()) {
                            attributes.put("croomIdx", croomIdx);
                            System.out.println("Handshake Interceptor: croomIdx [" + croomIdx + "]를 웹소켓 세션 속성으로 추가.");
                            return true;
                        } else {
                            System.err.println("Handshake Interceptor: croomIdx 파라미터가 누락되었습니다.");
                            return false;
                        }
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                               WebSocketHandler wsHandler, Exception exception) {
                        // 핸드셰이크 후 로직 (옵션)
                    }
                })
                .withSockJS(); // 이제 withSockJS()를 마지막에 호출합니다.
    }
}