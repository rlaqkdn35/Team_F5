package com.smhrd.stock.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.stock.entity.Stock;
import com.smhrd.stock.service.StockService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/stocks")
    public List<Stock> getStocks() {
        return stockService.getAllStocks();
    }
    
   
   
}