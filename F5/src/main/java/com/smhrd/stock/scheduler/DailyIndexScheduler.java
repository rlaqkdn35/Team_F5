package com.smhrd.stock.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.smhrd.stock.service.DailyIndexService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DailyIndexScheduler {

    private final DailyIndexService dailyIndexService;

    
    @Scheduled(fixedRate = 60_000)
    public void saveDailyIndex() {
        dailyIndexService.saveDailyAverage("KOSPI");
        dailyIndexService.saveDailyAverage("KOSDAQ");
    }
}