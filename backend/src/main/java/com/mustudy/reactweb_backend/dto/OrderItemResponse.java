package com.mustudy.reactweb_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemResponse {
    private Integer itemId;
    private String itemName;
    private Integer quantity;
    private BigDecimal price;
    private String notes;
}