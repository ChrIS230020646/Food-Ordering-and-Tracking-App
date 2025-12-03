package com.mustudy.reactweb_backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    private Integer restid;
    private String restaurantName;
    private Integer addressid;
    private String shippingAddress;
    private String paymentMethod;
    private String remark;
    private List<OrderItemRequest> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        private Integer itemId;
        private String itemName;
        private String description;
        private Integer quantity;
        private Double price;
    }
}

