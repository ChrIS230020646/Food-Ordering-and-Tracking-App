package com.mustudy.reactweb_backend.models;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "order_reviews")
@Data
public class OrderReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reviewid")
    private Integer reviewid;

    @Column(name = "orderid", nullable = false)
    private Integer orderid;

    @Column(name = "custid", nullable = false)
    private Integer custid;

    @Column(name = "rest_rating")
    private Integer restRating;

    @Column(name = "delivery_rating")
    private Integer deliveryRating;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_time", updatable = false)
    private Timestamp createdTime;

    @Column(name = "updated_time")
    private Timestamp updatedTime;
}

