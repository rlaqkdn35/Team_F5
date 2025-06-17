package com.smhrd.stock.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.stock.entity.Stock;
import com.smhrd.stock.service.StockService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/stocks")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/stocklist")
    public List<Stock> getStocks() {
        return stockService.getAllStocks();
    }
    
    @GetMapping("/stockinfo/{stockCode}")
    public ResponseEntity<Stock> stockInfo(@PathVariable String stockCode) {
    	Stock stock = stockService.getStockByCode(stockCode);
        if (stock != null) {
            return ResponseEntity.ok(stock); // 200 OK
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 404 Not Found
        }
    }
    
   
   
}