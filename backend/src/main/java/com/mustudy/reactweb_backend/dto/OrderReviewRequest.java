package com.mustudy.reactweb_backend.dto;

import lombok.Data;

@Data
public class OrderReviewRequest {
    private Integer restRating;
    private Integer deliveryRating;
    private String comment;
}

