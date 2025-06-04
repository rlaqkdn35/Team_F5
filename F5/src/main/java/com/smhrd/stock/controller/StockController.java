package com.smhrd.stock.controller;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.stock.dto.TopStockResponseDto;
import com.smhrd.stock.entity.Stock;
import com.smhrd.stock.service.StockService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/api/stocks")
    public List<Stock> getStocks() {
        return stockService.getAllStocks();
    }
    
    @GetMapping("/api/stocks/daily-top")
    public ResponseEntity<List<TopStockResponseDto>> getDailyTopStocks(@RequestParam String date) {
        Timestamp timestamp = Timestamp.valueOf(date);  // ex) "2025-05-30 00:00:00.000000"
        List<TopStockResponseDto> topStocks = stockService.getDailyTopStocks(timestamp);
        return ResponseEntity.ok(topStocks);
    }
   
}