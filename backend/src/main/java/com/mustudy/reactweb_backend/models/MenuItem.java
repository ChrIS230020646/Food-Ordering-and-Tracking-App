package com.mustudy.reactweb_backend.models;

import java.math.BigDecimal;
import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

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
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "menu_items")
@Data
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_ID")
    @JsonProperty("item_ID")
    private Integer itemId;
    
    @Column(name = "restid")
    private Integer restid;
    
    @Column(name = "category", length = 100)
    private String category;
    
    @Column(name = "item_name", nullable = false, length = 100)
    @JsonProperty("item_name")
    private String itemName;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ItemStatus status = ItemStatus.active;
    
    @Column(name = "created_time", updatable = false)
    private Timestamp createdTime;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restid", insertable = false, updatable = false)
    @JsonIgnore
    private Restaurant restaurant;
    
    public enum ItemStatus {
        active, inactive, out_of_stock
    }
}

