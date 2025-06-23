package com.smhrd.stock.config;

import com.smhrd.stock.handler.NotificationWebSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class NotificationWebSocketConfig implements WebSocketConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(NotificationWebSocketConfig.class);

    private final NotificationWebSocketHandler notificationWebSocketHandler;

    public NotificationWebSocketConfig(NotificationWebSocketHandler notificationWebSocketHandler) {
        this.notificationWebSocketHandler = notificationWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(notificationWebSocketHandler, "/ws/notification") // <-- 새로운 엔드포인트
                .setAllowedOriginPatterns("*") // 모든 Origin 허용
                .withSockJS(); // SockJS 지원
        logger.info("Notification WebSocket 엔드포인트 '/ws/notification' 등록 완료.");
    }
}