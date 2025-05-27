package com.smhrd.stock.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name="t_user")
public class User {

	@Id
	private String user_id;
	private String pw;
	private String nickname;
	private String email;
	private String joined_at;
	private int user_role;
}
