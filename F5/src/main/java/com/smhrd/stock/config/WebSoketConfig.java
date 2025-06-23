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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
// Objects 임포트가 필요하다면 추가
// import java.util.Objects; 

@Configuration
@EnableWebSocket
public class WebSoketConfig implements WebSocketConfigurer {

	private static final Logger logger = LoggerFactory.getLogger(WebSoketConfig.class);
    
    private final WebSocketHandler webSocketHandler;

    public WebSoketConfig(WebSoketChatHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler, "/ws/chat")
                .setAllowedOriginPatterns("*")
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
                            try {
                                Integer croomIdxInt = Integer.parseInt(croomIdx);
                                attributes.put("croomIdx", croomIdxInt);
                                logger.info("Handshake Interceptor: croomIdx [{}]를 웹소켓 세션 속성으로 추가.", croomIdxInt);
                                return true;
                            } catch (NumberFormatException e) {
                                logger.error("Handshake Interceptor: croomIdx는 숫자 형식이어야 합니다: {}", croomIdx, e);
                                return false;
                            }
                        } else {
                            logger.error("Handshake Interceptor: croomIdx 파라미터가 누락되었습니다.");
                            return false;
                        }
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                               WebSocketHandler wsHandler, Exception exception) {
                        // 핸드셰이크 후 로직 (옵션)
                    }
                })
                .withSockJS();
    }
}