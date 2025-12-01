package com.mustudy.reactweb_backend.repositories;

import com.mustudy.reactweb_backend.models.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Customer> findByPhone(String phone);
}