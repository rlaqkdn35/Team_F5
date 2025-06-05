package com.smhrd.stock.entity;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="t_comment")
public class Comment {

    @Id
    @Column(name = "cmt_idx")
    private int cmtIdx;

    @Column(name = "forum_idx")
    private int forumIdx;

    @Column(name = "cmt_content")
    private String cmtContent;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name="user_id")
    private String userId;
}
