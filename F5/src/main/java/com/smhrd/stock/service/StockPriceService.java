package com.smhrd.stock.service;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smhrd.stock.entity.StockPrice;
import com.smhrd.stock.repository.StockPriceRepository;

@Service
public class StockPriceService {

    private final StockPriceRepository stockPriceRepository;

    public StockPriceService(StockPriceRepository stockPriceRepository) {
        this.stockPriceRepository = stockPriceRepository;
    }

    public List<StockPrice> getTop150ByDate(Timestamp date) {
        return stockPriceRepository.findTop150ByPriceDateOrderByStockFluctuationDesc(date);
    }

    public List<StockPrice> getAllByDate(Timestamp date) {
        return stockPriceRepository.findByPriceDate(date);
    }
}