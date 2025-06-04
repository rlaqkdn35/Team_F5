package com.smhrd.stock.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.stock.entity.ForumRecos;
import com.smhrd.stock.entity.StockForum;
import com.smhrd.stock.repository.ForumRecoRepository;
import com.smhrd.stock.repository.ForumRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ForumRecosService {

    private final ForumRecoRepository recoRepository;
    private final ForumRepository forumRepository;

    /**
     * 추천 상태를 토글함.
     * 추천이 새로 추가되면 true, 기존 추천이 삭제되면 false 반환
     * 추천 토글 시 t_stock_forum 테이블의 추천수(forum_recos) 컬럼도 동기화됨
     */
    @Transactional
    public boolean toggleRecommend(String userId, Integer forumIdx) {
        StockForum forum = forumRepository.findById(forumIdx)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        return recoRepository.findByUserIdAndForumIdx(userId, forumIdx)
                .map(existing -> {
                    // 추천 기록이 있다면 삭제 (추천 취소)
                    recoRepository.delete(existing);
                    // 추천수 감소 처리 (최소 0 이하로 내려가지 않도록)
                    int newCount = forum.getForum_recos() == null ? 0 : forum.getForum_recos() - 1;
                    forum.setForum_recos(Math.max(newCount, 0));
                    forumRepository.save(forum);
                    return false;
                })
                .orElseGet(() -> {
                    // 추천 기록이 없다면 추가
                    ForumRecos newReco = ForumRecos.builder()
                            .userId(userId)
                            .forumIdx(forumIdx)
                            .recosCnt(1) // 항상 1로 설정
                            .build();
                    recoRepository.save(newReco);
                    // 추천수 증가 처리
                    int newCount = forum.getForum_recos() == null ? 1 : forum.getForum_recos() + 1;
                    forum.setForum_recos(newCount);
                    forumRepository.save(forum);
                    return true;
                });
    }

    /**
     * 특정 사용자가 특정 게시글에 추천했는지 여부 조회
     */
    public boolean hasUserRecommended(String userId, Integer forumIdx) {
        return recoRepository.findByUserIdAndForumIdx(userId, forumIdx).isPresent();
    }
}
