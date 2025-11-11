package com.mustudy.reactweb_backend.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private boolean success;
    private String message;
    private Object user;
    
    public LoginResponse(boolean success, String message, Object user) {
        this.success = success;
        this.message = message;
        this.user = user;
    }
    
    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}