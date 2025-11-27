package com.mustudy.reactweb_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RestaurantProfile {
    private Integer restid;
    private String restname;
    private String description;
    private String address;
    private String icon;
    private Boolean isValidate;
}

