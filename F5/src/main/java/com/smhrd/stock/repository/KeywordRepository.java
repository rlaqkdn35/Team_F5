package com.smhrd.stock.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.dto.KeywordDTO;
import com.smhrd.stock.entity.Keyword; // Keyword 엔티티 임포트

// SqlResultSetMapping과 NamedNativeQuery는 이제 Keyword.java 엔티티에 있습니다.
// 따라서 여기서는 제거합니다.

@Repository
public interface KeywordRepository extends JpaRepository<Keyword, Integer> {

    // 엔티티에 정의된 NamedNativeQuery를 참조합니다.
    // nativeQuery = true는 여전히 필요합니다.
    @Query(name = "Keyword.findTopKeywordsStats", nativeQuery = true)
    List<KeywordDTO> findTopKeywordsStats();
	
}