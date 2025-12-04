package com.mustudy.reactweb_backend.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private boolean success;
    private String message;
    private Object user;
    private String token;
    private Long expiresAt;
    
    public LoginResponse(boolean success, String message, Object user, String token, Long expiresAt) {
        this.success = success;
        this.message = message;
        this.user = user;
        this.token = token;
        this.expiresAt = expiresAt;
    }
    
    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}