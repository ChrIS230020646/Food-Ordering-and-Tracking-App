package com.mustudy.reactweb_backend.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mustudy.reactweb_backend.models.OrderReview;

@Repository
public interface OrderReviewRepository extends JpaRepository<OrderReview, Integer> {
    Optional<OrderReview> findByOrderid(Integer orderid);
    List<OrderReview> findByOrderidIn(List<Integer> orderids);
}

