package com.mustudy.reactweb_backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class OrderDetailResponse {
    private boolean success;
    private String message;
    private OrderResponse order;
    private List<Map<String, Object>> history;
}