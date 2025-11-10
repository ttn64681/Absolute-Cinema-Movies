package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.ShowTime;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ShowTimeRepository extends JpaRepository<ShowTime, Long> {

    /**
     * Returns distinct showtimes that have show entries for a given movie.
     * Uses movie_show relationship only.
     *
     * @param movieId movie primary key (used to find corresponding movie_show)
     * @return ordered list of LocalDate values (no duplicates), ascending
     */
    @Query(value = """
        SELECT DISTINCT st.show_time
        FROM show_time st
        INNER JOIN movie_show ms ON st.movie_show_id = ms.id
        WHERE ms.movie_id = :movieId
        ORDER BY st.show_time
    """, nativeQuery = true)
    List<java.sql.Timestamp> findAvailableTimesByMovieId(@Param("movieId") Long movieId);

    /**
     * Returns only the distinct calendar dates that have show entries for a given movie.
     * Uses movie_show relationship only.
     *
     * @param movieId movie primary key (used to find corresponding movie_show)
     * @return ordered list of LocalDate values (no duplicates), ascending
     */
    @Query(value = """
        SELECT DISTINCT st.show_time::date AS show_date
        FROM show_time st
        INNER JOIN movie_show ms ON st.movie_show_id = ms.id
        WHERE ms.movie_id = :movieId
        ORDER BY show_date
    """, nativeQuery = true)
    List<java.sql.Date> findAvailableDatesByMovieId(@Param("movieId") Long movieId);

    /**
     * Returns the times for a specific movie on a specific date.
     * Uses movie_show relationship only.
     */
    @Query(value = """
        SELECT DISTINCT st.show_time::time AS show_time
        FROM show_time st
        INNER JOIN movie_show ms ON st.movie_show_id = ms.id
        WHERE ms.movie_id = :movieId AND st.show_time::date = :showDate
        ORDER BY show_time
    """, nativeQuery = true)
    List<java.sql.Time> findTimesByMovieIdAndDate(@Param("movieId") Long movieId, @Param("showDate") LocalDate showDate);

    /**
     * Returns all ShowDate rows for a movie, ordered by date ascending.
     * Uses movie_show relationship only.
     */
    @Query(value = """
        SELECT st.* FROM show_time st 
        INNER JOIN movie_show ms ON st.movie_show_id = ms.id
        WHERE ms.movie_id = :movieId
        ORDER BY st.show_time
    """, nativeQuery = true)
    List<ShowTime> findByMovieId(@Param("movieId") Long movieId);
}


