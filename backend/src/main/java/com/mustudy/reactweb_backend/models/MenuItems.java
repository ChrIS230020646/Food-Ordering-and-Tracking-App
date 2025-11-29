package com.mustudy.reactweb_backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
@Table(name = "menu_items")
@Data
public class MenuItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer itemId;
    
    private Integer restid;
    private String category;
    private String itemName;
    private String description;
    private BigDecimal price;
    
    @Enumerated(EnumType.STRING)
    private ItemStatus status = ItemStatus.active;
    
    private Timestamp createdTime;

    // 這個是關聯餐廳，暫時未用到
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restid", insertable = false, updatable = false)
    private Restaurant restaurant;
    
    public enum ItemStatus {
        active, inactive, out_of_stock; // active (活躍) inactive (停用) out_of_stock (缺貨)
    }
}