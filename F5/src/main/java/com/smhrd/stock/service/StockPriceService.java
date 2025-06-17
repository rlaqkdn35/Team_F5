package com.smhrd.stock.service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smhrd.stock.dto.StockPriceWithNameDto;
import com.smhrd.stock.entity.StockPrice;
import com.smhrd.stock.repository.StockPriceRepository;


@Service
public class StockPriceService {

    private final StockPriceRepository stockPriceRepository;

    public StockPriceService(StockPriceRepository stockPriceRepository) {
        this.stockPriceRepository = stockPriceRepository;
    }

    public List<StockPriceWithNameDto> getDailyStockData(LocalDate date) {
        return stockPriceRepository.findLatestPerStockCodeByDate(date);
    }
    

    /**
     * 특정 주식 코드의 가장 최신 시세 데이터를 조회합니다.
     * @param stockCode 조회할 주식 코드
     * @return 가장 최신 StockPrice 객체 (없으면 null)
     */
    public StockPrice getStockPriceByStockCodeLatest(String stockCode) {
        // findTopByStock_StockCodeOrderByPriceDateDesc 메서드는 Optional<StockPrice>를 반환합니다.
        // 따라서 .orElse(null)을 사용하여 Optional이 비어있을 경우 null을 반환하도록 합니다.
        return stockPriceRepository.findTopByStock_StockCodeOrderByPriceDateDesc(stockCode).orElse(null);
    }
    

    public List<StockPriceWithNameDto> getStockHistoryByCode(String stockCode) {
        return stockPriceRepository.findStockHistoryDtoByStockCodeOrderByPriceDateAsc(stockCode);
    }


    public List<StockPrice> getStockPricesByStockCode(String stockCode) {
        return stockPriceRepository.findByStock_StockCodeOrderByPriceDateAsc(stockCode);
    }

    public List<StockPrice> getStockPricesByStockCodeAndDateRange(String stockCode, Timestamp startDate, Timestamp endDate) {
        return stockPriceRepository.findByStock_StockCodeAndPriceDateBetweenOrderByPriceDateAsc(stockCode, startDate, endDate);
    }


}