package com.smhrd.stock.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.stock.entity.Croom;
import com.smhrd.stock.entity.Stock;
import com.smhrd.stock.repository.CroomRepository;
import com.smhrd.stock.repository.StockRepository;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CroomService {
	
    private final CroomRepository croomRepository;
    private final StockRepository stockRepository;

    @Transactional
    public Integer getOrCreateCroomIdxByStockCode(String stockCode) {
        // 1. Stock 엔티티를 찾습니다. (stockCode는 Stock의 PK이므로 findById 사용)
        Stock stock = stockRepository.findById(stockCode)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 종목 코드입니다: " + stockCode));

        // 2. 해당 Stock에 매핑된 Croom이 있는지 확인합니다.
        //    findByStock_StockCode는 Croom 엔티티의 'stock' 필드 내의 'stockCode'를 이용해 검색합니다.
        return croomRepository.findByStock_StockCode(stockCode)
                .map(Croom::getCroomIdx) // 이미 존재하면 해당 croomIdx 반환
                .orElseGet(() -> {
                    // 3. 존재하지 않으면 새로운 Croom 생성 및 저장
                    Croom newRoom = new Croom();
                    newRoom.setStock(stock); // 연관된 Stock 엔티티 설정
                    newRoom.setCroom_title(stock.getStockName() + " 토론방"); // 예시 타이틀
                    newRoom.setCroom_limit(500); // 예시 제한
                    newRoom.setCroom_status("ACTIVE"); // 예시 상태

                    newRoom = croomRepository.save(newRoom); // DB에 저장하고, 저장된 Croom 객체 반환
                    return newRoom.getCroomIdx(); // 새로 생성된 Croom의 croomIdx 반환
                });
    }

    // 다른 Croom 관련 메서드 (예: getCroomByIdx 등)
    @Transactional(readOnly = true)
    public Croom getCroomByIdx(int croomIdx) {
        return croomRepository.findById(croomIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방 ID입니다: " + croomIdx));
    }
}