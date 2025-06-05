package com.smhrd.stock.dto;

import java.util.List;

import com.smhrd.stock.entity.Comment;
import com.smhrd.stock.entity.StockForum;

public class ForumDTO {
    private StockForum forum;
    private List<Comment> comments;
    private String nickname; // 작성자 닉네임 추가
    private boolean userRecommended; // 현재 로그인한 사용자의 추천 여부 추가

    // 추천 여부 포함 생성자
    public ForumDTO(StockForum forum, List<Comment> comments, String nickname, boolean userRecommended) {
        this.forum = forum;
        this.comments = comments;
        this.nickname = nickname;
        this.userRecommended = userRecommended;
    }

    // 추천 여부 없는 경우 기본 false로 초기화
    public ForumDTO(StockForum forum, List<Comment> comments, String nickname) {
        this(forum, comments, nickname, false);
    }

    public StockForum getForum() {
        return forum;
    }

    public void setForum(StockForum forum) {
        this.forum = forum;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public boolean isUserRecommended() {
        return userRecommended;
    }

    public void setUserRecommended(boolean userRecommended) {
        this.userRecommended = userRecommended;
    }
}
