package com.mustudy.reactweb_backend.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Integer orderid;
    private Integer custid;
    private Integer restid;
    private String restaurantName;
    private String shippingAddress;
    private Integer deliverManId;
    private String deliveryStaffName;
    private String deliveryStaffPhone;
    private Timestamp startDeliverTime;
    private Timestamp endDeliverTime;
    private String status;
    private String remark;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private Timestamp createdTime;
    private List<OrderItemDTO> items;
    private String paymentMethod;
    private String estimatedDeliveryTime;
}

