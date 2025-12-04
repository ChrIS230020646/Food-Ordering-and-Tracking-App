package com.mustudy.reactweb_backend.controller;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mustudy.reactweb_backend.dto.CustomerProfile;
import com.mustudy.reactweb_backend.models.Customer;
import com.mustudy.reactweb_backend.models.CustomerAddress;
import com.mustudy.reactweb_backend.repositories.CustomerAddressRepository;
import com.mustudy.reactweb_backend.repositories.CustomerRepository;
import com.mustudy.reactweb_backend.services.JwtService;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerAddressRepository customerAddressRepository;

    @Autowired
    private JwtService jwtService;

    /**
     * Get current customer profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            Integer custid = getCustomerIdFromToken(token);
            
            if (custid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a customer token");
            }

            Customer customer = customerRepository.findById(custid)
                    .orElse(null);

            if (customer == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Customer not found");
            }

            CustomerProfile profile = new CustomerProfile(
                    customer.getCustid(),
                    customer.getCustname(),
                    customer.getPhone(),
                    customer.getEmail(),
                    customer.getIcon(),
                    customer.getIsValidate(),
                    customer.getLatestLoginDate()
            );

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving profile: " + e.getMessage());
        }
    }

    /**
     * Update customer profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody CustomerProfile profileData) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            Integer custid = getCustomerIdFromToken(token);
            
            if (custid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a customer token");
            }

            Customer customer = customerRepository.findById(custid)
                    .orElse(null);

            if (customer == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Customer not found");
            }

            // Update customer fields
            if (profileData.getCustname() != null) {
                customer.setCustname(profileData.getCustname());
            }
            if (profileData.getPhone() != null) {
                customer.setPhone(profileData.getPhone());
            }
            if (profileData.getEmail() != null) {
                customer.setEmail(profileData.getEmail());
            }
            if (profileData.getIcon() != null) {
                customer.setIcon(profileData.getIcon());
            }

            customer = customerRepository.save(customer);

            CustomerProfile updatedProfile = new CustomerProfile(
                    customer.getCustid(),
                    customer.getCustname(),
                    customer.getPhone(),
                    customer.getEmail(),
                    customer.getIcon(),
                    customer.getIsValidate(),
                    customer.getLatestLoginDate()
            );

            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating profile: " + e.getMessage());
        }
    }

    /**
     * Get all addresses for current customer
     */
    @GetMapping("/addresses")
    public ResponseEntity<?> getAddresses(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            Integer custid = getCustomerIdFromToken(token);
            
            if (custid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a customer token");
            }

            List<CustomerAddress> addresses = customerAddressRepository.findByCustid(custid);
            
            // Convert to DTO format matching frontend interface
            List<AddressDTO> addressDTOs = addresses.stream()
                    .map(addr -> new AddressDTO(
                            addr.getAddressid(),
                            addr.getCustid(),
                            addr.getAddressLine1(),
                            addr.getAddressLine2(),
                            addr.getCity(),
                            addr.getPostalCode(),
                            addr.getCountry(),
                            addr.getIsDefault()
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(addressDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving addresses: " + e.getMessage());
        }
    }

    /**
     * Get default address for current customer
     */
    @GetMapping("/addresses/default")
    public ResponseEntity<?> getDefaultAddress(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            Integer custid = getCustomerIdFromToken(token);
            
            if (custid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a customer token");
            }

            List<CustomerAddress> defaultAddresses = customerAddressRepository.findByCustidAndIsDefault(custid, true);
            
            if (defaultAddresses.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No default address found");
            }

            CustomerAddress addr = defaultAddresses.get(0);
            AddressDTO addressDTO = new AddressDTO(
                    addr.getAddressid(),
                    addr.getCustid(),
                    addr.getAddressLine1(),
                    addr.getAddressLine2(),
                    addr.getCity(),
                    addr.getPostalCode(),
                    addr.getCountry(),
                    addr.getIsDefault()
            );

            return ResponseEntity.ok(addressDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving default address: " + e.getMessage());
        }
    }

    /**
     * Add a new address
     */
    @PostMapping("/addresses")
    public ResponseEntity<?> addAddress(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody AddressDTO addressData) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            Integer custid = getCustomerIdFromToken(token);
            
            if (custid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a customer token");
            }

            CustomerAddress address = new CustomerAddress();
            address.setCustid(custid);
            address.setAddressLine1(addressData.getAddress_line1());
            address.setAddressLine2(addressData.getAddress_line2());
            address.setCity(addressData.getCity());
            address.setPostalCode(addressData.getPostal_code());
            address.setCountry(addressData.getCountry() != null ? addressData.getCountry() : "Hong Kong");
            address.setIsDefault(addressData.getIs_default() != null ? addressData.getIs_default() : false);
            address.setCreatedTime(new Timestamp(System.currentTimeMillis()));

            // If this is set as default, unset other defaults
            if (address.getIsDefault()) {
                List<CustomerAddress> existingDefaults = customerAddressRepository.findByCustidAndIsDefault(custid, true);
                for (CustomerAddress existing : existingDefaults) {
                    existing.setIsDefault(false);
                    customerAddressRepository.save(existing);
                }
            }

            address = customerAddressRepository.save(address);

            AddressDTO addressDTO = new AddressDTO(
                    address.getAddressid(),
                    address.getCustid(),
                    address.getAddressLine1(),
                    address.getAddressLine2(),
                    address.getCity(),
                    address.getPostalCode(),
                    address.getCountry(),
                    address.getIsDefault()
            );

            return ResponseEntity.ok(addressDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding address: " + e.getMessage());
        }
    }

    /**
     * Update an address
     */
    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<?> updateAddress(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer addressId,
            @RequestBody AddressDTO addressData) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            Integer custid = getCustomerIdFromToken(token);
            
            if (custid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a customer token");
            }

            CustomerAddress address = customerAddressRepository.findById(addressId)
                    .orElse(null);

            if (address == null || !address.getCustid().equals(custid)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Address not found or access denied");
            }

            // Update address fields
            if (addressData.getAddress_line1() != null) {
                address.setAddressLine1(addressData.getAddress_line1());
            }
            if (addressData.getAddress_line2() != null) {
                address.setAddressLine2(addressData.getAddress_line2());
            }
            if (addressData.getCity() != null) {
                address.setCity(addressData.getCity());
            }
            if (addressData.getPostal_code() != null) {
                address.setPostalCode(addressData.getPostal_code());
            }
            if (addressData.getCountry() != null) {
                address.setCountry(addressData.getCountry());
            }
            if (addressData.getIs_default() != null) {
                // If setting as default, unset other defaults
                if (addressData.getIs_default()) {
                    List<CustomerAddress> existingDefaults = customerAddressRepository.findByCustidAndIsDefault(custid, true);
                    for (CustomerAddress existing : existingDefaults) {
                        if (!existing.getAddressid().equals(addressId)) {
                            existing.setIsDefault(false);
                            customerAddressRepository.save(existing);
                        }
                    }
                }
                address.setIsDefault(addressData.getIs_default());
            }
            address.setUpdatedTime(new Timestamp(System.currentTimeMillis()));

            address = customerAddressRepository.save(address);

            AddressDTO addressDTO = new AddressDTO(
                    address.getAddressid(),
                    address.getCustid(),
                    address.getAddressLine1(),
                    address.getAddressLine2(),
                    address.getCity(),
                    address.getPostalCode(),
                    address.getCountry(),
                    address.getIsDefault()
            );

            return ResponseEntity.ok(addressDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating address: " + e.getMessage());
        }
    }

    /**
     * Delete an address
     */
    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<?> deleteAddress(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer addressId) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            Integer custid = getCustomerIdFromToken(token);
            
            if (custid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a customer token");
            }

            CustomerAddress address = customerAddressRepository.findById(addressId)
                    .orElse(null);

            if (address == null || !address.getCustid().equals(custid)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Address not found or access denied");
            }

            customerAddressRepository.delete(address);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting address: " + e.getMessage());
        }
    }

    /**
     * Set default address
     */
    @PutMapping("/addresses/{addressId}/default")
    public ResponseEntity<?> setDefaultAddress(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer addressId) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            Integer custid = getCustomerIdFromToken(token);
            
            if (custid == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a customer token");
            }

            CustomerAddress address = customerAddressRepository.findById(addressId)
                    .orElse(null);

            if (address == null || !address.getCustid().equals(custid)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Address not found or access denied");
            }

            // Unset all other defaults
            List<CustomerAddress> existingDefaults = customerAddressRepository.findByCustidAndIsDefault(custid, true);
            for (CustomerAddress existing : existingDefaults) {
                if (!existing.getAddressid().equals(addressId)) {
                    existing.setIsDefault(false);
                    customerAddressRepository.save(existing);
                }
            }

            // Set this address as default
            address.setIsDefault(true);
            address.setUpdatedTime(new Timestamp(System.currentTimeMillis()));
            address = customerAddressRepository.save(address);

            AddressDTO addressDTO = new AddressDTO(
                    address.getAddressid(),
                    address.getCustid(),
                    address.getAddressLine1(),
                    address.getAddressLine2(),
                    address.getCity(),
                    address.getPostalCode(),
                    address.getCountry(),
                    address.getIsDefault()
            );

            return ResponseEntity.ok(addressDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error setting default address: " + e.getMessage());
        }
    }

    /**
     * Get customer ID from token
     */
    private Integer getCustomerIdFromToken(String token) {
        try {
            var claims = jwtService.parseToken(token);
            String role = claims.get("role", String.class);
            if ("customer".equals(role)) {
                String subject = claims.getSubject();
                return Integer.parseInt(subject);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * DTO for address matching frontend interface
     */
    public static class AddressDTO {
        private Integer addressid;
        private Integer custid;
        private String address_line1;
        private String address_line2;
        private String city;
        private String postal_code;
        private String country;
        private Boolean is_default;

        public AddressDTO() {}

        public AddressDTO(Integer addressid, Integer custid, String address_line1, String address_line2,
                         String city, String postal_code, String country, Boolean is_default) {
            this.addressid = addressid;
            this.custid = custid;
            this.address_line1 = address_line1;
            this.address_line2 = address_line2;
            this.city = city;
            this.postal_code = postal_code;
            this.country = country;
            this.is_default = is_default;
        }

        // Getters and setters
        public Integer getAddressid() { return addressid; }
        public void setAddressid(Integer addressid) { this.addressid = addressid; }
        public Integer getCustid() { return custid; }
        public void setCustid(Integer custid) { this.custid = custid; }
        public String getAddress_line1() { return address_line1; }
        public void setAddress_line1(String address_line1) { this.address_line1 = address_line1; }
        public String getAddress_line2() { return address_line2; }
        public void setAddress_line2(String address_line2) { this.address_line2 = address_line2; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getPostal_code() { return postal_code; }
        public void setPostal_code(String postal_code) { this.postal_code = postal_code; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public Boolean getIs_default() { return is_default; }
        public void setIs_default(Boolean is_default) { this.is_default = is_default; }
    }
}

