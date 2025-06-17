package com.smhrd.stock.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.stock.entity.Stock;
import com.smhrd.stock.repository.StockRepository;

@Service
public class StockService {


    private final StockRepository stockRepository;

    
    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
        
    }

    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    /**
    * 특정 주식 코드로 주식 정보를 조회합니다.
    * @param stockCode 조회할 주식 코드
    * @return 주식 객체 (없으면 null)
    */
   public Stock getStockByCode(String stockCode) {
       return stockRepository.findById(stockCode).orElse(null);
   }


}