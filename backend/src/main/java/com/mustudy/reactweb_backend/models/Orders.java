package com.mustudy.reactweb_backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
@Table(name = "orders")
@Data
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderid;
    
    private Integer custid;
    private Integer restid;
    private Integer addressid;
    
    private String shippingAddress; 
    private Integer deliverManId;
    
    private Timestamp startDeliverTime;
    private Timestamp endDeliverTime;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.pending;
    
    private String remark;
    private BigDecimal totalAmount = BigDecimal.ZERO;
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    private String changeLog;
    private Timestamp createdTime;
    
    public enum OrderStatus {
        pending, preparing, ready, out_for_delivery, delivered, cancelled
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custid", insertable = false, updatable = false)
    private Customer customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restid", insertable = false, updatable = false)
    private Restaurant restaurant;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "addressid", insertable = false, updatable = false)
    private CustomerAddress customerAddress;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deliverManId", insertable = false, updatable = false)
    private DeliveryStaff deliveryStaff;
}