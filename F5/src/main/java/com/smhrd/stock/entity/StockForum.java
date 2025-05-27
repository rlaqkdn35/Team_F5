package com.smhrd.stock.entity;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="t_stock_forum")
public class StockForum {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer forum_idx; // PK, Auto Increment

    @Column(length = 20, nullable = false)
    private String stock_code;

    @Column(length = 600, nullable = false)
    private String forum_title;

    @Lob
    @Column(nullable = false)
    private String forum_content;

    @Column(length = 1000)
    private String forum_file;

    @Column(insertable = false, columnDefinition = "timestamp default current_timestamp")
    private Timestamp created_at;

    private Timestamp updated_at;

    @Column(insertable = false, columnDefinition = "int default 0")
    private Integer forum_views;

    @Column(insertable = false, columnDefinition = "int default 0")
    private Integer forum_recos;

    @Column(length = 50)
    private String user_id;

}
