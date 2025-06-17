package com.smhrd.stock.service;

import com.smhrd.stock.entity.Chatting;
import com.smhrd.stock.repository.ChattingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 트랜잭션 관리를 위한 임포트

import java.util.List;

@Service // 스프링 서비스 빈으로 등록
@RequiredArgsConstructor // final 필드를 사용하는 생성자를 자동으로 만들어 의존성 주입을 처리 (Lombok)
public class ChattingService {

    private final ChattingRepository chattingRepository; // ChattingRepository 주입

    /**
     * 채팅 메시지를 저장합니다.
     * @param chatMessage 저장할 Chatting 엔티티
     * @return 저장된 Chatting 엔티티
     */
    @Transactional // 해당 메서드 내의 모든 DB 작업이 하나의 트랜잭션으로 묶임
    public Chatting saveChatMessage(Chatting chatMessage) {
        // 여기에 메시지 유효성 검사, 필터링 등 비즈니스 로직을 추가할 수 있습니다.
        // 예를 들어:
        // if (chatMessage.getChat_content() != null && chatMessage.getChat_content().isEmpty()) {
        //     throw new IllegalArgumentException("메시지 내용은 비어있을 수 없습니다.");
        // }
        return chattingRepository.save(chatMessage); // Repository의 save 메서드 호출
    }

    /**
     * 특정 채팅방의 채팅 이력을 조회합니다.
     * @param croomIdx 채팅방 인덱스
     * @return 해당 채팅방의 채팅 메시지 리스트
     */
    @Transactional(readOnly = true) // 읽기 전용 트랜잭션으로 설정하여 성능 최적화
    public List<Chatting> getChatHistory(int croomIdx) {
        return chattingRepository.findByCroomIdxOrderByCreatedAtAsc(croomIdx);
    }

    /**
     * 특정 채팅방에 업로드된 파일 목록을 조회합니다.
     * @param croomIdx 채팅방 인덱스
     * @return 해당 채팅방의 파일 메시지 리스트
     */
    @Transactional(readOnly = true)
    public List<Chatting> getChatFiles(int croomIdx) {
        // 변경된 Repository 메서드 이름으로 호출
        return chattingRepository.findByCroomIdxAndChatFileIsNotNullOrderByCreatedAtDesc(croomIdx);
    }

	
	
}