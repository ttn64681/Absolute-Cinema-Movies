package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.MovieShow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;


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
    
    @Query(value =
     "SELECT ms.* " +
     "FROM movie_show ms " +
     "JOIN show_time st ON ms.show_time_id = st.id " +
     "WHERE ms.show_room_id = :roomId " +
     "AND (st.show_time < :endTime " +
     "AND (st.show_time + interval '1 minute' * (SELECT m.duration FROM movie m WHERE m.movie_id = ms.movie_id)) > :startTime) ",
     nativeQuery = true)
    List<MovieShow> findOverlappingMovieShows(@Param("roomId") Long roomId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}



