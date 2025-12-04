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
    @Query(value = "SELECT ms.* FROM movie_show ms INNER JOIN show_time st ON ms.show_time_id = st.id WHERE ms.movie_id = :movieId ORDER BY st.show_time ASC", nativeQuery = true)
    List<MovieShow> findByMovieId(@Param("movieId") Long movieId);
    
    // Find movie shows by show room
    List<MovieShow> findByShowRoomId(Long showRoomId);
    
    /**FINDING SCHEDULING CONFLICTS: 
     * @params roomId, startTime, and endTime of a MovieShow the admin wishes to schedule.
     * 
     * For each existing show in the same room, the ShowTimes are compared to see if they overlap.
     * This occurs when the start time of the existing show is less than or equal to the end time of the new show
     * and the end time of the existing show is greater than or equal to the start time of the new show.
     * 
     * Note: ShowTime table only contains the start time. End time is the start time + the movie duration.
     * 
     * @return A list of existing MovieShows that cause conflicts.
     */
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



