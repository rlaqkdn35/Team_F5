package com.smhrd.stock.repository;

import com.smhrd.stock.entity.NewsForCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsForCompanyRepository extends JpaRepository<NewsForCompany, Integer> {

    // newsIdx를 기준으로 연관된 회사-뉴스 정보 목록을 조회
    List<NewsForCompany> findByNewsIdx(int newsIdx);
}