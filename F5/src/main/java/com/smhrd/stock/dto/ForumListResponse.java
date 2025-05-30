package com.smhrd.stock.dto;

import java.util.List;

public class ForumListResponse {
    private long totalCount;
    private List<ForumSummaryDTO> forums;  // StockForum -> ForumSummaryDTO

    public ForumListResponse(long totalCount, List<ForumSummaryDTO> forums) {
        this.totalCount = totalCount;
        this.forums = forums;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }

    public List<ForumSummaryDTO> getForums() {
        return forums;
    }

    public void setForums(List<ForumSummaryDTO> forums) {
        this.forums = forums;
    }
}
