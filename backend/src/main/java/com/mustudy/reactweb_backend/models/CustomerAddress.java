package com.mustudy.reactweb_backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;

@Entity
@Table(name = "customer_addresses")
@Data
public class CustomerAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "addressid")
    private Integer addressid;
    
    @Column(name = "custid", nullable = false)
    private Integer custid;
    
    @Column(name = "address_line1", nullable = false, length = 200)
    private String addressLine1;
    
    @Column(name = "address_line2", length = 200)
    private String addressLine2;
    
    @Column(name = "city", length = 100)
    private String city;
    
    @Column(name = "postal_code", length = 20)
    private String postalCode;
    
    @Column(name = "country", length = 50)
    private String country = "Hong Kong";
    
    @Column(name = "is_default")
    private Boolean isDefault = true;
    
    @Column(name = "change_log", columnDefinition = "TEXT")
    private String changeLog;
    
    @Column(name = "created_time", updatable = false)
    private Timestamp createdTime;
    
    @Column(name = "updated_time")
    private Timestamp updatedTime;
    
    @Column(name = "deleted_time")
    private Timestamp deletedTime;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custid", insertable = false, updatable = false)
    private Customer customer;
}