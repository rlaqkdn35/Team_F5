package com.smhrd.stock.dto;

import java.util.Date;

public class ForumSummaryDTO {
    private Integer forumIdx;
    private String forumTitle;
    private String userId;
    private String nickname;

    private Date createdAt;      // 작성일
    private Integer forumViews;  // 조회수
    private Integer forumRecos;  // 추천수

    public ForumSummaryDTO() {}

    public ForumSummaryDTO(Integer forumIdx, String forumTitle, String userId, String nickname,
                           Date createdAt, Integer forumViews, Integer forumRecos) {
        this.forumIdx = forumIdx;
        this.forumTitle = forumTitle;
        this.userId = userId;
        this.nickname = nickname;
        this.createdAt = createdAt;
        this.forumViews = forumViews;
        this.forumRecos = forumRecos;
    }

    public Integer getForumIdx() {
        return forumIdx;
    }

    public void setForumIdx(Integer forumIdx) {
        this.forumIdx = forumIdx;
    }

    public String getForumTitle() {
        return forumTitle;
    }

    public void setForumTitle(String forumTitle) {
        this.forumTitle = forumTitle;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public Date getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getForumViews() {
        return forumViews;
    }
    public void setForumViews(Integer forumViews) {
        this.forumViews = forumViews;
    }

    public Integer getForumRecos() {
        return forumRecos;
    }
    public void setForumRecos(Integer forumRecos) {
        this.forumRecos = forumRecos;
    }
}
