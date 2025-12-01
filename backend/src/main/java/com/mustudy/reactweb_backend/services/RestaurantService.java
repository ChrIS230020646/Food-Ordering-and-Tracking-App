package com.mustudy.reactweb_backend.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mustudy.reactweb_backend.dto.RestaurantProfile;
import com.mustudy.reactweb_backend.models.Restaurant;
import com.mustudy.reactweb_backend.repositories.RestaurantRepository;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    /**
     * Get all restaurants
     */
    public List<RestaurantProfile> getAllRestaurants() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        System.out.println("RestaurantService.getAllRestaurants() - Total restaurants in DB: " + restaurants.size());
        
        if (restaurants.isEmpty()) {
            System.out.println("WARNING: No restaurants found in database! Please run Food_Order_3.sql to initialize data.");
        } else {
            // Log details of each restaurant
            for (Restaurant r : restaurants) {
                System.out.println("Restaurant: ID=" + r.getRestid() + ", Name=" + r.getRestname() + 
                    ", isValidate=" + r.getIsValidate());
            }
        }
        
        // Temporarily show all restaurants for debugging
        // TODO: Re-enable isValidate filter after database is initialized
        List<RestaurantProfile> validRestaurants = restaurants.stream()
                // .filter(r -> Boolean.TRUE.equals(r.getIsValidate())) // Temporarily disabled
                .map(this::convertToProfile)
                .collect(Collectors.toList());
        
        System.out.println("RestaurantService.getAllRestaurants() - Valid restaurants: " + validRestaurants.size());
        return validRestaurants;
    }
    
    /**
     * Debug method: Get all restaurants without filtering
     */
    public List<Restaurant> getAllRestaurantsRaw() {
        return restaurantRepository.findAll();
    }

    /**
     * Get restaurant by ID
     */
    public RestaurantProfile getRestaurantById(Integer restid) {
        Restaurant restaurant = restaurantRepository.findById(restid)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        
        if (Boolean.FALSE.equals(restaurant.getIsValidate())) {
            throw new RuntimeException("Restaurant is not available");
        }
        
        return convertToProfile(restaurant);
    }

    /**
     * Get restaurant by name
     */
    public RestaurantProfile getRestaurantByName(String restname) {
        Restaurant restaurant = restaurantRepository.findByRestname(restname)
                .orElseThrow(() -> new RuntimeException("Restaurant not found: " + restname));
        
        if (Boolean.FALSE.equals(restaurant.getIsValidate())) {
            throw new RuntimeException("Restaurant is not available");
        }
        
        return convertToProfile(restaurant);
    }

    private RestaurantProfile convertToProfile(Restaurant restaurant) {
        return new RestaurantProfile(
            restaurant.getRestid(),
            restaurant.getRestname(),
            restaurant.getDescription(),
            restaurant.getAddress(),
            restaurant.getIcon(),
            restaurant.getIsValidate()
        );
    }
}

