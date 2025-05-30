package com.smhrd.stock.dto;

import java.util.List;

import com.smhrd.stock.entity.Comment;
import com.smhrd.stock.entity.StockForum;

public class ForumDTO {
    private StockForum forum;
    private List<Comment> comments;
    private String nickname; // 작성자 닉네임 추가

    public ForumDTO(StockForum forum, List<Comment> comments, String nickname) {
        this.forum = forum;
        this.comments = comments;
        this.nickname = nickname;
    }

    public ForumDTO(StockForum forum, List<Comment> comments) {
        this(forum, comments, null);
    }

    public StockForum getForum() {
        return forum;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public String getNickname() {
        return nickname;
    }

    public void setForum(StockForum forum) {
        this.forum = forum;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
}
