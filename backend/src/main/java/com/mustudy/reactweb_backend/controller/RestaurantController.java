package com.mustudy.reactweb_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mustudy.reactweb_backend.dto.RestaurantProfile;
import com.mustudy.reactweb_backend.models.MenuItem;
import com.mustudy.reactweb_backend.repositories.MenuItemRepository;
import com.mustudy.reactweb_backend.services.RestaurantService;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "http://localhost:5173")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private MenuItemRepository menuItemRepository;

    /**
     * Get all restaurants
     */
    @GetMapping
    public ResponseEntity<?> getAllRestaurants() {
        try {
            System.out.println("GET /api/restaurants - Request received");
            List<RestaurantProfile> restaurants = restaurantService.getAllRestaurants();
            System.out.println("GET /api/restaurants - Found " + restaurants.size() + " restaurants");
            
            // If no restaurants found, return debug info
            if (restaurants.isEmpty()) {
                System.out.println("WARNING: No restaurants found! Checking database...");
                // Return empty array but log the issue
                return ResponseEntity.ok(restaurants);
            }
            
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            System.err.println("GET /api/restaurants - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving restaurants: " + e.getMessage());
        }
    }
    
    /**
     * Debug endpoint: Get all restaurants including invalid ones
     */
    @GetMapping("/debug/all")
    public ResponseEntity<?> getAllRestaurantsDebug() {
        try {
            System.out.println("GET /api/restaurants/debug/all - Debug request received");
            List<com.mustudy.reactweb_backend.models.Restaurant> allRestaurants = 
                restaurantService.getAllRestaurantsRaw();
            System.out.println("GET /api/restaurants/debug/all - Total restaurants (including invalid): " + allRestaurants.size());
            return ResponseEntity.ok(allRestaurants);
        } catch (Exception e) {
            System.err.println("GET /api/restaurants/debug/all - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving restaurants: " + e.getMessage());
        }
    }

    /**
     * Get restaurant by ID
     */
    @GetMapping("/{restid}")
    public ResponseEntity<?> getRestaurantById(@PathVariable Integer restid) {
        try {
            RestaurantProfile restaurant = restaurantService.getRestaurantById(restid);
            return ResponseEntity.ok(restaurant);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving restaurant: " + e.getMessage());
        }
    }

    /**
     * Get restaurant by name
     */
    @GetMapping("/name/{restname}")
    public ResponseEntity<?> getRestaurantByName(@PathVariable String restname) {
        try {
            RestaurantProfile restaurant = restaurantService.getRestaurantByName(restname);
            return ResponseEntity.ok(restaurant);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving restaurant: " + e.getMessage());
        }
    }

    /**
     * Get menu items for a restaurant
     */
    @GetMapping("/{restid}/menu")
    public ResponseEntity<?> getMenuItems(@PathVariable Integer restid) {
        try {
            System.out.println("GET /api/restaurants/" + restid + "/menu - Request received");
            List<MenuItem> menuItems = menuItemRepository.findByRestid(restid);
            System.out.println("GET /api/restaurants/" + restid + "/menu - Found " + menuItems.size() + " menu items");
            
            if (menuItems.isEmpty()) {
                System.out.println("WARNING: No menu items found for restaurant ID: " + restid);
            }
            
            return ResponseEntity.ok(menuItems);
        } catch (Exception e) {
            System.err.println("GET /api/restaurants/" + restid + "/menu - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving menu items: " + e.getMessage());
        }
    }
}

