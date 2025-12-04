package com.mustudy.reactweb_backend.dto;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class OrderReviewDTO {
    private Integer reviewId;
    private Integer orderId;
    private Integer restRating;
    private Integer deliveryRating;
    private String comment;
    private Timestamp createdTime;
    private Timestamp updatedTime;
}

