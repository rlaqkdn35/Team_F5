package com.smhrd.stock.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.smhrd.stock.dto.StockPriceWithNameDto;
import com.smhrd.stock.entity.StockPrice;

public interface StockPriceRepository extends Repository<StockPrice, Long> {

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

	
	
	@Query("SELECT new com.smhrd.stock.dto.StockPriceWithNameDto(" +
	           "sp.priceId, sp.stock.stockCode, sp.stock.stockName, " + 
	           "sp.priceDate, sp.openPrice, sp.highPrice, sp.lowPrice, " +
	           "sp.closePrice, sp.stockFluctuation, sp.stockVolume) " +
	           "FROM StockPrice sp " +
	           "WHERE sp.stock.stockCode = :stockCode " + 
	           "ORDER BY sp.priceDate ASC")
	    List<StockPriceWithNameDto> findStockHistoryDtoByStockCodeOrderByPriceDateAsc(@Param("stockCode") String stockCode);


}
