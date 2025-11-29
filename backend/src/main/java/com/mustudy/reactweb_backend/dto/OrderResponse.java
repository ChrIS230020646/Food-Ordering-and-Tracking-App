package com.mustudy.reactweb_backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@Data
public class OrderResponse {
    private Integer orderId;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private String remark;
    private Timestamp createdTime;
    private String customerName;
    private String restaurantName;
    private String shippingAddress;
    private List<OrderItemResponse> orderItems;
}