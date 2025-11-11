package com.mustudy.reactweb_backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String phone;
    private String password;
    private String userType; // "customer", "restaurant", "delivery"
    private String location;
    private String name;

    private String addressLine1;
    private String addressLine2;
    private String city;
    private String postalCode;
    private String country;
    
    // for restaurant
    private String restname;
    private String description;
    private String address;
    private String cuisine;
    
    // for deliveryStaff
    private String vehicleType;
    private String licenseNumber;
}