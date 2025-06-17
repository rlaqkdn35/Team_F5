package com.smhrd.stock.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.smhrd.stock.dto.UserFavStockDetailDto;
import com.smhrd.stock.entity.Stock;
import com.smhrd.stock.entity.StockPrice;
import com.smhrd.stock.entity.UserFav;
import com.smhrd.stock.repository.StockPriceRepository;
import com.smhrd.stock.repository.StockRepository;
import com.smhrd.stock.repository.UserFavRepository;

import jakarta.transaction.Transactional;

@Service
public class UserFavService {


	private final UserFavRepository userFavRepository;
    private final StockRepository stockRepository;
    private final StockPriceRepository stockPriceRepository;

    public UserFavService(UserFavRepository userFavRepository, StockRepository stockRepository, StockPriceRepository stockPriceRepository) {
        this.userFavRepository = userFavRepository;
        this.stockRepository = stockRepository;
        this.stockPriceRepository = stockPriceRepository;
    }

    /**
     * 관심 종목을 추가합니다.
     * @param userId 사용자 ID
     * @param stockCode 주식 코드
     * @return 저장된 UserFav 객체 또는 null (이미 존재할 경우)
     */
    @Transactional
    public UserFav addFavorite(String userId, String stockCode) {
        // 이미 관심 종목으로 등록되어 있는지 확인
        Optional<UserFav> existingFav = userFavRepository.findByUserIdAndStockCode(userId, stockCode);
        if (existingFav.isPresent()) {
            return null; // 이미 존재하면 null 반환 또는 예외 발생
        }

        UserFav userFav = new UserFav();
        userFav.setUserId(userId);
        userFav.setStockCode(stockCode);
        userFav.setCreated_at(Timestamp.valueOf(LocalDateTime.now())); // 현재 시간으로 설정
        return userFavRepository.save(userFav);
    }

    /**
     * 관심 종목을 삭제합니다.
     * @param userId 사용자 ID
     * @param stockCode 주식 코드
     * @return 삭제 성공 여부
     */
    @Transactional
    public boolean removeFavorite(String userId, String stockCode) {
        Optional<UserFav> existingFav = userFavRepository.findByUserIdAndStockCode(userId, stockCode);
        if (existingFav.isPresent()) {
            userFavRepository.delete(existingFav.get());
            return true;
        }
        return false; // 삭제할 대상이 없었음
    }

    /**
     * 특정 사용자의 모든 관심 종목을 조회합니다.
     * @param userId 사용자 ID
     * @return 관심 종목 리스트
     */
    public List<UserFav> getFavoritesByUserId(String userId) {
        return userFavRepository.findByUserId(userId);
    }

    /**
     * 특정 주식이 특정 사용자의 관심 종목인지 확인합니다.
     * @param userId 사용자 ID
     * @param stockCode 주식 코드
     * @return 관심 종목 여부
     */
    public boolean isFavorite(String userId, String stockCode) {
        return userFavRepository.findByUserIdAndStockCode(userId, stockCode).isPresent();
    }
    
    @Transactional
    public List<UserFavStockDetailDto> getUserFavoriteStocksWithDetails(String userId) {
        List<UserFav> favList = userFavRepository.findByUserId(userId);
        // log.info 대신 System.out.println 사용
        System.out.println("사용자 '" + userId + "'의 조회된 관심 종목 수: " + favList.size());

        List<UserFavStockDetailDto> resultList = new ArrayList<>();

        for (UserFav fav : favList) {
            String stockCode = fav.getStockCode();

            Optional<Stock> stockOpt = stockRepository.findByStockCode(stockCode);
            Optional<StockPrice> latestPriceOpt = stockPriceRepository.findTopByStock_StockCodeOrderByPriceDateDesc(stockCode);

            if (stockOpt.isPresent() && latestPriceOpt.isPresent()) {
                Stock stock = stockOpt.get();
                StockPrice latestPrice = latestPriceOpt.get();

                UserFavStockDetailDto dto = new UserFavStockDetailDto(
                    stock.getStockCode(),
                    stock.getStockName(),
                    latestPrice.getClosePrice(), // DTO 필드 이름이 closePrice로 변경됨
                    latestPrice.getStockFluctuation(),
                    latestPrice.getStockVolume()
                );
                resultList.add(dto);
                // log.debug 대신 System.out.println 사용 (디버그 메시지이므로 if로 감싸지 않았습니다)
                System.out.println("종목 코드 '" + stockCode + "': '" + stock.getStockName() + "' (최신 종가: " + latestPrice.getClosePrice() + ") 상세 정보 추가");
            } else {
                // log.warn 대신 System.out.println 사용
                System.out.println("경고: 종목 코드 '" + stockCode + "'에 대한 정보가 불완전합니다. (Stock 존재: " + stockOpt.isPresent() + ", StockPrice 존재: " + latestPriceOpt.isPresent() + ")");
            }
        }
        // log.info 대신 System.out.println 사용
        System.out.println("최종 반환될 관심 종목 상세 정보 수: " + resultList.size());
        return resultList;
    }
    
    
}