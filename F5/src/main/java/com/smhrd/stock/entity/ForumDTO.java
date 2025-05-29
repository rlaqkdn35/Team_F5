// ForumDetailResponse.java
package com.smhrd.stock.entity;

import java.util.List;

public class ForumDTO {
    private StockForum forum;
    private List<Comment> comments;

    public ForumDTO(StockForum forum, List<Comment> comments) {
        this.forum = forum;
        this.comments = comments;
    }

    public StockForum getForum() {
        return forum;
    }

    public List<Comment> getComments() {
        return comments;
    }
}
