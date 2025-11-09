package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.MovieShow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Movie Show Repository
 * 
 * Automatically provides: save(), findById(), findAll(), deleteById(), count(), existsById()
 */
@Repository
public interface MovieShowRepository extends JpaRepository<MovieShow, Long> {
    
    // Find movie shows by movie (using native query because Movie uses 'movie_id' field)
    @Query("SELECT ms FROM MovieShow ms WHERE ms.movie.movie_id = :movieId")
    List<MovieShow> findByMovieId(@Param("movieId") Long movieId);
    
    // Find movie shows by show room
    List<MovieShow> findByShowRoomId(Long showRoomId);
    
    // Find movie shows by status
    // List<MovieShow> findByStatus(String status);
    
    // Find movie shows by movie and status (using native query because Movie uses 'movie_id' field)
    // @Query("SELECT ms FROM MovieShow ms WHERE ms.movie.movie_id = :movieId AND ms.status = :status")
    // List<MovieShow> findByMovieIdAndStatus(@Param("movieId") Long movieId, @Param("status") String status);
}

