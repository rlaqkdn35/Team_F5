package com.smhrd.stock.handler;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper; // JSON <=> Java 객체 변환을 위함
import com.smhrd.stock.entity.Chatting; // Chatting 엔티티 임포트
import com.smhrd.stock.service.ChattingService;

import lombok.RequiredArgsConstructor; // Lombok

@Component // 스프링 컴포넌트 빈으로 등록
@RequiredArgsConstructor // final 필드를 사용하는 생성자를 자동으로 만들어 의존성 주입을 처리 (Lombok)
public class WebSoketChatHandler extends TextWebSocketHandler {

	// room_id별로 연결된 클라이언트 세션 관리 (ConcurrentHashMap은 스레드 안전)
    private Map<Integer, Set<WebSocketSession>> chatRoomSessions = new ConcurrentHashMap<>();
    
    private final ObjectMapper objectMapper; // JSON 직렬화/역직렬화를 위함
    private final ChattingService chattingService; // ChattingService 주입

    /**
     * 웹소켓 연결이 성공적으로 수립된 후 호출됩니다.
     * @param session 현재 연결된 웹소켓 세션
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("웹소켓 접속: " + session.getId());
        // 초기 연결 시점에는 아직 어떤 채팅방인지 모르므로, 바로 세션 맵에 추가하지 않습니다.
        // 클라이언트로부터 ENTER 메시지를 받을 때 채팅방에 추가합니다.
    }
    
    /**
     * 웹소켓 연결이 종료된 후 호출됩니다.
     * @param session 현재 연결된 웹소켓 세션
     * @param status 연결 종료 상태
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // 모든 채팅방을 순회하며 해당 세션 제거
        for (Map.Entry<Integer, Set<WebSocketSession>> entry : chatRoomSessions.entrySet()) {
            Set<WebSocketSession> sessions = entry.getValue();
            if (sessions.remove(session)) {
//                System.out.println("채팅방 " + entry.getKey() + "에서 세션 제거: " + session.getId());
                // 해당 채팅방에 더 이상 세션이 없으면 맵에서 제거 (옵션)
                if (sessions.isEmpty()) {
                    chatRoomSessions.remove(entry.getKey());
                }
            }
        }
//        System.out.println("웹소켓 해제: " + session.getId() + ", 상태: " + status);
    }
    
    /**
     * 클라이언트로부터 텍스트 메시지를 수신했을 때 호출됩니다.
     * @param session 메시지를 보낸 클라이언트 세션
     * @param message 수신된 텍스트 메시지
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
//    	System.out.println("handleTextMessage 호출됨: " + message.getPayload());
        String payload = message.getPayload(); // 메시지 페이로드 (JSON 문자열)
        // JSON 문자열을 Chatting 객체로 역직렬화
        Chatting chatMessage = objectMapper.readValue(payload, Chatting.class);
//        System.out.println("수신 메시지: " + chatMessage);
        
        int roomId = chatMessage.getCroomIdx(); // 메시지에서 채팅방 ID 추출
        
        // 해당 roomId에 대한 세션 집합이 없으면 새로 생성 (ConcurrentHashMap은 스레드 안전하게 처리)
        chatRoomSessions.putIfAbsent(roomId, new HashSet<>());
        Set<WebSocketSession> sessions = chatRoomSessions.get(roomId);
        
        // 메시지 타입에 따른 처리
        if (chatMessage.getMessageType().equals(Chatting.MessageType.ENTER)) { // 입장 메시지
            // 인원 제한 없이 바로 세션 추가
            sessions.add(session);
//            System.out.println("세션 " + session.getId() + "이 채팅방 " + roomId + "에 입장했습니다.");
            
            // 입장 메시지 DB 저장 (서버에서 시간 설정)
            chatMessage.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            chattingService.saveChatMessage(chatMessage);

        } else if (chatMessage.getMessageType().equals(Chatting.MessageType.QUIT)) { // 퇴장 메시지
            sessions.remove(session); // 세션 제거
//            System.out.println("세션 " + session.getId() + "이 채팅방 " + roomId + "에서 퇴장했습니다.");

            // 퇴장 메시지 DB 저장 (서버에서 시간 설정)
            chatMessage.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            chattingService.saveChatMessage(chatMessage);

        } else if (chatMessage.getMessageType().equals(Chatting.MessageType.TALK)) { // 일반 채팅 메시지
            // TALK 메시지 처리: 서버에서 created_at 값을 설정 후 DB 저장
            chatMessage.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            chattingService.saveChatMessage(chatMessage); // Service 호출하여 메시지 저장
        }

        // 모든 세션에 업데이트된 메시지 브로드캐스트 (서버에서 시간 등이 설정된 메시지를 다시 보냄)
        String broadcastMsg = objectMapper.writeValueAsString(chatMessage); // Chatting 객체를 다시 JSON으로 직렬화
        for (WebSocketSession ws : sessions) {
            try {
                if (ws.isOpen()) { // 세션이 열려있는지 확인
                    ws.sendMessage(new TextMessage(broadcastMsg));
                }
            } catch (IOException e) {
                // 메시지 전송 실패 시 로그 출력
                System.err.println("메시지 전송 실패 (세션: " + ws.getId() + "): " + e.getMessage());
                // 필요하다면 세션 제거 또는 다른 에러 처리 로직 추가
            }
        }
    }
}