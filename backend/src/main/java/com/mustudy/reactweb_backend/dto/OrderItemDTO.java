package com.mustudy.reactweb_backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private Integer itemId;
    private String itemName;
    private String description;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
}

