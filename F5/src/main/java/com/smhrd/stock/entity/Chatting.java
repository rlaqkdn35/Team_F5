package com.smhrd.stock.entity;

import java.sql.Timestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="t_chatting")
public class Chatting {

	@Id
	private int chat_idx;
	private int croom_idx;
	
	@Lob
	private String chat_content;
	
	private String chat_emoticon;
	private String chat_file;
	private Timestamp created_at;
}
