package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.dto.booking.CreateBookingRequest;
import com.acm.cinema_ebkg_system.model.Booking;
import com.acm.cinema_ebkg_system.service.BookingService;
import com.acm.cinema_ebkg_system.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for booking management
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Create a booking with tickets
     * Requires authentication
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createBooking(
            @RequestBody CreateBookingRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            // Extract user ID from JWT token
            Long userId = getUserIdFromRequest(httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("User not authenticated"));
            }
            
            // Create the booking
            Booking booking = bookingService.createBooking(userId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking created successfully");
            response.put("bookingId", booking.getBookingId());
            response.put("totalAmount", booking.getTotalAmount());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to create booking: " + e.getMessage()));
        }
    }
    
    /**
     * Extract user ID from JWT token in request header
     */
    private Long getUserIdFromRequest(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                return jwtUtil.getUserIdFromToken(token);
            }
        } catch (Exception e) {
            // Token invalid or expired
        }
        return null;
    }
    
    /**
     * Create error response map
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        return response;
    }
}
