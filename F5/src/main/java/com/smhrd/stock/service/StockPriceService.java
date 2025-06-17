package com.smhrd.stock.service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smhrd.stock.dto.StockPriceWithNameDto;
import com.smhrd.stock.entity.StockPrice;
import com.smhrd.stock.repository.StockPriceRepository;

import jakarta.transaction.Transactional;

@Service
public class StockPriceService {

    private final StockPriceRepository stockPriceRepository;

    public StockPriceService(StockPriceRepository stockPriceRepository) {
        this.stockPriceRepository = stockPriceRepository;
    }

    public List<StockPriceWithNameDto> getDailyStockData(LocalDate date) {
        return stockPriceRepository.findLatestPerStockCodeByDate(date);
    }
    
//    public List<StockPrice> getAllStockPrices() {
//        return stockPriceRepository.findAll();
//    }
//
//    public StockPrice getStockPriceById(Long priceId) {
//        return stockPriceRepository.findById(priceId).orElse(null);
//    }

    public List<StockPrice> getStockPricesByStockCode(String stockCode) {
        return stockPriceRepository.findByStock_StockCodeOrderByPriceDateAsc(stockCode);
    }

    public List<StockPrice> getStockPricesByStockCodeAndDateRange(String stockCode, Timestamp startDate, Timestamp endDate) {
        return stockPriceRepository.findByStock_StockCodeAndPriceDateBetweenOrderByPriceDateAsc(stockCode, startDate, endDate);
    }

    
}