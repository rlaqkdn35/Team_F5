package com.smhrd.stock.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.stock.entity.DailyIndexData;
import com.smhrd.stock.repository.DailyIndexDataRepository;

import lombok.RequiredArgsConstructor;
import com.smhrd.stock.dto.StockPriceResponse;
@Service
public class DailyIndexService {

    @Autowired
    private MarketStockService marketStockService;

    @Autowired
    private DailyIndexDataRepository dailyIndexDataRepository;

    public void saveDailyAverage(String marketType) {
        List<StockPriceResponse> prices = marketStockService.getIndexPrices(marketType);

        if (prices == null || prices.isEmpty()) {
            System.out.println("📛 데이터 없음: " + marketType);
            return;
        }

        double avg = prices.stream()
                .mapToDouble(p -> Double.parseDouble(p.getBstp_nmix_prpr()))
                .average()
                .orElse(0.0);

        System.out.println("✅ 평균 계산 완료: " + marketType + " - " + avg);

        DailyIndexData data = new DailyIndexData();
        data.setMarketType(marketType);
        data.setDate(LocalDate.now());
        data.setAveragePrice(avg);

        dailyIndexDataRepository.save(data);  // ✅ 여기서 저장

        System.out.println("📦 저장 완료: " + data);
    }
    public Map<String, List<DailyIndexData>> getRecentIndexData() {
        Map<String, List<DailyIndexData>> result = new HashMap<>();

        List<DailyIndexData> kospiList = dailyIndexDataRepository.findByMarketTypeOrderByDateDesc("KOSPI");
        List<DailyIndexData> kosdaqList = dailyIndexDataRepository.findByMarketTypeOrderByDateDesc("KOSDAQ");

        result.put("KOSPI", kospiList);
        result.put("KOSDAQ", kosdaqList);

        return result;
    }
}
