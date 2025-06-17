package com.smhrd.stock.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_index_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyIndexData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "market_type", nullable = false)
    private String marketType; // "KOSPI" or "KOSDAQ"

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "average_price", nullable = false)
    private Double averagePrice;

    @Column(name = "created_at", updatable = false, insertable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}