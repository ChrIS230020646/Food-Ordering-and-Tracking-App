package com.mustudy.reactweb_backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mustudy.reactweb_backend.models.OrderItem;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    List<OrderItem> findByOrderid(Integer orderid);
    void deleteByOrderid(Integer orderid);
}

