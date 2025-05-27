package com.smhrd.stock.entity;

import java.sql.Timestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="t_comment")
public class Comment {

	@Id
	private int cmt_idx;
	private int forum_idx;
	private String cmt_content;
	private Timestamp created_at;
	private String user_id;
}
