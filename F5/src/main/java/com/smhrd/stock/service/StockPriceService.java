package com.smhrd.stock.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smhrd.stock.dto.StockPriceWithNameDto;
import com.smhrd.stock.repository.StockPriceRepository;

@Service
public class StockPriceService {

    private final StockPriceRepository stockPriceRepository;

    public StockPriceService(StockPriceRepository stockPriceRepository) {
        this.stockPriceRepository = stockPriceRepository;
    }

    public List<StockPriceWithNameDto> getDailyStockData(LocalDate date) {
        return stockPriceRepository.findAllByPriceDateWithStockName(date);
    }
}