package com.mustudy.reactweb_backend.controller;

import com.mustudy.reactweb_backend.models.Orders;
import com.mustudy.reactweb_backend.services.OrderService;
import com.mustudy.reactweb_backend.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<?> createOrderFromCart(@RequestBody CreateOrderRequest request) {
        try {
            OrderResponse order = orderService.createOrderFromCartDTO(request);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order created successfully",
                "order", order
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // get orders by customer
    @GetMapping("/customer/{custid}")
    public ResponseEntity<?> getOrdersByCustomer(@PathVariable Integer custid) {
        try {
            List<OrderResponse> orders = orderService.getOrdersByCustomerDTO(custid);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "orders", orders
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // get order detail by order id
    @GetMapping("/{orderid}")
    public ResponseEntity<?> getOrderDetail(@PathVariable Integer orderid) {
        try {
            OrderDetailResponse response = orderService.getOrderDetailDTO(orderid);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{orderid}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Integer orderid,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Orders.OrderStatus orderStatus = Orders.OrderStatus.valueOf(status);

            Orders order = orderService.updateOrderStatus(orderid, orderStatus);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order status updated successfully",
                    "order", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    @PutMapping("/{orderid}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Integer orderid) {
        try {
            Orders order = orderService.cancelOrder(orderid);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order cancelled successfully",
                    "order", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    // 獲取訂單狀態歷史記錄
    @GetMapping("/{orderid}/history")
    public ResponseEntity<?> getOrderStatusHistory(@PathVariable Integer orderid) {
        try {
            List<Map<String, Object>> history = orderService.getOrderStatusHistory(orderid);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "history", history));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    // 獲取可接訂單
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableOrders() {
        try {
            List<Orders> availableOrders = orderService.getAvailableOrders();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "orders", availableOrders));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    // 外賣員接單
    @PutMapping("/{orderid}/accept")
    public ResponseEntity<?> acceptOrder(
            @PathVariable Integer orderid,
            @RequestBody Map<String, Integer> request) {
        try {
            Integer deliveryManId = request.get("deliveryManId");
            Orders order = orderService.acceptOrder(orderid, deliveryManId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "接單成功",
                    "order", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    // 外賣員完成外送
    @PutMapping("/{orderid}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Integer orderid) {
        try {
            Orders order = orderService.completeOrder(orderid);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "訂單已完成",
                    "order", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    // 餐廳標記訂單為準備完成
    @PutMapping("/{orderid}/ready")
    public ResponseEntity<?> markOrderAsReady(@PathVariable Integer orderid) {
        try {
            Orders order = orderService.markOrderAsReady(orderid);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "訂單已標記為準備完成",
                    "order", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    // 獲取外賣員的訂單列標
    @GetMapping("/delivery/{deliveryManId}")
    public ResponseEntity<?> getOrdersByDeliveryMan(@PathVariable Integer deliveryManId) {
        try {
            List<Orders> orders = orderService.getOrdersByDeliveryMan(deliveryManId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "orders", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }
}