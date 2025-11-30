package com.mustudy.reactweb_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mustudy.reactweb_backend.dto.CreateOrderRequest;
import com.mustudy.reactweb_backend.dto.OrderDTO;
import com.mustudy.reactweb_backend.services.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * Create a new order (Customer only)
     */
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody CreateOrderRequest request) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            OrderDTO order = orderService.createOrder(token, request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating order: " + e.getMessage());
        }
    }

    /**
     * Get customer's orders (Customer only)
     */
    @GetMapping("/customer")
    public ResponseEntity<?> getCustomerOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            List<OrderDTO> orders = orderService.getCustomerOrders(token);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving orders: " + e.getMessage());
        }
    }

    /**
     * Get pending orders for delivery staff (Delivery Staff only)
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            List<OrderDTO> orders = orderService.getPendingOrdersForDelivery();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving pending orders: " + e.getMessage());
        }
    }

    /**
     * Get delivery staff's assigned orders (Delivery Staff only)
     */
    @GetMapping("/delivery")
    public ResponseEntity<?> getDeliveryStaffOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            List<OrderDTO> orders = orderService.getDeliveryStaffOrders(token);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving delivery orders: " + e.getMessage());
        }
    }

    /**
     * Get order history for current customer (Customer only)
     * Returns only delivered orders
     */
    @GetMapping("/history")
    public ResponseEntity<?> getOrderHistory(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            List<OrderDTO> orders = orderService.getOrderHistory(token);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving order history: " + e.getMessage());
        }
    }

    /**
     * Accept an order (Delivery Staff only)
     */
    @PostMapping("/{orderId}/accept")
    public ResponseEntity<?> acceptOrder(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer orderId) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            OrderDTO order = orderService.acceptOrder(token, orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error accepting order: " + e.getMessage());
        }
    }

    /**
     * Update order status
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody UpdateStatusRequest request) {
        try {
            OrderDTO order = orderService.updateOrderStatus(orderId, request.getStatus());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating order status: " + e.getMessage());
        }
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class UpdateStatusRequest {
        private String status;
    }
}

