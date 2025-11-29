package com.mustudy.reactweb_backend.repositories;

import com.mustudy.reactweb_backend.models.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Integer> {

    List<Orders> findByCustid(Integer custid);

    List<Orders> findByRestid(Integer restid);

    List<Orders> findByDeliverManId(Integer deliverManId);

    List<Orders> findByStatus(Orders.OrderStatus status);

    List<Orders> findByCustidAndStatus(Integer custid, Orders.OrderStatus status);

    List<Orders> findByRestidAndStatus(Integer restid, Orders.OrderStatus status);

    List<Orders> findByDeliverManIdIsNullAndStatusIn(List<Orders.OrderStatus> statuses);
}