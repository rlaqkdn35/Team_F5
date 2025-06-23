package com.smhrd.stock.service;

import com.smhrd.stock.entity.Chatting; // 알림 메시지 객체 재사용
import com.smhrd.stock.entity.TradeSignal;
import com.smhrd.stock.handler.NotificationWebSocketHandler; // <-- 새로운 알림 핸들러 임포트
import com.smhrd.stock.repository.TradeSignalRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;

@Service
@RequiredArgsConstructor
public class TradeSignalService {

    private static final Logger logger = LoggerFactory.getLogger(TradeSignalService.class);

    private final TradeSignalRepository tradeSignalRepository;
    private final NotificationWebSocketHandler notificationWebSocketHandler; // <-- NotificationWebSocketHandler 주입
    // private final CroomService croomService; // 더 이상 croomIdx가 필요 없으므로 제거

    /**
     * 새로운 시그널을 저장하고, 모든 연결된 알림 클라이언트에게 알림을 전송합니다.
     * @param tradeSignal 저장할 TradeSignal 엔티티
     * @return 저장된 TradeSignal 엔티티
     */
    @Transactional
    public TradeSignal saveTradeSignal(TradeSignal tradeSignal) {
        TradeSignal savedSignal = tradeSignalRepository.save(tradeSignal);
        logger.info("새로운 시그널 저장 완료: {}", savedSignal);

        // 시그널 저장 후 알림 전송 로직
        try {
            // 알림 메시지 내용 구성
            String alertContent = String.format(
                "[%s] %s 시그널 발생! (가격: %.1f원, 사유: %s)",
                savedSignal.getStockCode(),
                savedSignal.getSignalType(),
                savedSignal.getSignalAtPrice(),
                savedSignal.getSignalReason().length() > 50 ? savedSignal.getSignalReason().substring(0, 50) + "..." : savedSignal.getSignalReason()
            );

            // 알림 메시지 생성 (Chatting 엔티티 재활용)
            // croomIdx는 이제 NotificationWebSocketHandler에서는 사용하지 않음 (전체 알림)
            Chatting alertMessage = new Chatting();
            alertMessage.setChat_id("AI_SYSTEM"); // 누가 보낸 알림인지 명시
            alertMessage.setChat_content(alertContent);
            alertMessage.setMessageType(Chatting.MessageType.ALERT); // 알림 타입 지정
            alertMessage.setCreatedAt(new Timestamp(System.currentTimeMillis()));

            // NotificationWebSocketHandler를 통해 모든 클라이언트에게 알림 전송
            notificationWebSocketHandler.sendNotificationToAll(alertMessage);

            logger.info("시그널 알림 전송 요청 완료. 알림 내용: {}", alertContent);

        } catch (Exception e) {
            logger.error("시그널 저장 후 알림 전송 중 오류 발생: {}", e.getMessage(), e);
        }

        return savedSignal;
    }

    // 기타 TradeSignal 관련 조회, 수정, 삭제 메서드들...
}