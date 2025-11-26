package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.TicketSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * TicketSeat Repository
 * 
 * Provides data access methods for TicketSeat entities
 */
@Repository
public interface TicketSeatRepository extends JpaRepository<TicketSeat, Long> {
    
    // Find all ticket-seat associations for a specific seat
    List<TicketSeat> findByShowSeatId(Long showSeatId);
    
    // Find all ticket-seat associations for a specific ticket
    List<TicketSeat> findByTicketId(Long ticketId);
    
    // Check if a seat is linked to any ticket
    boolean existsByShowSeatId(Long showSeatId);
    
    // Find ticket-seat by seat ID (should be unique - one seat per ticket)
    Optional<TicketSeat> findFirstByShowSeatId(Long showSeatId);
    
    
    // Count how many seats are reserved (linked to tickets) for a show
    @Query("SELECT COUNT(ts) FROM TicketSeat ts WHERE ts.showSeat.movieShow.id = :showId")
    Long countReservedSeatsByShowId(@Param("showId") Long showId);
}

