package com.smhrd.stock.entity;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name="t_chatting")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Chatting {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int chat_idx;
	
	@Column(name = "croom_idx", nullable = false)
    private int croomIdx;
	
	@Column(name = "chat_id", nullable = false)
	private String chat_id;
	
	@Lob
	@Column(name="chat_content")
	private String chat_content;	
	@Column(name="chat_emoticon")
	private String chat_emoticon;
	@Column(name="chat_file")
	private String chatFile;
	@Column(name="file_url")
	private String fileUrl;  // 파일 경로
	@Column(name = "created_at")
	private Timestamp createdAt;
	
	 // --- MessageType 필드 추가 (이전 답변에서 누락된 부분) ---
    @Column(name = "message_type", nullable = false)
    private String messageType; // 메시지 타입 (ENTER, QUIT, TALK)

    // MessageType 상수는 Chatting 클래스 내부에 두는 것이 맞습니다.
    // Enum으로 바꾸는 것이 더 좋지만, 현재 String 상수를 사용하시고 계시므로 그대로 유지했습니다.
    public static class MessageType {
        public static final String ENTER = "ENTER";
        public static final String QUIT = "QUIT";
        public static final String TALK = "TALK";
    }
}
