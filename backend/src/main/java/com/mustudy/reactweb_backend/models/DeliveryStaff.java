package com.mustudy.reactweb_backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;

@Entity
@Table(name = "delivery_staff")
@Data
public class DeliveryStaff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "staff_id")
    private Integer staffId;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "phone", length = 20)
    private String phone;
    
    @Column(name = "email", length = 100)
    private String email;
    
    @Column(name = "pass_hash_1", nullable = false, length = 96)
    private String passHash1;
    
    @Column(name = "pass_hash_2", nullable = false, length = 64)
    private String passHash2;
    
    @Column(name = "icon")
    private String icon;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type")
    private VehicleType vehicleType = VehicleType.BIKE;
    
    @Column(name = "license_number", length = 50)
    private String licenseNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StaffStatus status = StaffStatus.ACTIVE;
    
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
    
    public enum VehicleType {
        BIKE, SCOOTER, CAR, VAN
    }
    
    public enum StaffStatus {
        ACTIVE, INACTIVE
    }
}