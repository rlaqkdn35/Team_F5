package com.smhrd.stock.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.smhrd.stock.entity.UserFav;
import com.smhrd.stock.repository.UserFavRepository;

import jakarta.transaction.Transactional;

@Service
public class UserFavService {
	private final UserFavRepository userFavRepository;

    public UserFavService(UserFavRepository userFavRepository) {
        this.userFavRepository = userFavRepository;
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
}