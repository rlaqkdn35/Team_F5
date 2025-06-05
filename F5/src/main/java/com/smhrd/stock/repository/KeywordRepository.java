package com.smhrd.stock.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.entity.Keyword;

@Repository
public interface KeywordRepository extends JpaRepository<Keyword, Integer> {

	@Query(value = """
	        SELECT
	            k.keyword_name AS keywordName,
	            SUM(k.mentioned_cnt) AS totalCount,
	            COUNT(DISTINCT k.news_idx) AS numArticlesMentionedIn
	        FROM
	            t_keyword k
	        GROUP BY
	            k.keyword_name
	        ORDER BY
	            totalCount DESC
	        LIMIT 18
	        """, nativeQuery = true)
	List<Object[]> findTop100KeywordStats(); // DTO 없이 Object[] 사용

	
	
}
