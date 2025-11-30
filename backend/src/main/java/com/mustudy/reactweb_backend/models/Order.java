package com.mustudy.reactweb_backend.models;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "orderid")
    private Integer orderid;
    
    @Column(name = "custid")
    private Integer custid;
    
    @Column(name = "restid")
    private Integer restid;
    
    @Column(name = "addressid")
    private Integer addressid;
    
    @Column(name = "shipping_address", length = 300)
    private String shippingAddress;
    
    @Column(name = "deliver_man_ID")
    private Integer deliverManId;
    
    @Column(name = "start_deliver_time")
    private Timestamp startDeliverTime;
    
    @Column(name = "end_deliver_time")
    private Timestamp endDeliverTime;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private OrderStatus status = OrderStatus.pending;
    
    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;
    
    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @Column(name = "change_log", columnDefinition = "TEXT")
    private String changeLog;
    
    @Column(name = "created_time", updatable = false)
    private Timestamp createdTime;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custid", insertable = false, updatable = false)
    private Customer customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restid", insertable = false, updatable = false)
    private Restaurant restaurant;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deliver_man_ID", insertable = false, updatable = false)
    private DeliveryStaff deliveryStaff;
    
    public enum OrderStatus {
        pending, preparing, ready, out_for_delivery, delivering, delivered, cancelled
    }
}

