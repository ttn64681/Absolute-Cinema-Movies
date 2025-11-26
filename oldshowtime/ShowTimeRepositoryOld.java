package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.ShowTimeOld;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ShowTimeRepositoryOld extends JpaRepository<ShowTimeOld, Long> {

    /**
     * Returns all showtimes for a specific ShowDate row (one calendar date for a movie).
     * Using explicit @Query because entity fields use snake_case (show_date_id, start_time).
     */
    @Query("SELECT st FROM ShowTime st WHERE st.show_date_id = :showDateId ORDER BY st.start_time")
    List<ShowTimeOld> findByShowDateIdOrderByStartTime(@Param("showDateId") Long showDateId);

    /**
     * Returns all showtimes for a given movie title date combination.
     *
     * @param movieId movie primary key
     * @param showDate calendar date to match
     * @return list of ShowTime ordered by start_time ascending
     */
    @Query(value = """
        SELECT st.* FROM show_time st 
        JOIN show_date sd ON st.show_date_id = sd.show_date_id 
        JOIN movie_show ms ON sd.movie_show_id = ms.id
        WHERE ms.movie_id = :movieId AND sd.show_date = :showDate 
        ORDER BY st.start_time
    """, nativeQuery = true)
    List<ShowTimeOld> findByMovieIdAndDate(@Param("movieId") Long movieId, @Param("showDate") LocalDate showDate);

    /**
     * Returns showtimes for a specific date filtered by a time range.
     * Using explicit @Query because of snake_case column names.
     */
    @Query("SELECT st FROM ShowTime st WHERE st.show_date_id = :showDateId AND st.start_time >= :startTime AND st.start_time <= :endTime ORDER BY st.start_time")
    List<ShowTimeOld> findByShowDateIdAndTimeRange(@Param("showDateId") Long showDateId,
                                              @Param("startTime") LocalTime startTime,
                                              @Param("endTime") LocalTime endTime);
}


