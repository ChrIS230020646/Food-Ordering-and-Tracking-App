package com.mustudy.reactweb_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mustudy.reactweb_backend.dto.OrderDTO;
import com.mustudy.reactweb_backend.models.MenuItem;
import com.mustudy.reactweb_backend.repositories.MenuItemRepository;
import com.mustudy.reactweb_backend.services.JwtService;
import com.mustudy.reactweb_backend.services.OrderService;

import io.jsonwebtoken.Claims;

@RestController
@RequestMapping("/api/restaurant")
@CrossOrigin(origins = "http://localhost:5173")
public class RestaurantManagementController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private OrderService orderService;

    /**
     * Get menu items for current restaurant (authenticated)
     * Requires Authorization header with Bearer token
     */
    @GetMapping("/menu")
    public ResponseEntity<?> getMyMenuItems(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Extract token from Authorization header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix

            // Get restaurant ID from token
            Integer restid = getRestaurantIdFromToken(token);
            if (restid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a restaurant token");
            }

            // Find menu items for this restaurant
            List<MenuItem> menuItems = menuItemRepository.findByRestid(restid);
            
            System.out.println("GET /api/restaurant/menu - Restaurant ID: " + restid + ", Found " + menuItems.size() + " menu items");

            return ResponseEntity.ok(menuItems);
        } catch (Exception e) {
            System.err.println("GET /api/restaurant/menu - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving menu items: " + e.getMessage());
        }
    }

    /**
     * Add a new menu item for current restaurant
     */
    @PostMapping("/menu")
    public ResponseEntity<?> addMenuItem(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody MenuItem menuItem) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            Integer restid = getRestaurantIdFromToken(token);
            if (restid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a restaurant token");
            }

            // Force menu item to belong to current restaurant
            menuItem.setRestid(restid);

            // Ensure default status if not provided
            if (menuItem.getStatus() == null) {
                menuItem.setStatus(MenuItem.ItemStatus.active);
            }

            MenuItem saved = menuItemRepository.save(menuItem);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            System.err.println("POST /api/restaurant/menu - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating menu item: " + e.getMessage());
        }
    }

    /**
     * Update a menu item (must belong to current restaurant)
     */
    @PutMapping("/menu/{itemId}")
    public ResponseEntity<?> updateMenuItem(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer itemId,
            @RequestBody MenuItem updatedItem) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            Integer restid = getRestaurantIdFromToken(token);
            if (restid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a restaurant token");
            }

            MenuItem existing = menuItemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Menu item not found"));

            // Ensure the item belongs to this restaurant
            if (existing.getRestid() == null || !existing.getRestid().equals(restid)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only update your own menu items");
            }

            existing.setItemName(updatedItem.getItemName());
            existing.setDescription(updatedItem.getDescription());
            existing.setPrice(updatedItem.getPrice());
            if (updatedItem.getStatus() != null) {
                existing.setStatus(updatedItem.getStatus());
            }

            MenuItem saved = menuItemRepository.save(existing);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("PUT /api/restaurant/menu/" + itemId + " - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating menu item: " + e.getMessage());
        }
    }

    /**
     * Delete a menu item (must belong to current restaurant)
     */
    @DeleteMapping("/menu/{itemId}")
    public ResponseEntity<?> deleteMenuItem(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer itemId) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            Integer restid = getRestaurantIdFromToken(token);
            if (restid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a restaurant token");
            }

            MenuItem existing = menuItemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Menu item not found"));

            if (existing.getRestid() == null || !existing.getRestid().equals(restid)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only delete your own menu items");
            }

            menuItemRepository.delete(existing);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("DELETE /api/restaurant/menu/" + itemId + " - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting menu item: " + e.getMessage());
        }
    }

    /**
     * Get orders for current restaurant (authenticated)
     * Requires Authorization header with Bearer token
     */
    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrders(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);

            // Validate restaurant token and get orders using service
            Integer restid = getRestaurantIdFromToken(token);
            if (restid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a restaurant token");
            }

            List<OrderDTO> orders = orderService.getRestaurantOrders(token);
            System.out.println("GET /api/restaurant/orders - Restaurant ID: " + restid + ", Found " + orders.size() + " orders");

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("GET /api/restaurant/orders - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving restaurant orders: " + e.getMessage());
        }
    }

    /**
     * Update order status by restaurant.
     * Restaurant 只允許：確認訂單(preparing)、取消訂單(cancelled)
     */
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateRestaurantOrderStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer orderId,
            @RequestBody java.util.Map<String, String> body) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            Integer restid = getRestaurantIdFromToken(token);
            if (restid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a restaurant token");
            }

            String status = body.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().body("Missing status");
            }

            // 僅允許餐廳設定為 preparing (確認) 或 cancelled (取消)
            if (!"preparing".equals(status) && !"cancelled".equals(status)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Restaurant can only set status to 'preparing' or 'cancelled'");
            }

            // 簡單檢查訂單是否屬於該餐廳
            var orderOpt = orderService.getRestaurantOrders(token).stream()
                    .filter(o -> o.getOrderid().equals(orderId))
                    .findFirst();
            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only update orders for your restaurant");
            }

            var updated = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.err.println("PUT /api/restaurant/orders/" + orderId + "/status - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating restaurant order status: " + e.getMessage());
        }
    }

    /**
     * Get restaurant ID from token
     */
    private Integer getRestaurantIdFromToken(String token) {
        try {
            Claims claims = jwtService.parseToken(token);
            String role = claims.get("role", String.class);
            if ("restaurant".equals(role)) {
                String subject = claims.getSubject();
                return Integer.parseInt(subject);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}

