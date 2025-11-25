package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.dto.booking.ReserveSeatsRequest;
import com.acm.cinema_ebkg_system.dto.booking.SeatAvailabilityResponse;
import com.acm.cinema_ebkg_system.service.ShowSeatService;
import com.acm.cinema_ebkg_system.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for seat management and reservations
 */
@RestController
@RequestMapping("/api/seats")
public class SeatController {
    
    @Autowired
    private ShowSeatService showSeatService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Get all seats for a movie_show with availability status
     * 
     * Endpoint: GET /api/seats/show/{showId}
     * 
     * @param showId The movie_show.id (identifies which movie show we're booking seats for)
     *               This is NOT movie.id - it's the specific show instance from movie_show table
     * 
     * Database flow:
     * 1. Find movie_show by id
     * 2. Find all show_seats where show_id = movie_show.id
     * 3. Check is_available field to see which seats are available
     * 
     * Date/time information can be found via:
     * - show_date.movie_show_id → movie_show.id
     * - show_time.show_date_id → show_date.show_date_id
     * 
     * Public endpoint - anyone can view seat availability
     */
    @GetMapping("/show/{showId}")
    public ResponseEntity<SeatAvailabilityResponse> getSeatsForShow(@PathVariable Long showId) {
        try {
            // showId is movie_show.id - used to find seats in show_seats table
            System.out.println("GET /api/seats/show/" + showId + " - Fetching seats for movie_show.id = " + showId);
            SeatAvailabilityResponse response = showSeatService.getSeatsForShow(showId);
            System.out.println("GET /api/seats/show/" + showId + " - Found " + (response.getSeats() != null ? response.getSeats().size() : 0) + " seats");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("GET /api/seats/show/" + showId + " - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Reserve seats (temporary hold)
     * Public endpoint - anyone can reserve seats, but only logged-in users can complete booking
     * userId is optional - if user is logged in, it will be tracked; if not, reservation is anonymous
     */
    @PostMapping("/reserve")
    public ResponseEntity<Map<String, Object>> reserveSeats(
            @RequestBody ReserveSeatsRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            // Extract user ID from JWT token (optional - anonymous users can also reserve)
            Long userId = getUserIdFromRequest(httpRequest);
            
            // Log the request details
            System.out.println("POST /api/seats/reserve - showId: " + request.getShowId() + ", userId: " + (userId != null ? userId : "anonymous"));
            System.out.println("POST /api/seats/reserve - seats: " + (request.getSeats() != null ? request.getSeats().size() : 0) + " seats");
            if (request.getSeats() != null && !request.getSeats().isEmpty()) {
                request.getSeats().forEach(seat -> 
                    System.out.println("  - Seat: row=" + seat.getSeatRow() + ", number=" + seat.getSeatNumber())
                );
            }
            
            // Reserve the seats and get the seat IDs (userId can be null for anonymous users)
            List<Long> reservedSeatIds = showSeatService.reserveSeats(userId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Seats reserved successfully");
            response.put("seats", request.getSeats());
            response.put("seatIds", reservedSeatIds); // Include the database seat IDs
            
            System.out.println("POST /api/seats/reserve - Success, reserved seat IDs: " + reservedSeatIds);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Check if it's an authentication error or booking conflict
            String errorMessage = e.getMessage();
            if (errorMessage != null && (errorMessage.contains("already been booked") || 
                                         errorMessage.contains("already reserved"))) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse(errorMessage));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(errorMessage));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to reserve seats: " + e.getMessage()));
        }
    }
    
    /**
     * Release reserved seats by showId and seat row/number
     * Used when timer expires on frontend
     * Requires authentication
     */
    @PostMapping("/release-by-selection")
    public ResponseEntity<Map<String, Object>> releaseSeatsBySelection(
            @RequestBody ReserveSeatsRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            // Release the seats by showId and seat row/number
            // Note: Anonymous users can release seats they reserved (no authentication required)
            showSeatService.releaseSeatsByRowAndNumber(request.getShowId(), request.getSeats());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Seats released successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to release seats: " + e.getMessage()));
        }
    }
    
    /**
     * Release reserved seats by seat IDs (legacy method)
     * Requires authentication
     */
    @PostMapping("/release")
    public ResponseEntity<Map<String, Object>> releaseSeats(
            @RequestBody List<Long> seatIds,
            HttpServletRequest httpRequest) {
        
        try {
            // Extract user ID from JWT token
            Long userId = getUserIdFromRequest(httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("You need to be a logged in user to release seats"));
            }
            
            // Release the seats
            showSeatService.releaseSeats(userId, seatIds);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Seats released successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to release seats: " + e.getMessage()));
        }
    }
    
    /**
     * Check if seats are available
     * Public endpoint
     */
    @PostMapping("/check-availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @RequestParam Long showId,
            @RequestBody List<Long> seatIds) {
        
        try {
            boolean available = showSeatService.areSeatsAvailable(showId, seatIds);
            
            Map<String, Object> response = new HashMap<>();
            response.put("available", available);
            response.put("seatIds", seatIds);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to check availability: " + e.getMessage()));
        }
    }
    
    /**
     * Initialize seats for a movie show
     * Creates standard cinema layout (67 seats: 3 rows x 9 seats + 4 rows x 10 seats)
     * Admin endpoint - can be used to manually initialize seats
     * 
     * Endpoint: POST /api/seats/initialize/{showId}
     */
    @PostMapping("/initialize/{showId}")
    public ResponseEntity<Map<String, Object>> initializeSeats(@PathVariable Long showId) {
        try {
            int seatsCreated = showSeatService.initializeSeatsForShow(showId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Seats initialized successfully");
            response.put("seatsCreated", seatsCreated);
            response.put("showId", showId);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to initialize seats: " + e.getMessage()));
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

