package com.smhrd.stock.dto;

import lombok.Builder;
import lombok.Data;

import java.sql.Timestamp;
import java.util.List;
import java.util.ArrayList;

@Data
@Builder
public class CombinedNewsStockDto {
    // 뉴스 정보
    private Long newsIdx; // 뉴스를 식별할 수 있는 고유 ID (필요하다면 추가)
    private String newsTitle;
    private Timestamp newsDt;
    private String newsAnalysis; // "positive", "negative", "neutral"
    private String stockCodes; // 콤마로 구분된 원본 종목 코드 문자열

    // 종목별 정보 (news_dt와 관련된 등락률 및 가격)
    // 한 뉴스에 여러 종목이 연결될 수 있으므로 리스트로
    private List<CombinedStockDetailDto> relatedStockDetails;

    // 빌더 패턴 초기화 시 관련 종목 리스트가 null이 되지 않도록 보장
    public static class CombinedNewsStockDtoBuilder {
        private List<CombinedStockDetailDto> relatedStockDetails = new ArrayList<>();
    }
}