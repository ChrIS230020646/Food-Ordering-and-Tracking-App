package com.mustudy.reactweb_backend.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mustudy.reactweb_backend.dto.OrderReviewDTO;
import com.mustudy.reactweb_backend.dto.OrderReviewRequest;
import com.mustudy.reactweb_backend.dto.RestaurantRatingDTO;
import com.mustudy.reactweb_backend.models.Order;
import com.mustudy.reactweb_backend.models.OrderReview;
import com.mustudy.reactweb_backend.repositories.OrderRepository;
import com.mustudy.reactweb_backend.repositories.OrderReviewRepository;

@Service
public class ReviewService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderReviewRepository orderReviewRepository;

    @Autowired
    private JwtService jwtService;

    public OrderReviewDTO submitReview(String token, Integer orderId, OrderReviewRequest request) {
        Integer custid = getCustomerIdFromToken(token);
        if (custid == null) {
            throw new RuntimeException("Invalid token or not a customer token");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!custid.equals(order.getCustid())) {
            throw new RuntimeException("You can only review your own orders");
        }

        if (order.getStatus() != Order.OrderStatus.delivered) {
            throw new RuntimeException("Only delivered orders can be reviewed");
        }

        validateRating(request.getRestRating(), "Restaurant rating");
        validateRating(request.getDeliveryRating(), "Delivery rating");

        // Check if review already exists for this order
        Optional<OrderReview> existingReview = orderReviewRepository.findByOrderid(orderId);
        if (existingReview.isPresent()) {
            throw new RuntimeException("此訂單已經評分，無法修改");
        }

        // Create new review
        OrderReview review = new OrderReview();
        review.setOrderid(orderId);
        review.setCustid(custid);
        review.setRestRating(request.getRestRating());
        review.setDeliveryRating(request.getDeliveryRating());
        review.setComment(request.getComment());

        OrderReview saved = orderReviewRepository.save(review);
        return convertToDTO(saved);
    }

    public Optional<OrderReviewDTO> getReviewForOrder(String token, Integer orderId) {
        Integer custid = getCustomerIdFromToken(token);
        if (custid == null) {
            throw new RuntimeException("Invalid token or not a customer token");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!custid.equals(order.getCustid())) {
            throw new RuntimeException("You can only view reviews for your own orders");
        }

        return orderReviewRepository.findByOrderid(orderId)
                .map(this::convertToDTO);
    }

    private void validateRating(Integer rating, String label) {
        if (rating == null) {
            throw new RuntimeException(label + " is required");
        }
        if (rating < 1 || rating > 5) {
            throw new RuntimeException(label + " must be between 1 and 5");
        }
    }

    private Integer getCustomerIdFromToken(String token) {
        try {
            var claims = jwtService.parseToken(token);
            String role = claims.get("role", String.class);
            if ("customer".equals(role)) {
                String subject = claims.getSubject();
                return Integer.parseInt(subject);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private OrderReviewDTO convertToDTO(OrderReview review) {
        OrderReviewDTO dto = new OrderReviewDTO();
        dto.setReviewId(review.getReviewid());
        dto.setOrderId(review.getOrderid());
        dto.setRestRating(review.getRestRating());
        dto.setDeliveryRating(review.getDeliveryRating());
        dto.setComment(review.getComment());
        dto.setCreatedTime(review.getCreatedTime());
        dto.setUpdatedTime(review.getUpdatedTime());
        return dto;
    }

    /**
     * 計算餐廳的平均評分和評分數量
     */
    public RestaurantRatingDTO getRestaurantRating(Integer restid) {
        // 找出所有屬於該餐廳的訂單
        List<Order> orders = orderRepository.findByRestid(restid);
        
        if (orders.isEmpty()) {
            return new RestaurantRatingDTO(0.0, 0);
        }

        // 取得所有訂單ID
        List<Integer> orderIds = orders.stream()
                .map(Order::getOrderid)
                .toList();

        // 找出這些訂單的評分
        List<OrderReview> reviews = orderReviewRepository.findByOrderidIn(orderIds);

        if (reviews.isEmpty()) {
            return new RestaurantRatingDTO(0.0, 0);
        }

        // 計算平均評分
        double avgRating = reviews.stream()
                .filter(r -> r.getRestRating() != null)
                .mapToInt(OrderReview::getRestRating)
                .average()
                .orElse(0.0);

        int ratingCount = (int) reviews.stream()
                .filter(r -> r.getRestRating() != null)
                .count();

        return new RestaurantRatingDTO(
            Math.round(avgRating * 10.0) / 10.0,  // 四捨五入到小數點一位
            ratingCount
        );
    }
}

