package com.mustudy.reactweb_backend.repositories;

import com.mustudy.reactweb_backend.models.MenuItems;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuItemsRepository extends JpaRepository<MenuItems, Integer> {
    
    // 呢度係根據餐廳嘅ID嚟搵menu items
    List<MenuItems> findByRestid(Integer restid);
    
    // 根據餐廳ID和狀態查找菜單項（例如只查找active的菜單）
    List<MenuItems> findByRestidAndStatus(Integer restid, MenuItems.ItemStatus status);
    
    // 根據分類查找菜單項（如"Dim Sum", "Main Course"等）
    List<MenuItems> findByCategory(String category);
    
    // 根據餐廳ID和分類查找
    List<MenuItems> findByRestidAndCategory(Integer restid, String category);
}