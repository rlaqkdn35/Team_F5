package com.smhrd.stock.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.stock.entity.Stock;
import com.smhrd.stock.service.StockService;

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
}
