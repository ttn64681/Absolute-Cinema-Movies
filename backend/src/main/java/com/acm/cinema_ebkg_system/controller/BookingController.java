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
     * Complete payment for a booking
     * Updates booking status to "paid" and payment_info with actual card details
     * POST /api/bookings/{bookingId}/complete-payment
     */
    @PostMapping("/{bookingId}/complete-payment")
    public ResponseEntity<Map<String, Object>> completePayment(
            @PathVariable Long bookingId,
            @RequestBody Map<String, Object> paymentData,
            HttpServletRequest httpRequest) {
        
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("User not authenticated"));
            }
            
            // Extract payment data
            String cardNumber = (String) paymentData.get("cardNumber");
            String expirationDate = (String) paymentData.get("expirationDate");
            String cardholderName = (String) paymentData.get("cardholderName");
            String billingAddress = (String) paymentData.get("billingAddress");
            
            // Safely extract promotionId - only if it's a valid number
            Long promotionId = null;
            Object promoIdObj = paymentData.get("promotionId");
            if (promoIdObj != null && !promoIdObj.toString().equals("null") && !promoIdObj.toString().isEmpty()) {
                try {
                    promotionId = Long.parseLong(promoIdObj.toString());
                    // Verify promotion exists before proceeding
                    if (promotionId <= 0) {
                        promotionId = null;
                    }
                } catch (NumberFormatException e) {
                    promotionId = null;
                }
            }
            
            java.math.BigDecimal finalTotalAmount = paymentData.get("finalTotalAmount") != null
                ? new java.math.BigDecimal(paymentData.get("finalTotalAmount").toString())
                : null;
            
            // Complete payment
            Booking booking = bookingService.completePayment(bookingId, userId, cardNumber, 
                expirationDate, cardholderName, billingAddress, promotionId, finalTotalAmount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment completed successfully");
            response.put("bookingId", booking.getBookingId());
            response.put("totalAmount", booking.getTotalAmount());
            response.put("status", booking.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to complete payment: " + e.getMessage()));
        }
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
