package com.mustudy.reactweb_backend.services;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mustudy.reactweb_backend.dto.CustomerProfile;
import com.mustudy.reactweb_backend.dto.DeliveryStaffProfile;
import com.mustudy.reactweb_backend.dto.LoginRequest;
import com.mustudy.reactweb_backend.dto.LoginResponse;
import com.mustudy.reactweb_backend.dto.RegisterRequest;
import com.mustudy.reactweb_backend.dto.RestaurantProfile;
import com.mustudy.reactweb_backend.models.Customer;
import com.mustudy.reactweb_backend.models.CustomerAddress;
import com.mustudy.reactweb_backend.models.DeliveryStaff;
import com.mustudy.reactweb_backend.models.Restaurant;
import com.mustudy.reactweb_backend.repositories.CustomerAddressRepository;
import com.mustudy.reactweb_backend.repositories.CustomerRepository;
import com.mustudy.reactweb_backend.repositories.DeliveryStaffRepository;
import com.mustudy.reactweb_backend.repositories.RestaurantRepository;

@Service
public class AuthService {
    
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerAddressRepository customerAddressRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired
    private DeliveryStaffRepository deliveryStaffRepository;
    
    @Autowired
    private JwtService jwtService;

    @Transactional
    public Object registerUser(RegisterRequest request) {
        // check email exists
        if (isEmailExists(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // hash password
        String sha384Hash = hashPassword(request.getPassword(), "SHA-384");
        String sha256Hash = hashPassword(request.getPassword(), "SHA-256");
        
        switch (request.getUserType().toLowerCase()) {
            case "customer":
                return registerCustomerWithAddress(request, sha384Hash, sha256Hash);
            case "restaurant":
                return registerRestaurant(request, sha384Hash, sha256Hash);
            case "delivery":
                return registerDeliveryStaff(request, sha384Hash, sha256Hash);
            default:
                throw new RuntimeException("Invalid user type");
        }
    }
    private Customer registerCustomerWithAddress(RegisterRequest request, String sha384Hash, String sha256Hash) {
        Customer customer = registerCustomer(request, sha384Hash, sha256Hash);
        CustomerAddress address = new CustomerAddress();
        address.setCustid(customer.getCustid());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setIsDefault(true);
        address.setCreatedTime(new Timestamp(System.currentTimeMillis()));
        address.setUpdatedTime(new Timestamp(System.currentTimeMillis()));
        customerAddressRepository.save(address);
        return customer;
    }
    
    private Customer registerCustomer(RegisterRequest request, String sha384Hash, String sha256Hash) {
        Customer customer = new Customer();
        customer.setCustname(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setPassHash1(sha384Hash);
        customer.setPassHash2(sha256Hash);
        customer.setIsValidate(true);
        Timestamp now = new Timestamp(System.currentTimeMillis());
        customer.setCreatedTime(now);
        customer.setUpdatedTime(now);
        return customerRepository.save(customer);
    }
    
    private Restaurant registerRestaurant(RegisterRequest request, String sha384Hash, String sha256Hash) {
        Restaurant restaurant = new Restaurant();
        restaurant.setRestname(request.getRestname());
        restaurant.setEmail(request.getEmail());
        restaurant.setDescription(request.getDescription());
        restaurant.setAddress(request.getAddress());
        // restaurant.setCuisine(request.getCuisine());
        restaurant.setPassHash1(sha384Hash);
        restaurant.setPassHash2(sha256Hash);
        restaurant.setIsValidate(true);
        restaurant.setCreatedTime(new Timestamp(System.currentTimeMillis()));
        
        return restaurantRepository.save(restaurant);
    }
    
    private DeliveryStaff registerDeliveryStaff(RegisterRequest request, String sha384Hash, String sha256Hash) {
        DeliveryStaff deliveryStaff = new DeliveryStaff();
        deliveryStaff.setName(request.getName());
        deliveryStaff.setEmail(request.getEmail());
        deliveryStaff.setPhone(request.getPhone());
        deliveryStaff.setPassHash1(sha384Hash);
        deliveryStaff.setPassHash2(sha256Hash);
        deliveryStaff.setVehicleType(DeliveryStaff.VehicleType.valueOf(request.getVehicleType().toLowerCase()));
        deliveryStaff.setLicenseNumber(request.getLicenseNumber());
        deliveryStaff.setIsValidate(false); // Delivery personnel need administrator verification? (This one wait for confirmation function)
        deliveryStaff.setCreatedTime(new Timestamp(System.currentTimeMillis()));
        
        return deliveryStaffRepository.save(deliveryStaff);
    }

    public LoginResponse login(LoginRequest request) {
        try {
            String userType = request.getUserType().toLowerCase();
            String hashedInput1 = hashPassword(request.getPassword(), "SHA-384");
            String hashedInput2 = hashPassword(request.getPassword(), "SHA-256");

            switch (userType) {
                case "customer":
                    return loginCustomer(request, hashedInput1, hashedInput2);
                case "restaurant":
                    return loginRestaurant(request, hashedInput1, hashedInput2);
                case "delivery":
                    return loginDeliveryStaff(request, hashedInput1, hashedInput2);
                default:
                    return new LoginResponse(false, "Invalid user type");
            }
        } catch (Exception e) {
            return new LoginResponse(false, "Login failed: " + e.getMessage());
        }
    }

    private LoginResponse loginCustomer(LoginRequest request, String hashedInput1, String hashedInput2) {
        Customer customer = customerRepository.findByEmail(request.getEmail()).orElse(null);
        if (customer == null) {
            return new LoginResponse(false, "User not found");
        }

        if (Boolean.FALSE.equals(customer.getIsValidate())) {
            return new LoginResponse(false, "Account disabled, please contact support");
        }

        boolean passwordValid = customer.getPassHash1().equals(hashedInput1) &&
                customer.getPassHash2().equals(hashedInput2);

        if (!passwordValid) {
            return new LoginResponse(false, "Invalid password");
        }

        updateLastLoginTime(customer);

        JwtService.JwtToken jwtToken = jwtService.generateTokenForCustomer(customer);
        CustomerProfile profile = toCustomerProfile(customer);

        return new LoginResponse(true, "Login successful", profile, jwtToken.token(), jwtToken.expiresAt().toEpochMilli());
    }

    private LoginResponse loginRestaurant(LoginRequest request, String hashedInput1, String hashedInput2) {
        // For restaurant, use email field for login
        Restaurant restaurant = restaurantRepository.findByEmail(request.getEmail()).orElse(null);
        if (restaurant == null) {
            return new LoginResponse(false, "Restaurant not found");
        }

        if (Boolean.FALSE.equals(restaurant.getIsValidate())) {
            return new LoginResponse(false, "Account disabled, please contact support");
        }

        boolean passwordValid = restaurant.getPassHash1().equals(hashedInput1) &&
                restaurant.getPassHash2().equals(hashedInput2);

        if (!passwordValid) {
            return new LoginResponse(false, "Invalid password");
        }

        updateLastLoginTime(restaurant);

        JwtService.JwtToken jwtToken = jwtService.generateTokenForRestaurant(restaurant);
        
        RestaurantProfile profile = new RestaurantProfile(
            restaurant.getRestid(),
            restaurant.getRestname(),
            restaurant.getDescription(),
            restaurant.getAddress(),
            restaurant.getIcon(),
            restaurant.getIsValidate()
        );

        return new LoginResponse(true, "Login successful", profile, jwtToken.token(), jwtToken.expiresAt().toEpochMilli());
    }

    private LoginResponse loginDeliveryStaff(LoginRequest request, String hashedInput1, String hashedInput2) {
        DeliveryStaff deliveryStaff = deliveryStaffRepository.findByEmail(request.getEmail()).orElse(null);
        if (deliveryStaff == null) {
            return new LoginResponse(false, "User not found");
        }

        if (Boolean.FALSE.equals(deliveryStaff.getIsValidate())) {
            return new LoginResponse(false, "Account disabled, please contact support");
        }

        boolean passwordValid = deliveryStaff.getPassHash1().equals(hashedInput1) &&
                deliveryStaff.getPassHash2().equals(hashedInput2);

        if (!passwordValid) {
            return new LoginResponse(false, "Invalid password");
        }

        updateLastLoginTime(deliveryStaff);

        JwtService.JwtToken jwtToken = jwtService.generateTokenForDeliveryStaff(deliveryStaff);
        
        DeliveryStaffProfile profile = new DeliveryStaffProfile(
            deliveryStaff.getStaffId(),
            deliveryStaff.getName(),
            deliveryStaff.getEmail(),
            deliveryStaff.getPhone(),
            deliveryStaff.getIcon(),
            deliveryStaff.getIsValidate()
        );

        return new LoginResponse(true, "Login successful", profile, jwtToken.token(), jwtToken.expiresAt().toEpochMilli());
    }

    private void updateLastLoginTime(Customer customer) {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        customer.setLatestLoginDate(now);
        customerRepository.save(customer);
    }

    private void updateLastLoginTime(Restaurant restaurant) {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        restaurant.setLatestLoginDate(now);
        restaurantRepository.save(restaurant);
    }

    private void updateLastLoginTime(DeliveryStaff deliveryStaff) {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        deliveryStaff.setLatestLoginDate(now);
        deliveryStaffRepository.save(deliveryStaff);
    }

    private CustomerProfile toCustomerProfile(Customer customer) {
        return new CustomerProfile(
                customer.getCustid(),
                customer.getCustname(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getIcon(),
                customer.getIsValidate(),
                customer.getLatestLoginDate()
        );
    }
    
    private String hashPassword(String password, String algorithm) {
        try {
            MessageDigest digest = MessageDigest.getInstance(algorithm);
            byte[] encodedHash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(encodedHash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
    
    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
    
    private boolean isEmailExists(String email) {
        return customerRepository.findByEmail(email).isPresent() || 
               deliveryStaffRepository.findByEmail(email).isPresent() ||
               restaurantRepository.findByEmail(email).isPresent();
    }
}