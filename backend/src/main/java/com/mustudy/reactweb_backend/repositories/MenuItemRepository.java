package com.mustudy.reactweb_backend.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mustudy.reactweb_backend.models.MenuItem;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Integer> {
    List<MenuItem> findByRestid(Integer restid);
    List<MenuItem> findByRestidAndStatus(Integer restid, MenuItem.ItemStatus status);
    Optional<MenuItem> findByItemId(Integer itemId);
}

