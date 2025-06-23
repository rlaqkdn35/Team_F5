package com.smhrd.stock.handler;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.smhrd.stock.entity.Chatting; // Chatting 엔티티 재사용 (ALERT 타입)
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(NotificationWebSocketHandler.class);
    private final ObjectMapper objectMapper;

    // 모든 연결된 클라이언트 세션을 관리하는 맵
    // 여기서는 croomIdx 같은 방 개념 없이 모든 알림 클라이언트를 한 곳에서 관리
    private final Map<String, WebSocketSession> connectedSessions = new ConcurrentHashMap<>();

    public NotificationWebSocketHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        connectedSessions.put(session.getId(), session);
        logger.info("[Notification WS] 연결 성공. 세션 ID: {}", session.getId());
        // 알림 웹소켓은 일반적으로 연결 시 특별한 입장 메시지를 보내지 않습니다.
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 알림 웹소켓은 클라이언트로부터 메시지를 수신하는 경우는 드뭅니다.
        // 보통 서버->클라이언트 단방향으로 알림을 푸시합니다.
        // 만약 클라이언트가 알림 관련 정보를 서버에 보낼 필요가 있다면 이 부분을 구현합니다.
        logger.warn("[Notification WS] 클라이언트로부터 메시지 수신 (일반적이지 않음): {}", message.getPayload());
        // 예를 들어, 클라이언트가 알림 '읽음' 상태를 보낼 때 사용될 수 있습니다.
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        connectedSessions.remove(session.getId());
        logger.info("[Notification WS] 연결 종료. 세션 ID: {}, 상태 코드: {}, 이유: {}",
                session.getId(), status.getCode(), status.getReason());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        logger.error("[Notification WS] 전송 오류 발생. 세션 ID: {}", session.getId(), exception);
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    /**
     * 특정 사용자에게 알림 메시지를 전송합니다.
     * 현재는 모든 연결된 세션에 브로드캐스트합니다.
     * 특정 사용자에게만 보내려면 WebSocketSession에 userId 속성을 저장하고 필터링해야 합니다.
     * @param alertMessage 전송할 알림 메시지 (Chatting 엔티티 재사용)
     */
    public void sendNotificationToAll(Chatting alertMessage) {
        TextMessage textMessageToSend;
        try {
            textMessageToSend = new TextMessage(objectMapper.writeValueAsString(alertMessage));
        } catch (IOException e) {
            logger.error("[Notification WS] 알림 메시지 직렬화 실패: {}", e.getMessage(), e);
            return;
        }

        for (WebSocketSession session : connectedSessions.values()) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(textMessageToSend);
                    logger.info("[Notification WS] 알림 메시지 세션 {}으로 전송 완료. 내용: {}", session.getId(), alertMessage.getChat_content());
                } catch (IOException e) {
                    logger.error("[Notification WS] 알림 메시지 세션 {}으로 전송 실패: {}", session.getId(), e.getMessage());
                }
            }
        }
    }
}