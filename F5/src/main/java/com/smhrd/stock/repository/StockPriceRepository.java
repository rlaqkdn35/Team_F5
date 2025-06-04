package com.smhrd.stock.repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.dto.TopStockResponseDto;
import com.smhrd.stock.entity.StockPrice;

@Repository
public interface StockPriceRepository extends JpaRepository<StockPrice, Long> {

    Optional<StockPrice> findByStockCodeAndPriceDate(String stockCode, Timestamp priceDate);

    List<StockPrice> findByPriceDate(Timestamp priceDate);

    @Query("SELECT new com.smhrd.stock.dto.TopStockResponseDto(" +
           "  NULL, " + // rank는 프론트에서 채울 예정
           "  s.stockCode, " +
           "  s.stockName, " +
           "  sp.closePrice, " +
           "  sp.stockFluctuation, " +
           "  sp.stockVolume " +
           ") " +
           "FROM Stock s " +
           "JOIN StockPrice sp ON s.stockCode = sp.stockCode " +
           "WHERE sp.priceDate = :currentDate")
    List<TopStockResponseDto> findDailyTopStocksWithDetails(
        @Param("currentDate") Timestamp currentDate
    );

}
