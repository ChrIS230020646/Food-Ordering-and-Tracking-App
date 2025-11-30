package com.mustudy.reactweb_backend.services;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.mustudy.reactweb_backend.models.Customer;
import com.mustudy.reactweb_backend.models.DeliveryStaff;
import com.mustudy.reactweb_backend.models.Restaurant;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${security.jwt.secret}")
    private String jwtSecret;

    @Value("${security.jwt.expiration-minutes:60}")
    private long expirationMinutes;

    public JwtToken generateTokenForCustomer(Customer customer) {
        Instant now = Instant.now();
        Instant expiry = now.plus(expirationMinutes, ChronoUnit.MINUTES);

        String token = Jwts.builder()
                .setSubject(String.valueOf(customer.getCustid()))
                .claim("email", customer.getEmail())
                .claim("name", customer.getCustname())
                .claim("role", "customer")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        return new JwtToken(token, expiry);
    }

    public JwtToken generateTokenForRestaurant(Restaurant restaurant) {
        Instant now = Instant.now();
        Instant expiry = now.plus(expirationMinutes, ChronoUnit.MINUTES);

        String token = Jwts.builder()
                .setSubject(String.valueOf(restaurant.getRestid()))
                .claim("restname", restaurant.getRestname())
                .claim("role", "restaurant")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        return new JwtToken(token, expiry);
    }

    public JwtToken generateTokenForDeliveryStaff(DeliveryStaff deliveryStaff) {
        Instant now = Instant.now();
        Instant expiry = now.plus(expirationMinutes, ChronoUnit.MINUTES);

        String token = Jwts.builder()
                .setSubject(String.valueOf(deliveryStaff.getStaffId()))
                .claim("email", deliveryStaff.getEmail())
                .claim("name", deliveryStaff.getName())
                .claim("role", "delivery")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        return new JwtToken(token, expiry);
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Parse and validate JWT token
     * @param token JWT token string
     * @return Claims from the token
     * @throws Exception if token is invalid or expired
     */
    public Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired token", e);
        }
    }

    /**
     * Extract staff ID from token for delivery staff
     * @param token JWT token string
     * @return Staff ID as Integer, or null if not a delivery staff token
     */
    public Integer getStaffIdFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            String role = claims.get("role", String.class);
            if ("delivery".equals(role)) {
                String subject = claims.getSubject();
                return Integer.parseInt(subject);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public record JwtToken(String token, Instant expiresAt) {}
}

