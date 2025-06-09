package com.smhrd.stock.repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.entity.StockPrice;

@Repository
public interface StockPriceRepository extends JpaRepository<StockPrice, Long> {

	// 특정 날짜의 코스닥 150 데이터 조회 (예: 특정 날짜 기준 top 150 등락률 순 정렬)
    List<StockPrice> findTop150ByPriceDateOrderByStockFluctuationDesc(Timestamp priceDate);

    // 필요하면 날짜별 전체 데이터 조회
    List<StockPrice> findByPriceDate(Timestamp priceDate);
    
    
    @Query(value = """
            SELECT 
                sp.stock_code AS stockCode,
                s.stock_name AS stockName,
                sp.open_price AS openPrice,
                sp.high_price AS highPrice,
                sp.low_price AS lowPrice,
                sp.close_price AS closePrice,
                sp.stock_volume AS stockVolume,
                sp.stock_fluctuation AS stockFluctuation,
                sp.price_date AS priceDate
            FROM t_stockprice sp
            JOIN t_stock s ON sp.stock_code = s.stock_code
            WHERE sp.price_date = :priceDate
            ORDER BY ABS(sp.stock_fluctuation) DESC
            LIMIT 150
        """, nativeQuery = true)
        List<Map<String, Object>> findTop150WithStockNameByDate(@Param("priceDate") Timestamp priceDate);
}