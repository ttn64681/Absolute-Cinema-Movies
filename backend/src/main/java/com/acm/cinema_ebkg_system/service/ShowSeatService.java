package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.dto.booking.ReserveSeatsRequest;
import com.acm.cinema_ebkg_system.dto.booking.SeatAvailabilityResponse;
import com.acm.cinema_ebkg_system.dto.booking.SeatDTO;
import com.acm.cinema_ebkg_system.model.MovieShow;
import com.acm.cinema_ebkg_system.model.ShowSeat;
import com.acm.cinema_ebkg_system.repository.MovieShowRepository;
import com.acm.cinema_ebkg_system.repository.ShowSeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing show seat availability and reservations
 * 
 * Database structure:
 * - show_seats.show_id → movie_show.id (foreign key)
 * - show_date.movie_show_id → movie_show.id (for date/time information)
 * - show_time.show_date_id → show_date.show_date_id (for time information)
 * 
 * A seat is considered taken if:
 * - It has is_available = false (reserved or booked)
 * 
 * To book a seat:
 * 1. Match movie_show.id (from show_seats.show_id)
 * 2. Match seat_row and seat_number
 * 3. Set is_available = false to reserve/book the seat
 */
@Service
public class ShowSeatService {
    
    @Autowired
    private ShowSeatRepository showSeatRepository;
    
    @Autowired
    private MovieShowRepository movieShowRepository;
    
    /**
     * Get all seats for a movie_show with availability status
     * 
     * IMPORTANT: Always returns the FULL seat layout (67 seats total), not just seats in the database.
     * - Front rows (1-3): 9 seats each (A-I)
     * - Back rows (4-7): 10 seats each (A-J)
     * 
     * For each seat in the layout:
     * - If seat exists in database and is_available=false → marked as taken
     * - If seat exists in database and is_available=true → marked as available
     * - If seat doesn't exist in database → marked as available (default state)
     * 
     * Database relationships:
     * - show_seats.show_id → movie_show.id (foreign key)
     * - show_date.movie_show_id → movie_show.id (for date information)
     * - show_time.show_date_id → show_date.show_date_id (for time information)
     * 
     * @param showId The movie_show.id (not movie.id) - identifies which show we're booking seats for
     * @return SeatAvailabilityResponse with ALL seats (full layout) and their availability status
     */
    @Transactional
    public SeatAvailabilityResponse getSeatsForShow(Long showId) {
        // Verify movie_show exists (showId = movie_show.id)
        movieShowRepository.findById(showId)
            .orElseThrow(() -> new RuntimeException("Movie show not found with id: " + showId));
        
        // Release expired reservations (older than 10 minutes) before fetching seats
        // Note: Changed to @Transactional (not read-only) to allow releasing expired seats
        releaseExpiredReservations(showId);
        
        // Get all booked/reserved seats for this movie_show from show_seats table
        // We only need to check which seats are taken - all others are available by default
        // Fetch all seats for the show
        List<ShowSeat> dbSeats = showSeatRepository.findByMovieShowId(showId);
        
        // Create a map of existing seats for quick lookup: "row+number" -> ShowSeat
        java.util.Map<String, ShowSeat> seatMap = dbSeats.stream()
            .collect(Collectors.toMap(
                seat -> seat.getSeatRow() + seat.getSeatNumber(),
                seat -> seat,
                (existing, replacement) -> existing // If duplicate, keep first
            ));
        
        // Generate FULL seat layout (67 seats total)
        List<SeatDTO> seatDTOs = new ArrayList<>();
        
        // Front rows: 3 rows (1-3) with 9 seats each (A-I)
        String[] frontSeatLetters = {"A", "B", "C", "D", "E", "F", "G", "H", "I"};
        for (int row = 1; row <= 3; row++) {
            String rowLabel = String.valueOf(row);
            for (String seatLetter : frontSeatLetters) {
                String seatKey = rowLabel + seatLetter;
                ShowSeat dbSeat = seatMap.get(seatKey);
                
                // Check if seat is taken (considering expiration)
                boolean isTaken = false;
                if (dbSeat != null && !dbSeat.getIsAvailable()) {
                    // Check if reservation has expired (10 minutes)
                    if (dbSeat.getReservedAt() != null) {
                        long minutesSinceReservation = ChronoUnit.MINUTES.between(dbSeat.getReservedAt(), LocalDateTime.now());
                        if (minutesSinceReservation >= 10) {
                            // Reservation expired - treat as available
                            isTaken = false;
                        } else {
                            // Still within 10-minute window
                            isTaken = true;
                        }
                    } else {
                        // Permanently booked (no reserved_at timestamp)
                        isTaken = true;
                    }
                }
                boolean isAvailable = !isTaken;
                
                // Use database ID if seat exists, otherwise null (will be created on reservation)
                Long seatId = dbSeat != null ? dbSeat.getId() : null;
                
                seatDTOs.add(new SeatDTO(
                    seatId,
                    rowLabel,
                    seatLetter,
                    "standard",
                    isAvailable,
                    isTaken
                ));
            }
        }
        
        // Back rows: 4 rows (4-7) with 10 seats each (A-J)
        String[] backSeatLetters = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J"};
        for (int row = 4; row <= 7; row++) {
            String rowLabel = String.valueOf(row);
            for (String seatLetter : backSeatLetters) {
                String seatKey = rowLabel + seatLetter;
                ShowSeat dbSeat = seatMap.get(seatKey);
                
                // Check if seat is taken (considering expiration)
                boolean isTaken = false;
                if (dbSeat != null && !dbSeat.getIsAvailable()) {
                    // Check if reservation has expired (10 minutes)
                    if (dbSeat.getReservedAt() != null) {
                        long minutesSinceReservation = ChronoUnit.MINUTES.between(dbSeat.getReservedAt(), LocalDateTime.now());
                        if (minutesSinceReservation >= 10) {
                            // Reservation expired - treat as available
                            isTaken = false;
                        } else {
                            // Still within 10-minute window
                            isTaken = true;
                        }
                    } else {
                        // Permanently booked (no reserved_at timestamp)
                        isTaken = true;
                    }
                }
                boolean isAvailable = !isTaken;
                
                // Use database ID if seat exists, otherwise null (will be created on reservation)
                Long seatId = dbSeat != null ? dbSeat.getId() : null;
                
                seatDTOs.add(new SeatDTO(
                    seatId,
                    rowLabel,
                    seatLetter,
                    "standard",
                    isAvailable,
                    isTaken
                ));
            }
        }
        
        // Calculate statistics
        long totalSeats = seatDTOs.size(); // Always 67
        long availableSeats = seatDTOs.stream().filter(SeatDTO::getIsAvailable).count();
        long reservedSeats = totalSeats - availableSeats;
        
        return new SeatAvailabilityResponse(showId, seatDTOs, totalSeats, availableSeats, reservedSeats);
    }
    
    /**
     * Reserve seats (temporary hold - sets is_available = false)
     * 
     * Public method - anyone can reserve seats (userId can be null for anonymous users)
     * Only logged-in users can complete booking (checkout requires authentication)
     * 
     * Finds or creates seats by matching:
     * - movie_show.id (from show_seats.show_id)
     * - seat_row and seat_number
     * 
     * Logic:
     * 1. If seat exists and is available (is_available = true) → mark as reserved
     * 2. If seat exists and is reserved/booked (is_available = false) → throw error
     * 3. If seat doesn't exist → create it and mark as reserved
     * 
     * @param userId Optional user ID (null for anonymous users)
     * @param request Seat reservation request with showId and seat selections
     * @return List of reserved seat IDs
     */
    @Transactional
    public List<Long> reserveSeats(Long userId, ReserveSeatsRequest request) {
        Long showId = request.getShowId();
        System.out.println("ShowSeatService.reserveSeats - showId: " + showId + " (movie_show.id)");
        
        // Verify movie_show exists
        MovieShow movieShow = movieShowRepository.findById(showId)
            .orElseThrow(() -> {
                System.err.println("Movie show not found with id: " + showId);
                return new RuntimeException("Movie show not found with id: " + showId);
            });
        
        System.out.println("ShowSeatService.reserveSeats - Found movie_show: id=" + movieShow.getId() + 
            ", movie_id=" + (movieShow.getMovie() != null ? movieShow.getMovie().getMovie_id() : "null") +
            ", show_room_id=" + (movieShow.getShowRoom() != null ? movieShow.getShowRoom().getId() : "null"));
        
        List<ShowSeat> seatsToSave = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        // First pass: Validate all seats and check for conflicts
        List<String> bookedSeats = new ArrayList<>();
        List<String> reservedSeats = new ArrayList<>();
        
        for (ReserveSeatsRequest.SeatSelection seatSelection : request.getSeats()) {
            String seatRow = seatSelection.getSeatRow();
            String seatNumber = seatSelection.getSeatNumber();
            
            if (seatRow == null || seatNumber == null) {
                throw new RuntimeException("Seat row and seat number are required");
            }
            
            // Try to find existing seat
            ShowSeat seat = showSeatRepository
                .findByMovieShowIdAndSeatRowAndSeatNumber(request.getShowId(), seatRow, seatNumber)
                .orElse(null);
            
            if (seat != null && !seat.getIsAvailable()) {
                // Check if reservation has expired (older than 10 minutes)
                if (seat.getReservedAt() != null) {
                    long minutesSinceReservation = ChronoUnit.MINUTES.between(seat.getReservedAt(), now);
                    if (minutesSinceReservation < 10) {
                        // Still within 10-minute window - seat is taken
                        reservedSeats.add(seatRow + seatNumber);
                    }
                    // If expired, we'll release it in the second pass
                } else {
                    // Seat is permanently booked (no reserved_at timestamp)
                    bookedSeats.add(seatRow + seatNumber);
                }
            }
        }
        
        // If any seats are already booked or reserved, throw error with details
        if (!bookedSeats.isEmpty()) {
            String seatList = String.join(", ", bookedSeats);
            throw new RuntimeException("Seats have already been booked: " + seatList + ". Please select different seats.");
        }
        if (!reservedSeats.isEmpty()) {
            String seatList = String.join(", ", reservedSeats);
            throw new RuntimeException("Seats are already reserved: " + seatList + ". Please select different seats.");
        }
        
        // Second pass: Process each seat selection (all seats are available at this point)
        for (ReserveSeatsRequest.SeatSelection seatSelection : request.getSeats()) {
            String seatRow = seatSelection.getSeatRow();
            String seatNumber = seatSelection.getSeatNumber();
            
            // Try to find existing seat
            ShowSeat seat = showSeatRepository
                .findByMovieShowIdAndSeatRowAndSeatNumber(request.getShowId(), seatRow, seatNumber)
                .orElse(null);
            
            if (seat != null) {
                // Check if reservation has expired (older than 10 minutes) and release if needed
                if (seat.getReservedAt() != null) {
                    long minutesSinceReservation = ChronoUnit.MINUTES.between(seat.getReservedAt(), now);
                    if (minutesSinceReservation >= 10) {
                        // Reservation expired - release the seat
                        seat.setIsAvailable(true);
                        seat.setReservedAt(null);
                        seat.setUpdatedAt(now);
                        System.out.println("Reservation expired for seat " + seatRow + seatNumber + " (reserved " + minutesSinceReservation + " minutes ago)");
                    }
                }
                // Seat exists and is available - mark as reserved with timestamp
                seat.setIsAvailable(false);
                seat.setReservedAt(now); // Set reservation timestamp
                seat.setUpdatedAt(now);
            } else {
                // Seat doesn't exist - create it and mark as reserved with timestamp
                seat = new ShowSeat();
                seat.setMovieShow(movieShow);
                seat.setSeatRow(seatRow);
                seat.setSeatNumber(seatNumber);
                seat.setSeatType("standard");
                seat.setIsAvailable(false); // Mark as reserved
                seat.setReservedAt(now); // Set reservation timestamp
                seat.setCreatedAt(now);
                seat.setUpdatedAt(now);
            }
            
            seatsToSave.add(seat);
        }
        
        // Save all seats (both new and updated)
        List<ShowSeat> savedSeats = showSeatRepository.saveAll(seatsToSave);
        
        // Update available seats count in MovieShow
        updateAvailableSeatsCount(request.getShowId());
        
        // Return the seat IDs
        return savedSeats.stream()
            .map(ShowSeat::getId)
            .collect(Collectors.toList());
    }
    
    /**
     * Release reserved seats (make them available again by setting is_available = true)
     * Uses seat IDs (legacy method)
     */
    @Transactional
    public void releaseSeats(Long userId, List<Long> seatIds) {
        List<ShowSeat> seats = showSeatRepository.findByIdIn(seatIds);
        
        if (seats.isEmpty()) {
            return;
        }
        
        // Collect all unique show IDs for updating counts
        List<Long> showIds = seats.stream()
            .map(seat -> seat.getMovieShow().getId())
            .distinct()
            .collect(Collectors.toList());
        
        // Release all seats (set is_available = true and clear reserved_at)
        LocalDateTime now = LocalDateTime.now();
        for (ShowSeat seat : seats) {
            seat.setIsAvailable(true);
            seat.setReservedAt(null);
            seat.setUpdatedAt(now);
        }
        
        showSeatRepository.saveAll(seats);
        
        // Update available seats count for all affected shows
        showIds.forEach(this::updateAvailableSeatsCount);
    }
    
    /**
     * Release reserved seats by showId and seat row/number
     * Used when timer expires on frontend
     */
    @Transactional
    public void releaseSeatsByRowAndNumber(Long showId, List<ReserveSeatsRequest.SeatSelection> seatSelections) {
        List<ShowSeat> seatsToRelease = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (ReserveSeatsRequest.SeatSelection seatSelection : seatSelections) {
            ShowSeat seat = showSeatRepository
                .findByMovieShowIdAndSeatRowAndSeatNumber(showId, seatSelection.getSeatRow(), seatSelection.getSeatNumber())
                .orElse(null);
            
            if (seat != null && !seat.getIsAvailable() && seat.getReservedAt() != null) {
                // Only release if it's a temporary reservation (has reserved_at)
                seat.setIsAvailable(true);
                seat.setReservedAt(null);
                seat.setUpdatedAt(now);
                seatsToRelease.add(seat);
            }
        }
        
        if (!seatsToRelease.isEmpty()) {
            showSeatRepository.saveAll(seatsToRelease);
            updateAvailableSeatsCount(showId);
        }
    }
    
    /**
     * Update the available seats count in MovieShow entity
     * Counts seats that have is_available = true
     */
    public void updateAvailableSeatsCount(Long showId) {
        // Get all seats for the movie_show
        List<ShowSeat> allSeats = showSeatRepository.findByMovieShowId(showId);
        
        // Count available seats (is_available = true)
        long availableCount = allSeats.stream()
            .filter(ShowSeat::getIsAvailable)
            .count();
        
        movieShowRepository.findById(showId).ifPresent(show -> {
            show.setAvailableSeats((int) availableCount);
            movieShowRepository.save(show);
        });
    }
    
    /**
     * Check if seats are available
     * A seat is available if is_available = true and it belongs to the correct movie_show
     */
    @Transactional(readOnly = true)
    public boolean areSeatsAvailable(Long showId, List<Long> seatIds) {
        List<ShowSeat> seats = showSeatRepository.findByIdIn(seatIds);
        
        if (seats.size() != seatIds.size()) {
            return false;
        }
        
        for (ShowSeat seat : seats) {
            // Verify seat belongs to the correct movie_show
            if (!seat.getMovieShow().getId().equals(showId)) {
                return false;
            }
            
            // Check if seat is available (is_available = true)
            if (!seat.getIsAvailable()) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Initialize seats for a movie show
     * Creates seats based on a standard cinema layout:
     * - Front rows (1-3): 9 seats each (A-I)
     * - Back rows (4-7): 10 seats each (A-J)
     * Total: 67 seats
     * 
     * If seats already exist for this show, they won't be duplicated
     * 
     * @param showId The movie_show.id to create seats for
     * @return Number of seats created
     */
    @Transactional
    public int initializeSeatsForShow(Long showId) {
        // Verify movie_show exists
        MovieShow movieShow = movieShowRepository.findById(showId)
            .orElseThrow(() -> new RuntimeException("Movie show not found with id: " + showId));
        
        // Check if seats already exist
        List<ShowSeat> existingSeats = showSeatRepository.findByMovieShowId(showId);
        if (!existingSeats.isEmpty()) {
            return existingSeats.size(); // Return existing count, don't create duplicates
        }
        
        List<ShowSeat> seatsToCreate = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        // Front rows: 3 rows (1-3) with 9 seats each (A-I)
        String[] frontSeatLetters = {"A", "B", "C", "D", "E", "F", "G", "H", "I"};
        for (int row = 1; row <= 3; row++) {
            String rowLabel = String.valueOf(row);
            for (int i = 0; i < frontSeatLetters.length; i++) {
                ShowSeat seat = new ShowSeat();
                seat.setMovieShow(movieShow);
                seat.setSeatRow(rowLabel);
                seat.setSeatNumber(frontSeatLetters[i]);
                seat.setSeatType("standard");
                seat.setIsAvailable(true);
                seat.setCreatedAt(now);
                seat.setUpdatedAt(now);
                seatsToCreate.add(seat);
            }
        }
        
        // Back rows: 4 rows (4-7) with 10 seats each (A-J)
        String[] backSeatLetters = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J"};
        for (int row = 4; row <= 7; row++) {
            String rowLabel = String.valueOf(row);
            for (int i = 0; i < backSeatLetters.length; i++) {
                ShowSeat seat = new ShowSeat();
                seat.setMovieShow(movieShow);
                seat.setSeatRow(rowLabel);
                seat.setSeatNumber(backSeatLetters[i]);
                seat.setSeatType("standard");
                seat.setIsAvailable(true);
                seat.setCreatedAt(now);
                seat.setUpdatedAt(now);
                seatsToCreate.add(seat);
            }
        }
        
        // Save all seats
        showSeatRepository.saveAll(seatsToCreate);
        
        // Update available seats count
        movieShow.setAvailableSeats(seatsToCreate.size());
        movieShowRepository.save(movieShow);
        
        return seatsToCreate.size();
    }
    
    /**
     * Get seats for show with automatic initialization if needed
     * This is called when getSeatsForShow finds no seats
     */
    @Transactional
    private SeatAvailabilityResponse getSeatsForShowWithInitialization(Long showId) {
        // Initialize seats if they don't exist
        initializeSeatsForShow(showId);
        
        // Now get the seats
        List<ShowSeat> seats = showSeatRepository.findByMovieShowId(showId);
        
        // Convert to DTOs
        List<SeatDTO> seatDTOs = seats.stream()
            .map(seat -> {
                boolean isTaken = !seat.getIsAvailable();
                boolean isAvailable = seat.getIsAvailable();
                
                return new SeatDTO(
                    seat.getId(),
                    seat.getSeatRow(),
                    seat.getSeatNumber(),
                    seat.getSeatType(),
                    isAvailable,
                    isTaken
                );
            })
            .collect(Collectors.toList());
        
        // Calculate statistics
        long totalSeats = seats.size();
        long availableSeats = seatDTOs.stream().filter(SeatDTO::getIsAvailable).count();
        long reservedSeats = totalSeats - availableSeats;
        
        return new SeatAvailabilityResponse(showId, seatDTOs, totalSeats, availableSeats, reservedSeats);
    }
    
    /**
     * Release expired reservations (older than 10 minutes)
     * Called automatically when fetching seats
     * 
     * @param showId The movie_show.id to check reservations for
     */
    @Transactional
    public void releaseExpiredReservations(Long showId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tenMinutesAgo = now.minus(10, ChronoUnit.MINUTES);
        
        // Find all reserved seats for this show that were reserved more than 10 minutes ago
        // Fetch all seats for the show
        List<ShowSeat> allSeats = showSeatRepository.findByMovieShowId(showId);
        List<ShowSeat> expiredSeats = new ArrayList<>();
        
        for (ShowSeat seat : allSeats) {
            // Access only the fields we need
            if (!seat.getIsAvailable() && seat.getReservedAt() != null) {
                // Check if reservation is older than 10 minutes
                if (seat.getReservedAt().isBefore(tenMinutesAgo)) {
                    // Release the seat
                    seat.setIsAvailable(true);
                    seat.setReservedAt(null);
                    seat.setUpdatedAt(now);
                    expiredSeats.add(seat);
                }
            }
        }
        
        if (!expiredSeats.isEmpty()) {
            // Save seats
            for (ShowSeat seat : expiredSeats) {
                // Seat is already updated above
            }
            showSeatRepository.saveAll(expiredSeats);
            updateAvailableSeatsCount(showId);
            System.out.println("Released " + expiredSeats.size() + " expired reservation(s) for showId: " + showId);
        }
    }
    
    /**
     * Mark seat as permanently booked (when booking is completed)
     * Removes reserved_at timestamp to indicate permanent booking
     * 
     * @param seatId The seat ID to mark as permanently booked
     */
    @Transactional
    public void markSeatAsPermanentlyBooked(Long seatId) {
        ShowSeat seat = showSeatRepository.findById(seatId)
            .orElseThrow(() -> new RuntimeException("Seat not found with id: " + seatId));
        
        // Keep is_available = false but remove reserved_at to indicate permanent booking
        seat.setReservedAt(null);
        seat.setUpdatedAt(LocalDateTime.now());
        showSeatRepository.save(seat);
    }
}

