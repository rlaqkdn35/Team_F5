package com.smhrd.stock.repository;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smhrd.stock.dto.StockPriceWithNameDto;
import com.smhrd.stock.dto.TopStockResponseDto;
import com.smhrd.stock.entity.StockPrice;

public interface StockPriceRepository extends JpaRepository<StockPrice, Long> {

	@Query("SELECT new com.smhrd.stock.dto.StockPriceWithNameDto(" +
	           "sp.priceId, " +
	           "sp.stock.stockCode, " +
	           "s.stockName, " +
	           "sp.priceDate, " +
	           "sp.openPrice, " +
	           "sp.highPrice, " +
	           "sp.lowPrice, " +
	           "sp.closePrice, " +
	           "sp.stockFluctuation, " +
	           "sp.stockVolume) " +
	           "FROM StockPrice sp " +
	           "JOIN Stock s ON sp.stock.stockCode = s.stockCode " +
	           "WHERE FUNCTION('DATE', sp.priceDate) = :targetDate AND " +
	           "sp.priceId IN (" +
	               "SELECT MAX(sp2.priceId) " + // 각 종목의 가장 큰 priceId (가장 최신 레코드)
	               "FROM StockPrice sp2 " +
	               "WHERE FUNCTION('DATE', sp2.priceDate) = :targetDate " +
	               "GROUP BY sp2.stock.stockCode" +
	           ")")
	    List<StockPriceWithNameDto> findLatestPerStockCodeByDate(@Param("targetDate") LocalDate targetDate);

	@Query(value = "SELECT sp FROM StockPrice sp JOIN FETCH sp.stock s "
			+ "WHERE (sp.stock.stockCode, sp.priceDate) IN "
			+ "(SELECT sub.stock.stockCode, MAX(sub.priceDate) FROM StockPrice sub GROUP BY sub.stock.stockCode)")
	List<StockPrice> findAllLatestStockPricesWithStockInfo();
	
	List<StockPrice> findByStock_StockCodeOrderByPriceDateAsc(String stockCode);
    List<StockPrice> findByStock_StockCodeAndPriceDateBetweenOrderByPriceDateAsc(String stockCode, Timestamp startDate, Timestamp endDate);
    Optional<StockPrice> findTopByStock_StockCodeOrderByPriceDateDesc(String stockCode);

	
	
	@Query("SELECT new com.smhrd.stock.dto.StockPriceWithNameDto(" +
	           "sp.priceId, sp.stock.stockCode, sp.stock.stockName, " + 
	           "sp.priceDate, sp.openPrice, sp.highPrice, sp.lowPrice, " +
	           "sp.closePrice, sp.stockFluctuation, sp.stockVolume) " +
	           "FROM StockPrice sp " +
	           "WHERE sp.stock.stockCode = :stockCode " + 
	           "ORDER BY sp.priceDate ASC")
	    List<StockPriceWithNameDto> findStockHistoryDtoByStockCodeOrderByPriceDateAsc(@Param("stockCode") String stockCode);

	
	Optional<StockPrice> findByStock_StockCodeAndPriceDate(String stockCode, Timestamp priceDate); // ✅ 수정본
    List<StockPrice> findByPriceDate(Timestamp priceDate);

    @Query("SELECT new com.smhrd.stock.dto.TopStockResponseDto(" +
    	       "  NULL, " + // rank는 프론트에서 채울 예정
    	       "  sp.stock.stockCode, " +
    	       "  sp.stock.stockName, " +
    	       "  sp.closePrice, " +
    	       "  sp.stockFluctuation, " +
    	       "  sp.stockVolume " +
    	       ") " +
    	       "FROM StockPrice sp " +
    	       "WHERE sp.priceDate = :currentDate")
    	List<TopStockResponseDto> findDailyTopStocksWithDetails(
    	    @Param("currentDate") Timestamp currentDate
    	);

    // 52주 신고가 종목을 직접 찾는 쿼리
    // 각 종목별 오늘 최신 데이터만 가져오도록 수정
    @Query(value = "SELECT sp.* FROM t_stockprice sp " +
            "WHERE sp.price_id IN ( " + // <<-- sub_sp.id 대신 sub_sp.price_id 로 변경
            "    SELECT MAX(sub_sp.price_id) " + // <<-- sub_sp.id 대신 sub_sp.price_id 로 변경
            "    FROM t_stockprice sub_sp " +
            "    WHERE DATE(sub_sp.price_date) = CURDATE() " +
            "    GROUP BY sub_sp.stock_code " +
            ") " +
            "AND DATE(sp.price_date) = CURDATE() " +
            "AND sp.close_price >= ( " +
            "    SELECT MAX(sub_sp2.high_price) " +
            "    FROM t_stockprice sub_sp2 " +
            "    WHERE sub_sp2.stock_code = sp.stock_code " +
            "    AND sub_sp2.price_date >= :oneYearAgo " +
            ") " +
            "ORDER BY sp.close_price DESC",
            nativeQuery = true)
    List<StockPrice> find52WeekHighStocks(@Param("oneYearAgo") Timestamp oneYearAgo);




 // StockPriceRepository.java
 @Query(value = "SELECT sp.* FROM t_stockprice sp " +
         "WHERE sp.price_id IN ( " +
         "    SELECT MIN(inner_sp.price_id) " +
         "    FROM t_stockprice inner_sp " +
         "    WHERE DATE(inner_sp.price_date) = CURDATE() " + // <-- CONVERT_TZ 없음, DATE()만!
         "    AND inner_sp.stock_fluctuation >= 30.0 " + // <-- 30.0 (스케일 0.0대0.0 기준 30%)
         "    GROUP BY inner_sp.stock_code " +
         ") " +
         "ORDER BY sp.price_date ASC", // 달성 시간 순서로 정렬
         nativeQuery = true)
 List<StockPrice> findUpperLimitStocks();


    // 거래비중상위 종목을 찾는 쿼리
    // 각 종목별 오늘 최신 데이터만 가져오도록 수정
    @Query(value = "SELECT sp.* FROM t_stockprice sp " +
            "WHERE sp.price_id IN ( " + // <<-- sub_sp.id 대신 sub_sp.price_id 로 변경
            "    SELECT MAX(sub_sp.price_id) " + // <<-- sub_sp.id 대신 sub_sp.price_id 로 변경
            "    FROM t_stockprice sub_sp " +
            "    WHERE DATE(sub_sp.price_date) = CURDATE() " +
            "    GROUP BY sub_sp.stock_code " +
            ") " +
            "AND DATE(sp.price_date) = CURDATE() " +
            "AND sp.stock_volume > 0 " +
            "ORDER BY sp.stock_volume DESC, sp.price_date DESC",
            nativeQuery = true)
    List<StockPrice> findTopVolumeShareStocks();

    List<StockPrice> findByStock_StockCodeAndPriceDateBetweenOrderByPriceDateDesc(String stockCode, Timestamp startDate, Timestamp endDate);
    
    List<StockPrice> findTop7ByStock_StockCodeOrderByPriceDateDesc(String stockCode);

    @Query("SELECT sp FROM StockPrice sp WHERE sp.stock.stockCode = :stockCode AND sp.priceDate BETWEEN :newsDateStart AND :newsDateEnd ORDER BY sp.priceDate DESC")
    List<StockPrice> findTop1ByStock_StockCodeAndPriceDateBetweenOrderByPriceDateDesc(
            @Param("stockCode") String stockCode, @Param("newsDateStart") Timestamp newsDateStart, @Param("newsDateEnd") Timestamp newsDateEnd);

    Optional<StockPrice> findTop1ByStock_StockCodeOrderByPriceDateDesc(String stockCode);

}
    