package com.smhrd.stock.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smhrd.stock.entity.Stock;
import com.smhrd.stock.repository.StockRepository;

@Service
public class StockService {

    private final StockRepository stockRepository;

    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    // StockDto 대신 Stock 엔티티 리스트 반환
    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }
    
    
}
