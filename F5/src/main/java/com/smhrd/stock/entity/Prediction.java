package com.smhrd.stock.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_prediction")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pred_idx")
    private Integer predIdx;

    @Column(name = "stock_code")
    private String stockCode;

    @Column(name = "first_day", precision = 12, scale = 1)
    private BigDecimal firstDay;

    @Column(name = "second_day", precision = 12, scale = 1)
    private BigDecimal secondDay;

    @Column(name = "third_day", precision = 12, scale = 1)
    private BigDecimal thirdDay;

    @Column(name = "fourth_day", precision = 12, scale = 1)
    private BigDecimal fourthDay;

    @Column(name = "fifth_day", precision = 12, scale = 1)
    private BigDecimal fifthDay;

    @Column(name = "sixth_day", precision = 12, scale = 1)
    private BigDecimal sixthDay;

    @Column(name = "seventh_day", precision = 12, scale = 1)
    private BigDecimal seventhDay;

    @Column(name = "eighth_day", precision = 12, scale = 1)
    private BigDecimal eighthDay;

    @Column(name = "ninth_day", precision = 12, scale = 1)
    private BigDecimal ninthDay;

    @Column(name = "tenth_day", precision = 12, scale = 1)
    private BigDecimal tenthDay;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}