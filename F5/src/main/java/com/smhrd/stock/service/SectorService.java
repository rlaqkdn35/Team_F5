package com.smhrd.stock.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.stock.dto.StockDataForFrontendDto;
import com.smhrd.stock.entity.StockPrice;
import com.smhrd.stock.repository.StockPriceRepository;

@Service
public class SectorService {

    private final StockPriceRepository stockPriceRepository;

    @Autowired
    public SectorService(StockPriceRepository stockPriceRepository) {
        this.stockPriceRepository = stockPriceRepository;
    }

    public List<StockDataForFrontendDto> getAllLatestStockDataForFrontend() {
        List<StockPrice> latestStockPrices = stockPriceRepository.findAllLatestStockPricesWithStockInfo();

        return latestStockPrices.stream()
                .map(sp -> new StockDataForFrontendDto(
                        sp.getStock().getStockCode(),
                        sp.getStock().getStockName(),
                        sp.getStock().getStockCategory(), // ★★★ 변경된 부분 ★★★
                        sp.getClosePrice(),
                        sp.getOpenPrice(),
                        sp.getHighPrice(),
                        sp.getLowPrice(),
                        sp.getStockVolume(),
                        sp.getStockFluctuation(),
                        sp.getPriceDate()
                ))
                .collect(Collectors.toList());
    }
}