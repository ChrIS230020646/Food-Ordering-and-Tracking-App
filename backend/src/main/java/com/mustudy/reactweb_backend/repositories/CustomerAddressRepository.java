package com.mustudy.reactweb_backend.repositories;

import com.mustudy.reactweb_backend.models.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Integer> {
    List<CustomerAddress> findByCustid(Integer custid);
    List<CustomerAddress> findByCustidAndIsDefault(Integer custid, Boolean isDefault);
}