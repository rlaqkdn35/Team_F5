package com.smhrd.stock.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smhrd.stock.entity.DailyIndexData;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

public interface DailyIndexDataRepository extends JpaRepository<DailyIndexData, Long> {

    Optional<DailyIndexData> findByMarketTypeAndDate(String marketType, LocalDate date);

    List<DailyIndexData> findTop7ByMarketTypeOrderByDateDesc(String marketType);
}
