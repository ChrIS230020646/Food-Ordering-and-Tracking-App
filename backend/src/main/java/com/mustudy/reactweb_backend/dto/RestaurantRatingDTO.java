package com.mustudy.reactweb_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantRatingDTO {
    private Double avgRating;  // 平均評分 (1-5)
    private Integer ratingCount;  // 評分數量
}

