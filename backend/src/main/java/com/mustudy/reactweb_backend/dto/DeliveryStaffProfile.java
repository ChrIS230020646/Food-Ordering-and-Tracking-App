package com.mustudy.reactweb_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DeliveryStaffProfile {
    private Integer staffId;
    private String name;
    private String email;
    private String phone;
    private String icon;
    private Boolean isValidate;
}

