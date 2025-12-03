package com.mustudy.reactweb_backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;

@Entity
@Table(name = "customer")
@Data
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "custid")
    private Integer custid;
    
    @Column(name = "custname", nullable = false, length = 100)
    private String custname;
    
    @Column(length = 20)
    private String phone;
    
    @Column(length = 100)
    private String email;
    
    @Column(name = "pass_hash_1", nullable = false, length = 96)
    private String passHash1;
    
    @Column(name = "pass_hash_2", nullable = false, length = 64)
    private String passHash2;
    
    @Column(name = "icon")
    private String icon;

    @Column(name = "isValidate")
    private Boolean isValidate = true;

    @Column(name = "latestLoginDate")
    private Timestamp latestLoginDate;

    @Column(name = "change_log", columnDefinition = "TEXT")
    private String changeLog;
    
    @Column(name = "created_time", updatable = false)
    private Timestamp createdTime;
    
    @Column(name = "updated_time")
    private Timestamp updatedTime;

    @Column(name = "deleted_time")
    private Timestamp deletedTime;
}