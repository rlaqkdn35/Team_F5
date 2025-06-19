package com.smhrd.stock.service;

import com.smhrd.stock.dto.MarketThemeStockDto;
import com.smhrd.stock.entity.StockPrice;
import com.smhrd.stock.repository.StockPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal; // 사용되지 않을 수 있지만 import는 유지
import java.math.RoundingMode; // 사용되지 않을 수 있지만 import는 유지
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketThemesService {

    private final StockPriceRepository stockPriceRepository;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    // 52주 신고가 종목 조회 (변경 없음)
    public List<MarketThemeStockDto> getHigh52wStocks() {
        LocalDateTime oneYearAgo = LocalDateTime.now().minusWeeks(52);
        Timestamp timestampOneYearAgo = Timestamp.valueOf(oneYearAgo);

        List<StockPrice> high52wData = stockPriceRepository.find52WeekHighStocks(timestampOneYearAgo);

        return high52wData.stream()
                .map(this::convertToMarketThemeStockDto)
                .limit(5)
                .collect(Collectors.toList());
    }

    // 상한가 종목 조회 (변경 없음)
    public List<MarketThemeStockDto> getUpperLimitStocks() {
        List<StockPrice> upperLimitData = stockPriceRepository.findUpperLimitStocks();

        return upperLimitData.stream()
                .map(this::convertToMarketThemeStockDto)
                .limit(5)
                .collect(Collectors.toList());
    }

    // 거래비중상위 종목 조회 (변경 없음)
    public List<MarketThemeStockDto> getTopVolumeShareStocks() {
        List<StockPrice> topVolumeData = stockPriceRepository.findTopVolumeShareStocks();

        return topVolumeData.stream()
                .map(this::convertToMarketThemeStockDto)
                .limit(5)
                .collect(Collectors.toList());
    }

    // StockPrice 엔티티를 MarketThemeStockDto로 변환하는 헬퍼 메소드
    private MarketThemeStockDto convertToMarketThemeStockDto(StockPrice sp) {
        String stockName = (sp.getStock() != null && sp.getStock().getStockName() != null) ? sp.getStock().getStockName() : "Unknown";
        String stockCode = (sp.getStock() != null && sp.getStock().getStockCode() != null) ? sp.getStock().getStockCode() : "N/A";

        String formattedPriceDate = sp.getPriceDate() != null ?
                sp.getPriceDate().toLocalDateTime().format(TIME_FORMATTER) : "N/A";

        String formattedClosePrice = sp.getClosePrice() != null ?
                String.format("%,.0f", sp.getClosePrice()) : "N/A";

        // 등락률 계산 로직을 완전히 제거하고 stock_fluctuation 값을 직접 사용
        String formattedStockFluctuation;
        if (sp.getStockFluctuation() != null) {
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