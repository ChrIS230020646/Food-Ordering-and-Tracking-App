package com.mustudy.reactweb_backend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
    private String userType; // "customer", "restaurant", "delivery"
}