package com.mustudy.reactweb_backend.dto;

import lombok.Data;

@Data
public class CreateOrderRequest {
    private Integer custid;
    private Integer restid;
    private Integer addressid;
    private String shippingAddress;
    private String remark;
}