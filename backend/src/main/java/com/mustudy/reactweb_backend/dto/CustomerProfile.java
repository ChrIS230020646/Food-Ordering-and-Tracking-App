package com.mustudy.reactweb_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
public class CustomerProfile {
    private Integer custid;
    private String custname;
    private String phone;
    private String email;
    private String icon;
    private Boolean isValidate;
    private Timestamp latestLoginDate;
}

