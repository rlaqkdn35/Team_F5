package com.smhrd.stock.service;

import com.smhrd.stock.dto.MarketThemeStockDto;
import com.smhrd.stock.entity.StockPrice;
import com.smhrd.stock.repository.StockPriceRepository;
import com.smhrd.stock.repository.StockRepository; // 필요 없으면 제거해도 됨 (현재 Stock 엔티티 직접 사용 안함)
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketThemesService {

    private final StockPriceRepository stockPriceRepository;
    // private final StockRepository stockRepository; // 현재 직접 사용하지 않으므로 주석 처리 또는 제거 가능

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    // 52주 신고가 종목 조회
    public List<MarketThemeStockDto> getHigh52wStocks() {
        LocalDateTime oneYearAgo = LocalDateTime.now().minusWeeks(52);
        Timestamp timestampOneYearAgo = Timestamp.valueOf(oneYearAgo);

        List<StockPrice> high52wData = stockPriceRepository.find52WeekHighStocks(timestampOneYearAgo);

        return high52wData.stream()
                .map(this::convertToMarketThemeStockDto)
                .limit(5) // 프론트엔드에서 5개만 보여주므로 제한
                .collect(Collectors.toList());
    }

    // 상한가 종목 조회
    public List<MarketThemeStockDto> getUpperLimitStocks() {
        List<StockPrice> upperLimitData = stockPriceRepository.findUpperLimitStocks();

        return upperLimitData.stream()
                .map(this::convertToMarketThemeStockDto)
                .limit(5) // 프론트엔드에서 5개만 보여주므로 제한
                .collect(Collectors.toList());
    }

    // 거래비중상위 종목 조회
    public List<MarketThemeStockDto> getTopVolumeShareStocks() {
        List<StockPrice> topVolumeData = stockPriceRepository.findTopVolumeShareStocks();

        return topVolumeData.stream()
                .map(this::convertToMarketThemeStockDto)
                .limit(5) // 프론트엔드에서 5개만 보여주므로 제한
                .collect(Collectors.toList());
    }

    // StockPrice 엔티티를 MarketThemeStockDto로 변환하는 헬퍼 메소드
    private MarketThemeStockDto convertToMarketThemeStockDto(StockPrice sp) {
        // Stock 엔티티가 null일 경우 대비
        String stockName = (sp.getStock() != null && sp.getStock().getStockName() != null) ? sp.getStock().getStockName() : "Unknown";
        String stockCode = (sp.getStock() != null && sp.getStock().getStockCode() != null) ? sp.getStock().getStockCode() : "N/A";


        String formattedPriceDate = sp.getPriceDate() != null ?
                sp.getPriceDate().toLocalDateTime().format(TIME_FORMATTER) : "N/A";

        String formattedClosePrice = sp.getClosePrice() != null ?
                String.format("%,.0f", sp.getClosePrice()) : "N/A";

        String formattedStockFluctuation; // 등락률을 나타내는 필드
        // 등락률 계산 로직 (종가 - 시가) / 시가 * 100
        if (sp.getOpenPrice() != null && sp.getClosePrice() != null && sp.getOpenPrice().compareTo(BigDecimal.ZERO) != 0) {
            BigDecimal rate = (sp.getClosePrice().subtract(sp.getOpenPrice()))
                                .divide(sp.getOpenPrice(), 4, RoundingMode.HALF_UP) // 소수점 4자리까지 계산
                                .multiply(new BigDecimal("100"));
            formattedStockFluctuation = String.format("%+.2f%%", rate.doubleValue()); // 부호 포함, 소수점 둘째 자리까지
        } else if (sp.getStockFluctuation() != null) {
            // stockFluctuation 필드가 이미 등락률(%) 값이라면 바로 사용
            formattedStockFluctuation = String.format("%+.2f%%", sp.getStockFluctuation().doubleValue());
        } else {
            formattedStockFluctuation = "N/A";
        }
        
        return new MarketThemeStockDto(
                formattedPriceDate,
                stockName,
                stockCode,
                formattedClosePrice,
                formattedStockFluctuation
        );
    }
}