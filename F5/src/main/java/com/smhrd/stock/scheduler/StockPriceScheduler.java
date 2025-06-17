package com.smhrd.stock.scheduler;

import com.smhrd.stock.service.StockPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StockPriceScheduler {

    private final StockPriceService stockPriceService;

    @Scheduled(fixedRate = 60_000) // 60초마다 실행
    public void updateAllPrices() {
        System.out.println("🔄 코스닥150 종목 시세 갱신 시작...");
        stockPriceService.fetchAndSaveAllStockPrices();
    }
}
