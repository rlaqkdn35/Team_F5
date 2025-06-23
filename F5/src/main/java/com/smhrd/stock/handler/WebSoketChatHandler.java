package com.smhrd.stock.handler; // 실제 패키지명에 맞게 수정

import com.fasterxml.jackson.databind.ObjectMapper;
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

// Chatting 엔티티 및 ChatService 임포트 필요
import com.smhrd.stock.entity.Chatting; // 실제 엔티티 경로에 맞게 수정
import com.smhrd.stock.service.ChattingService;

@Component
public class WebSoketChatHandler extends TextWebSocketHandler { // 클래스명 WebSoketChatHandler 유지

    private static final Logger logger = LoggerFactory.getLogger(WebSoketChatHandler.class); // 클래스명 일치
    private final ObjectMapper objectMapper;
    private final ChattingService chatService; // ChatService 주입

    // 각 채팅방(croomIdx)별 세션 관리 맵
    // Integer 타입의 croomIdx를 키로, 해당 방의 세션들을 Map으로 관리
    private final Map<Integer, Map<String, WebSocketSession>> chatRoomSessions = new ConcurrentHashMap<>();

    public WebSoketChatHandler(ObjectMapper objectMapper, ChattingService chatService) {
        this.objectMapper = objectMapper;
        this.chatService = chatService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // HandshakeInterceptor에서 Integer 타입으로 넣어준 croomIdx를 가져옴
        Integer croomIdx = (Integer) session.getAttributes().get("croomIdx");

        if (croomIdx == null) {
            logger.warn("[WebSocket] croomIdx 파라미터가 없거나 유효하지 않아 연결을 닫습니다. 세션 ID: {}", session.getId());
            session.close(CloseStatus.BAD_DATA.withReason("croomIdx parameter is missing or invalid"));
            return;
        }

        try {
            // 해당 croomIdx에 해당하는 Map이 없으면 새로 생성하여 추가
            chatRoomSessions.computeIfAbsent(croomIdx, k -> new ConcurrentHashMap<>())
                           .put(session.getId(), session);

            logger.info("[WebSocket] 연결 성공. 세션 ID: {}, 채팅방 croomIdx: {}", session.getId(), croomIdx);

            // 입장 메시지는 클라이언트에서 보낼 것이므로 서버에서 별도로 생성하여 브로드캐스트할 필요는 없습니다.
            // 클라이언트가 보낸 입장 메시지는 handleTextMessage에서 처리됩니다.

        } catch (Exception e) {
            logger.error("[WebSocket] 연결 설정 중 알 수 없는 오류 발생. 세션 ID: {}", session.getId(), e);
            session.close(CloseStatus.SERVER_ERROR.withReason("Internal server error during connection setup"));
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload(); // 메시지 페이로드 (JSON 문자열)
        logger.info("[WebSocket] 수신 메시지 페이로드: {}", payload);

        Chatting chatMessage = null;
        try {
            // JSON 문자열을 Chatting 객체로 역직렬화
            chatMessage = objectMapper.readValue(payload, Chatting.class);
            logger.info("[WebSocket] 역직렬화된 수신 메시지: {}", chatMessage);

            // croomIdx 유효성 검사 (Integer 타입이므로 null 또는 0이 유효하지 않은 값으로 간주)
            if (chatMessage.getCroomIdx() == null || chatMessage.getCroomIdx() <= 0) {
                logger.warn("[WebSocket] 메시지에 유효한 croomIdx가 없습니다. croomIdx: {}, 세션 ID: {}", chatMessage.getCroomIdx(), session.getId());
                session.close(CloseStatus.BAD_DATA.withReason("croomIdx is missing or invalid in message payload"));
                return;
            }

            Integer croomIdx = chatMessage.getCroomIdx();
            Map<String, WebSocketSession> sessionsInRoom = chatRoomSessions.get(croomIdx);

            if (sessionsInRoom != null) {
                // TALK 타입 메시지만 DB에 저장 (요구사항 반영)
                if ("TALK".equals(chatMessage.getMessageType())) {
                    try {
                        // 메시지 저장 (chat_idx는 DB에서 자동 생성)
                        chatService.saveChatMessage(chatMessage);
                        logger.info("[WebSocket] 'TALK' 메시지 DB 저장 완료. chat_idx: {}", chatMessage.getChat_idx());
                    } catch (Exception e) {
                        logger.error("[WebSocket] 메시지 DB 저장 중 오류 발생: {}", chatMessage, e);
                        // DB 저장 실패 시에도 메시지는 브로드캐스트할 수 있도록 예외만 로깅
                    }
                } else {
                    logger.info("[WebSocket] 시스템 메시지 (ENTER/QUIT)는 DB에 저장하지 않습니다. 타입: {}", chatMessage.getMessageType());
                }

                // 같은 채팅방의 모든 세션에 메시지 브로드캐스트
                // DB 저장 후 부여된 chat_idx를 포함하여 다시 JSON으로 직렬화하여 클라이언트에 전송
                TextMessage textMessageToSend = new TextMessage(objectMapper.writeValueAsString(chatMessage));
                for (WebSocketSession s : sessionsInRoom.values()) {
                    if (s.isOpen()) {
                        try {
                            s.sendMessage(textMessageToSend);
                        } catch (IOException e) {
                            logger.error("[WebSocket] 세션 {}으로 메시지 전송 실패: {}", s.getId(), e.getMessage());
                        }
                    }
                }
            } else {
                logger.warn("[WebSocket] 채팅방 {}이 존재하지 않습니다. 세션 ID: {}", croomIdx, session.getId());
                // 해당 방이 존재하지 않으면 세션을 닫거나 다른 처리
                // session.close(CloseStatus.BAD_DATA.withReason("Chat room does not exist"));
            }

        } catch (IOException e) {
            logger.error("[WebSocket] 메시지 파싱 또는 직렬화/전송 오류: {}", e.getMessage(), e);
            session.close(CloseStatus.BAD_DATA.withReason("Failed to process message payload"));
        } catch (Exception e) {
            logger.error("[WebSocket] handleTextMessage 처리 중 알 수 없는 오류 발생. 세션 ID: {}", session.getId(), e);
            session.close(CloseStatus.SERVER_ERROR.withReason("Internal server error during message handling"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // Integer 타입으로 저장된 croomIdx를 가져옴
        Integer croomIdx = (Integer) session.getAttributes().get("croomIdx");

        if (croomIdx != null) {
            Map<String, WebSocketSession> sessionsInRoom = chatRoomSessions.get(croomIdx);
            if (sessionsInRoom != null) {
                sessionsInRoom.remove(session.getId()); // 해당 세션 제거
                if (sessionsInRoom.isEmpty()) {
                    chatRoomSessions.remove(croomIdx); // 방에 아무도 없으면 방 맵에서도 제거
                    logger.info("[WebSocket] 채팅방 {}에 남은 세션이 없어 방을 맵에서 제거했습니다.", croomIdx);
                }
            }
            logger.info("[WebSocket] 연결 종료. 세션 ID: {}, 채팅방 croomIdx: {}, 상태 코드: {}, 이유: {}",
                    session.getId(), croomIdx, status.getCode(), status.getReason());

            // 퇴장 메시지는 클라이언트에서 보낼 것이므로 서버에서 별도로 생성하여 브로드캐스트할 필요는 없습니다.

        } else {
            logger.warn("[WebSocket] croomIdx를 찾을 수 없는 세션이 종료되었습니다. 세션 ID: {}", session.getId());
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        logger.error("[WebSocket] 전송 오류 발생. 세션 ID: {}", session.getId(), exception);
        // 오류 발생 시 세션 닫기
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }
}