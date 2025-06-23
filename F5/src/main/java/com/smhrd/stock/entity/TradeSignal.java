package com.smhrd.stock.entity;

import java.math.BigDecimal;
import java.sql.Timestamp;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Entity
@Table(name="t_trade_signal")
@NoArgsConstructor
@ToString
public class TradeSignal {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "signal_idx")
    private Integer signalIdx;

    @Column(name = "stock_code", length = 20, nullable = false)
    private String stockCode;

    @Column(name = "signal_type", length = 255)
    private String signalType; // 예: BUY, SELL, HOLD, NEWS 등

    @Column(name = "signal_dt")
    private Timestamp signalDt; // 시그널 발생 날짜/시간

    @Column(name = "signal_at_price", precision = 12, scale = 1)
    private BigDecimal signalAtPrice; // 시그널 발생 시점 가격

    @Lob // Large Object, 긴 텍스트를 저장할 때 사용
    @Column(name = "signal_reason")
    private String signalReason; // 시그널에 대한 설명

    @CreationTimestamp // 엔티티가 생성될 때 현재 시간으로 자동 설정
    @Column(name = "created_at", updatable = false) // 생성 시에만 설정, 업데이트 불가
    private Timestamp createdAt;

    @Column(name = "newsapi_idx")
    private Integer newsapiIdx; // 관련 뉴스 API 인덱스 (nullable)

    // 생성자, 빌더 패턴 등 필요에 따라 추가 가능
}