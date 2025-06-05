package com.smhrd.stock.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Data;

@Entity
@Table(name = "t_forum_recos")
@Data
@Builder
public class ForumRecos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recos_idx")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "forum_idx", nullable = false)
    private Integer forumIdx;

    @Column(name = "recos_cnt", nullable = false)
    private Integer recosCnt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // 기본 생성자 (JPA용)
    public ForumRecos() {
    }

    // 모든 필드를 받는 생성자 (Builder 작동용)
    public ForumRecos(Long id, String userId, Integer forumIdx, Integer recosCnt, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.forumIdx = forumIdx;
        this.recosCnt = recosCnt;
        this.createdAt = createdAt;
    }
}
