package com.mustudy.reactweb_backend.services;

import com.mustudy.reactweb_backend.models.MenuItems;
import com.mustudy.reactweb_backend.repositories.MenuItemsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.mustudy.reactweb_backend.dto.MenuItemResponse;
import java.util.stream.Collectors;

@Service
public class MenuService {
    
    @Autowired
    private MenuItemsRepository menuItemsRepository;

    public List<MenuItems> getMenuByRestaurant(Integer restid) {
        return menuItemsRepository.findByRestid(restid);
    }

    public List<MenuItems> getActiveMenuByRestaurant(Integer restid) {
        return menuItemsRepository.findByRestidAndStatus(restid, MenuItems.ItemStatus.active);
    }

    public List<MenuItems> getMenuByCategory(String category) {
        return menuItemsRepository.findByCategory(category);
    }

    public List<MenuItems> getMenuByRestaurantAndCategory(Integer restid, String category) {
        return menuItemsRepository.findByRestidAndCategory(restid, category);
    }

    public MenuItems getMenuItem(Integer itemId) {
        return menuItemsRepository.findById(itemId).orElse(null);
    }

    private MenuItemResponse convertToMenuItemResponse(MenuItems menuItem) {
        MenuItemResponse response = new MenuItemResponse();
        response.setItemId(menuItem.getItemId());
        response.setItemName(menuItem.getItemName());
        response.setDescription(menuItem.getDescription());
        response.setPrice(menuItem.getPrice());
        response.setCategory(menuItem.getCategory());
        response.setStatus(menuItem.getStatus().name());
        return response;
    }

    public List<MenuItemResponse> getMenuByRestaurantDTO(Integer restid) {
        List<MenuItems> menuItems = getActiveMenuByRestaurant(restid);
        return menuItems.stream()
                .map(this::convertToMenuItemResponse)
                .collect(Collectors.toList());
    }

    public MenuItemResponse getMenuItemDTO(Integer itemId) {
        MenuItems menuItem = getMenuItem(itemId);
        if (menuItem == null) {
            return null;
        }
        return convertToMenuItemResponse(menuItem);
    }
}