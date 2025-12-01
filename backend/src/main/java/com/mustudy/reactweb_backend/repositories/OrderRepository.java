package com.mustudy.reactweb_backend.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mustudy.reactweb_backend.models.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByCustid(Integer custid);
    List<Order> findByCustidOrderByCreatedTimeDesc(Integer custid);
    List<Order> findByRestid(Integer restid);
    List<Order> findByDeliverManId(Integer deliverManId);
    List<Order> findByStatus(Order.OrderStatus status);
    List<Order> findByCustidAndStatus(Integer custid, Order.OrderStatus status);
    List<Order> findByCustidAndStatusOrderByCreatedTimeDesc(Integer custid, Order.OrderStatus status);
    List<Order> findByStatusAndDeliverManIdIsNull(Order.OrderStatus status);
    Optional<Order> findByOrderid(Integer orderid);
}

