package com.mustudy.reactweb_backend.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mustudy.reactweb_backend.models.Restaurant;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Integer> {
    Optional<Restaurant> findByRestname(String restname);
    Optional<Restaurant> findByEmail(String email);
    boolean existsByEmail(String email);
}