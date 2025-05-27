package com.smhrd.stock.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.entity.Member;

@Repository
public interface MemberRepository extends JpaRepository<Member, String>{

}
