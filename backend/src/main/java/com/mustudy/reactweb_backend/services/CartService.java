package com.mustudy.reactweb_backend.services;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CartService {
    // 内部类，用于存储购物车项
    public static class CartItem {
        private Integer itemId;
        private String itemName;
        private Integer quantity;
        private BigDecimal price;
        private String notes;
        
        // 构造器、getter、setter
        public CartItem() {}
        
        public CartItem(Integer itemId, String itemName, Integer quantity, BigDecimal price, String notes) {
            this.itemId = itemId;
            this.itemName = itemName;
            this.quantity = quantity;
            this.price = price;
            this.notes = notes;
        }
        
        // getter 和 setter 方法
        public Integer getItemId() { return itemId; }
        public void setItemId(Integer itemId) { this.itemId = itemId; }
        
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        
        // 计算总价的方法
        public BigDecimal getTotalPrice() {
            return price.multiply(BigDecimal.valueOf(quantity));
        }
    }
    
    // 使用内存存储购物车
    private final ConcurrentHashMap<String, List<CartItem>> userCarts = new ConcurrentHashMap<>();
    
    /**
     * 添加商品到购物车
     */
    public String addToCart(String userId, CartItem cartItem) {
        List<CartItem> cart = userCarts.computeIfAbsent(userId, k -> new ArrayList<>());
        
        // 检查是否已经存在相同商品
        for (CartItem item : cart) {
            if (item.getItemId().equals(cartItem.getItemId())) {
                item.setQuantity(item.getQuantity() + cartItem.getQuantity());
                return "商品数量已更新";
            }
        }
        
        cart.add(cartItem);
        return "商品已添加到购物车";
    }
    
    /**
     * 获取用户的购物车商品列表
     */
    public List<CartItem> getCartItems(String userId) {
        return userCarts.getOrDefault(userId, new ArrayList<>());
    }
    
    /**
     * 从购物车移除商品
     */
    public String removeFromCart(String userId, Integer itemId) {
        List<CartItem> cart = userCarts.get(userId);
        if (cart != null) {
            boolean removed = cart.removeIf(item -> item.getItemId().equals(itemId));
            return removed ? "商品已从购物车移除" : "商品不存在于购物车中";
        }
        return "购物车为空";
    }
    
    /**
     * 清空用户购物车
     */
    public String clearCart(String userId) {
        userCarts.remove(userId);
        return "购物车已清空";
    }
    
    /**
     * 计算购物车总价
     */
    public Double getCartTotal(String userId) {
        List<CartItem> cart = userCarts.get(userId);
        if (cart == null || cart.isEmpty()) {
            return 0.0;
        }
        
        return cart.stream()
                .mapToDouble(item -> item.getTotalPrice().doubleValue())
                .sum();
    }
}