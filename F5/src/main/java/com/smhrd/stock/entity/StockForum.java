package com.smhrd.stock.entity;

import java.sql.Timestamp;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="t_stock_forum")
public class StockForum {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer forum_idx; 

    @Column(length = 20, nullable = false)
    private String stock_code;

    @Column(length = 600, nullable = false)
    private String forum_title;

    @Lob
    @Column(nullable = false)
    private String forum_content;

    @Column(length = 1000, nullable = true)
    private String forum_file;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at", nullable = false)
    private Timestamp updatedAt;

    // 생성 시점에 timestamp 넣기
    @PrePersist
    protected void onCreate() {
        Timestamp now = Timestamp.from(Instant.now());
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Timestamp.from(Instant.now());
    }

    @Column(insertable = false, columnDefinition = "int default 0")
    private Integer forum_views;

    @Column(insertable = false, columnDefinition = "int default 0")
    private Integer forum_recos;

    @Column(length = 50)
    private String user_id;

}
