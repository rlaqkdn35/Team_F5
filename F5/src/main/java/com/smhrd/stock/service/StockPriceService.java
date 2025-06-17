package com.smhrd.stock.service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.stock.dto.StockPriceWithNameDto;
import com.smhrd.stock.entity.Stock;
import com.smhrd.stock.entity.StockPrice;
import com.smhrd.stock.repository.StockPriceRepository;
import com.smhrd.stock.repository.StockRepository;
import com.smhrd.stock.util.StockCsvUtil;


@Service
public class StockPriceService {

    private final StockPriceRepository stockPriceRepository;
    private final StockRepository stockRepository;
    private final OpenApiCaller openApiCaller;
    
    public StockPriceService(StockPriceRepository stockPriceRepository, StockRepository stockRepository, OpenApiCaller openApiCaller) {
        this.stockPriceRepository = stockPriceRepository;
        this.stockRepository = stockRepository;
        this.openApiCaller = openApiCaller;
    }

    public List<StockPriceWithNameDto> getDailyStockData(LocalDate date) {
        return stockPriceRepository.findLatestPerStockCodeByDate(date);
    }
    

    /**
     * 특정 주식 코드의 가장 최신 시세 데이터를 조회합니다.
     * @param stockCode 조회할 주식 코드
     * @return 가장 최신 StockPrice 객체 (없으면 null)
     */
    public StockPrice getStockPriceByStockCodeLatest(String stockCode) {
        // findTopByStock_StockCodeOrderByPriceDateDesc 메서드는 Optional<StockPrice>를 반환합니다.
        // 따라서 .orElse(null)을 사용하여 Optional이 비어있을 경우 null을 반환하도록 합니다.
        return stockPriceRepository.findTopByStock_StockCodeOrderByPriceDateDesc(stockCode).orElse(null);
    }
    

    public List<StockPriceWithNameDto> getStockHistoryByCode(String stockCode) {
        return stockPriceRepository.findStockHistoryDtoByStockCodeOrderByPriceDateAsc(stockCode);
    }

//    public List<StockPrice> getAllStockPrices() {
//        return stockPriceRepository.findAll();
//    }
//
//    public StockPrice getStockPriceById(Long priceId) {
//        return stockPriceRepository.findById(priceId).orElse(null);
//    }


    public List<StockPrice> getStockPricesByStockCode(String stockCode) {
        return stockPriceRepository.findByStock_StockCodeOrderByPriceDateAsc(stockCode);
    }

    public List<StockPrice> getStockPricesByStockCodeAndDateRange(String stockCode, Timestamp startDate, Timestamp endDate) {
        return stockPriceRepository.findByStock_StockCodeAndPriceDateBetweenOrderByPriceDateAsc(stockCode, startDate, endDate);
    }

    

    public List<StockPrice> getLatestPricesForStockCodes(List<String> stockCodes) {
        List<StockPrice> result = new ArrayList<>();

        for (String code : stockCodes) {
            Optional<StockPrice> latest = stockPriceRepository.findTopByStock_StockCodeOrderByPriceDateDesc(code);
            latest.ifPresent(result::add);
        }

        return result;
    }
    @Transactional
    public void fetchAndSaveAllStockPrices() {
        Map<String, String> stockMap = StockCsvUtil.readStockCodeNameMap();

        for (Map.Entry<String, String> entry : stockMap.entrySet()) {
            try {
                String stockCode = entry.getKey();
                
                Optional<Stock> stockOptional = stockRepository.findByStockCode(stockCode);

                // 2. 만약 해당 stockCode의 Stock 엔티티가 존재하지 않으면, 이 주식의 가격을 저장할 수 없습니다.
                if (!stockOptional.isPresent()) {
                    System.err.println("경고: Stock 코드 '" + stockCode + "'에 해당하는 Stock 엔티티를 찾을 수 없습니다. 이 주식의 가격 데이터를 건너뜁니다.");
                    continue; // 다음 종목으로 넘어갑니다.
                }
                Stock stockEntity = stockOptional.get(); // 찾은 Stock 엔티티
                
                Map<String, String> data = openApiCaller.fetchStockData(stockCode);

                StockPrice sp = new StockPrice();
                sp.setStock(stockEntity);
                sp.setPriceDate(new Timestamp(System.currentTimeMillis()));
                sp.setOpenPrice(new BigDecimal(data.get("stck_oprc")));
                sp.setHighPrice(new BigDecimal(data.get("stck_hgpr")));
                sp.setLowPrice(new BigDecimal(data.get("stck_lwpr")));
                sp.setClosePrice(new BigDecimal(data.get("stck_prpr")));
                sp.setStockVolume(new BigDecimal(data.get("acml_vol")));
                sp.setStockFluctuation(new BigDecimal(data.get("prdy_vrss")));

                stockPriceRepository.save(sp);

                // 요청 속도 제한: 종목당 300ms 대기
                Thread.sleep(300); 

            } catch (Exception e) {
                System.err.println("❌ 저장 실패 (" + entry.getKey() + "): " + e.getMessage());
            }
        }
    }
}

    
