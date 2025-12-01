package com.mustudy.reactweb_backend.repositories;

import com.mustudy.reactweb_backend.models.DeliveryStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DeliveryStaffRepository extends JpaRepository<DeliveryStaff, Integer> {
    Optional<DeliveryStaff> findByEmail(String email);
    boolean existsByEmail(String email);
}