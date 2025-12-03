package com.mustudy.reactweb_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mustudy.reactweb_backend.dto.DeliveryStaffProfile;
import com.mustudy.reactweb_backend.models.DeliveryStaff;
import com.mustudy.reactweb_backend.repositories.DeliveryStaffRepository;
import com.mustudy.reactweb_backend.services.JwtService;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = "http://localhost:5173")
public class DeliveryStaffController {

    @Autowired
    private DeliveryStaffRepository deliveryStaffRepository;

    @Autowired
    private JwtService jwtService;

    /**
     * Get current delivery staff profile
     * Requires Authorization header with Bearer token
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Extract token from Authorization header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix

            // Get staff ID from token
            Integer staffId = jwtService.getStaffIdFromToken(token);
            if (staffId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token or not a delivery staff token");
            }

            // Find delivery staff in database
            DeliveryStaff deliveryStaff = deliveryStaffRepository.findById(staffId)
                    .orElse(null);

            if (deliveryStaff == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Delivery staff not found");
            }

            // Convert to profile DTO
            DeliveryStaffProfile profile = new DeliveryStaffProfile(
                    deliveryStaff.getStaffId(),
                    deliveryStaff.getName(),
                    deliveryStaff.getEmail(),
                    deliveryStaff.getPhone(),
                    deliveryStaff.getIcon(),
                    deliveryStaff.getIsValidate()
            );

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving profile: " + e.getMessage());
        }
    }
}

