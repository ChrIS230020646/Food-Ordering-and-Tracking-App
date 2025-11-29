package com.mustudy.reactweb_backend.controller;

import com.mustudy.reactweb_backend.dto.MenuItemResponse;
import com.mustudy.reactweb_backend.models.MenuItems;
import com.mustudy.reactweb_backend.services.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "http://localhost:5173")
public class MenuController {
    
    @Autowired
    private MenuService menuService;

    @GetMapping("/restaurant/{restid}")
    public ResponseEntity<?> getMenuByRestaurant(@PathVariable Integer restid) {
        try {
            List<MenuItemResponse> menuItems = menuService.getMenuByRestaurantDTO(restid);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "menuItems", menuItems
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/category/{category}")
    public List<MenuItems> getMenuByCategory(@PathVariable String category) {
        return menuService.getMenuByCategory(category);
    }

    @GetMapping("/restaurant/{restid}/category/{category}")
    public List<MenuItems> getMenuByRestaurantAndCategory(
            @PathVariable Integer restid, 
            @PathVariable String category) {
        return menuService.getMenuByRestaurantAndCategory(restid, category);
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<?> getMenuItem(@PathVariable Integer itemId) {
        try {
            MenuItemResponse menuItem = menuService.getMenuItemDTO(itemId);
            if (menuItem == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "菜单项不存在"
                ));
            }
            return ResponseEntity.ok(Map.of(
                "success", true,
                "menuItem", menuItem
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}