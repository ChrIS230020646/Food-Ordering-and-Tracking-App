package com.mustudy.reactweb_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mustudy.reactweb_backend.models.MenuItem;
import com.mustudy.reactweb_backend.repositories.MenuItemRepository;
import com.mustudy.reactweb_backend.services.JwtService;

import io.jsonwebtoken.Claims;

@RestController
@RequestMapping("/api/restaurant")
@CrossOrigin(origins = "http://localhost:5173")
public class RestaurantManagementController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private JwtService jwtService;

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

