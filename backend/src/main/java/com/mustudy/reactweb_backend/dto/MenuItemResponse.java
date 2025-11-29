package com.mustudy.reactweb_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MenuItemResponse {
    private Integer itemId;
    private String itemName;
    private String description;
    private BigDecimal price;
    private String category;
    private String status;
}