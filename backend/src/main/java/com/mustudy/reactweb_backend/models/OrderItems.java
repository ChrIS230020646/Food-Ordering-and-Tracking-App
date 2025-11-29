package com.mustudy.reactweb_backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
@Table(name = "order_items")
@Data
public class OrderItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderitemid;
    
    private Integer orderid;
    private Integer itemId;
    private Integer quantity = 1;
    private BigDecimal price;

    @Transient
    private String itemName;
    
    @Transient
    private String notes;

    private Timestamp createdTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderid", insertable = false, updatable = false)
    private Orders order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itemId", insertable = false, updatable = false)
    private MenuItems menuItem;
}