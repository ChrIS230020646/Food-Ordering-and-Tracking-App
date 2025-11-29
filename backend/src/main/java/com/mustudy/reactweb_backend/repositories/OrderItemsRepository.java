package com.mustudy.reactweb_backend.repositories;

import com.mustudy.reactweb_backend.models.OrderItems;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemsRepository extends JpaRepository<OrderItems, Integer> {

    List<OrderItems> findByOrderid(Integer orderid);

    List<OrderItems> findByOrderidIn(List<Integer> orderIds);

    List<OrderItems> findByItemId(Integer itemId);

    OrderItems findByOrderidAndItemId(Integer orderid, Integer itemId);
}