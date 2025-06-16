package com.smhrd.stock.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.stock.entity.Chatting;

@Repository
public interface ChattingRepository extends JpaRepository<Chatting, Integer> {

    List<Chatting> findByCroomIdxOrderByCreatedAtAsc(int croomIdx);

    List<Chatting> findByCroomIdxAndChatFileIsNotNullOrderByCreatedAtDesc(int croomIdx); 

}
