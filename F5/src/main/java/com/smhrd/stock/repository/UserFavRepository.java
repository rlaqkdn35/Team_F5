package com.smhrd.stock.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.entity.UserFav;

@Repository
public interface UserFavRepository extends JpaRepository<UserFav, Integer> {
	
	// user_id와 stock_code로 특정 관심 종목을 찾는 메서드
    Optional<UserFav> findByUserIdAndStockCode(String userId, String stockCode);

    // 특정 user_id의 모든 관심 종목을 찾는 메서드
    List<UserFav> findByUserId(String userId);

    // user_id와 stock_code로 삭제 (Optional<UserFav>를 반환하지 않고 바로 삭제하는 경우)
    void deleteByUserIdAndStockCode(String userId, String stockCode);
}
