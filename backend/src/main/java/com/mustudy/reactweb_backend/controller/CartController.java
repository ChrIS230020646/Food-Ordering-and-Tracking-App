package com.mustudy.reactweb_backend.controller;

import com.mustudy.reactweb_backend.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {
    
    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public String addToCart(@RequestParam String userId, @RequestBody CartService.CartItem cartItem) {
        return cartService.addToCart(userId, cartItem);
    }

    @GetMapping("/items")
    public List<CartService.CartItem> getCartItems(@RequestParam String userId) {
        return cartService.getCartItems(userId);
    }

    @DeleteMapping("/remove")
    public String removeFromCart(@RequestParam String userId, 
                                @RequestParam Integer itemId) {
        return cartService.removeFromCart(userId, itemId);
    }

    @DeleteMapping("/clear")
    public String clearCart(@RequestParam String userId) {
        return cartService.clearCart(userId);
    }

    @GetMapping("/total")
    public Double getCartTotal(@RequestParam String userId) {
        return cartService.getCartTotal(userId);
    }
}