package com.smhrd.stock.service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.smhrd.stock.dto.TopStockResponseDto;
import com.smhrd.stock.entity.Stock;
import com.smhrd.stock.repository.StockPriceRepository;
import com.smhrd.stock.repository.StockRepository;

@Service
public class StockService {

    private static final Logger logger = LoggerFactory.getLogger(StockService.class);

    private final StockRepository stockRepository;
    private final StockPriceRepository stockPriceRepository;
    
    public StockService(StockRepository stockRepository, StockPriceRepository stockPriceRepository) {
        this.stockRepository = stockRepository;
        this.stockPriceRepository = stockPriceRepository;
    }

    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }
    
    /**
     * 오늘의 탑 종목 리스트를 조회합니다. 등락률은 데이터베이스에서 직접 가져옵니다.
     * 프론트엔드에서 최종 정렬 및 순위 부여를 담당합니다.
     * @return 오늘의 탑 종목 정보가 담긴 DTO 리스트 (최대 150개)
     */
    public List<TopStockResponseDto> getDailyTopStocks(Timestamp date) {
        logger.info("getDailyTopStocks 호출 - 조회 날짜: {}", date);
        List<TopStockResponseDto> topStocks = stockPriceRepository.findDailyTopStocksWithDetails(date);

        if (topStocks == null || topStocks.isEmpty()) {
            logger.warn("getDailyTopStocks - 해당 날짜에 조회된 데이터가 없습니다: {}", date);
        } else {
            logger.info("getDailyTopStocks - 조회된 종목 수: {}", topStocks.size());
        }

        return topStocks.stream()
                        .limit(150)
                        .collect(Collectors.toList());
    }
}
