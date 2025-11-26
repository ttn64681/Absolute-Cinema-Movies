package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.ShowSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Show Seat Repository
 * 
 * Provides data access methods for ShowSeat entities
 * 
 * Database relationship:
 * - show_seats.show_id → movie_show.id (foreign key)
 * - To find seats for a movie booking, use movie_show.id
 */
@Repository
public interface ShowSeatRepository extends JpaRepository<ShowSeat, Long> {
    
    /**
     * Find all seats for a specific movie_show
     * 
     * @param showId The movie_show.id (from movie_show table)
     * @return List of ShowSeat entities where show_id = showId
     * 
     * SQL equivalent: SELECT * FROM show_seats WHERE show_id = :showId
     */
    List<ShowSeat> findByMovieShowId(Long showId);
    
    // Find available seats for a specific show
    @Query("SELECT s FROM ShowSeat s WHERE s.movieShow.id = :showId AND s.isAvailable = true")
    List<ShowSeat> findAvailableSeatsByShowId(@Param("showId") Long showId);
    
    // Find a specific seat by show, row, and number
    Optional<ShowSeat> findByMovieShowIdAndSeatRowAndSeatNumber(Long showId, String seatRow, String seatNumber);
    
    // Count available seats for a show
    @Query("SELECT COUNT(s) FROM ShowSeat s WHERE s.movieShow.id = :showId AND s.isAvailable = true")
    Long countAvailableSeatsByShowId(@Param("showId") Long showId);
    
    // Count reserved seats for a show
    @Query("SELECT COUNT(s) FROM ShowSeat s WHERE s.movieShow.id = :showId AND s.isAvailable = false")
    Long countReservedSeatsByShowId(@Param("showId") Long showId);
    
    // Find seats by IDs
    List<ShowSeat> findByIdIn(List<Long> seatIds);
}

