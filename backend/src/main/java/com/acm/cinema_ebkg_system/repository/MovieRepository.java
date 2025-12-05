package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.Movie;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * JpaRepository<Movie, Long>: Generic type = (EntityType, IDType)
 */
@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    // Automatic methods:
    // findAll(), findById(movie_id), save(), delete(), deleteById(), flush(), saveAndFlush(), etc.

    // /**
    //  * Title substring search (case-insensitive).
    //  * Return: List<Movie>
    //  * Example JSON: [ { "movie_id": 1, "title": "Godzilla Minus One", ... } ]
    //  */
    // List<Movie> findByTitleContainingIgnoreCase(String titlePart);
    
    // /**
    //  * Genres substring search (case-insensitive) for a single term.
    //  * Return: List<Movie>
    //  * Example JSON: [ { "movie_id": 2, "genres": "Action, Sci-Fi", ... } ]
    //  */
    // @Query("SELECT m FROM Movie m WHERE LOWER(m.genres) LIKE LOWER(CONCAT('%', :genre, '%'))")
    // List<Movie> findByGenresContainingIgnoreCase(@Param("genre") String genre);

    // /**
    //  * Exact release date match using month/day/year on release_date.
    //  * Return: List<Movie>
    //  * Example JSON: [ { "movie_id": 3, "release_date": "2025-07-11", ... } ]
    //  */
    // @Query("select m from Movie m where EXTRACT(MONTH FROM m.release_date) = :month and EXTRACT(DAY FROM m.release_date) = :day and EXTRACT(YEAR FROM m.release_date) = :year")
    // List<Movie> findByReleaseMonthDayYear(@Param("month") int month, @Param("day") int day, @Param("year") int year);

    /**
     * Combined AND filters w/ optional parts and multi-genre OR.
     * - title: substring (optional)
     * - genresCsv: comma-separated; ANY token match (optional)
     * - date parts: match against show_time (each part optional)
     * Return: List<Movie> (mixed now_playing/upcoming)
     * Example JSON: [ { "movie_id": 4, "status": "now_playing", ... }, { "movie_id": 9, "status": "upcoming", ... } ]
     */

    // Look up a movie by title
    @Query("SELECT m FROM Movie m WHERE m.title = :title")
    Optional<Movie> findByTitle(@Param("title") String title);


    @Query(value =
        "SELECT DISTINCT m.* FROM movie m " +
        "LEFT JOIN movie_show ms ON ms.movie_id = m.movie_id " +
        "LEFT JOIN show_time st ON st.movie_show_id = ms.id " +
        "WHERE " +
        "(:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
        "(:genresCsv IS NULL OR EXISTS ( " +
        "  SELECT 1 FROM unnest(string_to_array(:genresCsv, ',')) g " +
        "  WHERE LOWER(m.genres) LIKE LOWER(CONCAT('%', trim(g), '%')) " +
        ")) AND " +
        "(:month IS NULL OR EXTRACT(MONTH FROM st.show_time) = :month) AND " +
        "(:day IS NULL OR EXTRACT(DAY FROM st.show_time) = :day) AND " +
        "(:year IS NULL OR EXTRACT(YEAR FROM st.show_time) = :year)",
        nativeQuery = true)
    List<Movie> findByAndFilters(@Param("title") String title,
                                 @Param("genresCsv") String genresCsv,
                                 @Param("month") Integer month,
                                 @Param("day") Integer day,
                                 @Param("year") Integer year);

    /**
     * now_playing ordered by score (highest first).
     * Return: List<Movie>
     * Example JSON: [ { "movie_id": 2, "title": "Superman", ... }, { "movie_id": 5, ... } ]
     */
    @Query(value = """
      SELECT m.* FROM movie m
      INNER JOIN movie_show ms ON ms.movie_id = m.movie_id
      INNER JOIN show_time st ON st.movie_show_id = ms.id
      WHERE m.status = 'now_playing' AND st.show_time >= CURRENT_DATE
      GROUP BY m.movie_id
      ORDER BY m.score DESC
    """, nativeQuery = true)
    List<Movie> findNowPlayingOrderedByNextShowDate();
    
    /**
     * Paginated NOW_PLAYING ordered by score (highest first).
     * Pattern: Repository Pattern. Cached at service layer.
     */
    @Query(value = """
      SELECT m.* FROM movie m
      INNER JOIN movie_show ms ON ms.movie_id = m.movie_id
      INNER JOIN show_time st ON st.movie_show_id = ms.id
      WHERE m.status = 'now_playing' AND st.show_time >= CURRENT_DATE
      GROUP BY m.movie_id
      ORDER BY m.score DESC
    """, 
    countQuery = """
      SELECT COUNT(DISTINCT m.movie_id) FROM movie m
      INNER JOIN movie_show ms ON ms.movie_id = m.movie_id
      INNER JOIN show_time st ON st.movie_show_id = ms.id
      WHERE m.status = 'now_playing' AND st.show_time >= CURRENT_DATE
    """,
    nativeQuery = true)
    Page<Movie> findNowPlayingOrderedByNextShowDate(Pageable pageable);

    /**
     * upcoming ordered by score (highest first).
     * Return: List<Movie>
     * Example JSON: [ { "movie_id": 9, "title": "Oldboy", ... }, { "movie_id": 12, ... } ]
     */
    @Query(value = """
      SELECT m.* FROM movie m
      WHERE m.status = 'upcoming'
      GROUP BY m.movie_id
      ORDER BY m.score DESC
    """, nativeQuery = true)
    List<Movie> findUpcoming();

    /**
     * Paginated UPCOMING ordered by score (highest first).
     * Pattern: Repository Pattern. Cached at service layer.
     */
    @Query(value = """
      SELECT m.* FROM movie m
      WHERE m.status = 'upcoming'
      GROUP BY m.movie_id
      ORDER BY m.score DESC
    """, 
    countQuery = """
      SELECT COUNT(DISTINCT m.movie_id) FROM movie m
      WHERE m.status = 'upcoming'
    """,
    nativeQuery = true)
    Page<Movie> findUpcoming(Pageable pageable);

    /**
     * Paginated movies (regardless of status) ordered by score (highest first).
     * Pattern: Repository Pattern. Cached at service layer.
     */
    @Query(value = """
      SELECT m.* FROM movie m
      GROUP BY m.movie_id
      ORDER BY m.score DESC
    """, 
    countQuery = """
      SELECT COUNT(DISTINCT m.movie_id) FROM movie m
    """,
    nativeQuery = true)
    Page<Movie> findAllMovies(Pageable pageable);

    /**
     * Search now_playing ordered by score (highest first).
     * Filters: AND across title/genres/date; OR within multiple genres.
     * Return: List<Movie>
     * Example JSON: [ { "movie_id": 2, "status": "now_playing", ... }, ... ]
     */
    @Query(value = """
      SELECT m.* FROM movie m
      INNER JOIN movie_show ms ON ms.movie_id = m.movie_id
      LEFT JOIN show_time st ON st.movie_show_id = ms.id
      WHERE m.status = 'now_playing'
        AND (:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')))
        AND (:genresCsv IS NULL OR EXISTS (
          SELECT 1 FROM unnest(string_to_array(:genresCsv, ',')) g
          WHERE LOWER(m.genres) LIKE LOWER(CONCAT('%', trim(g), '%'))
        ))
        AND (
          (:month IS NULL AND :day IS NULL AND :year IS NULL) OR
          EXISTS (
            SELECT 1 FROM show_time st2 
            INNER JOIN movie_show ms2 ON st2.movie_show_id = ms2.id
            WHERE ms2.movie_id = m.movie_id 
            AND (:month IS NULL OR EXTRACT(MONTH FROM st2.show_time) = :month)
            AND (:day IS NULL OR EXTRACT(DAY FROM st2.show_time) = :day)
            AND (:year IS NULL OR EXTRACT(YEAR FROM st2.show_time) = :year)
          )
        )
      GROUP BY m.movie_id, m.title, m.status, m.genres, m.release_date, m.rating, m.synopsis, m.trailer_link, m.poster_link, m.cast_names, m.directors, m.producers, m.score, m.duration
      ORDER BY m.score DESC
    """, nativeQuery = true)
    List<Movie> searchNowPlayingOrdered(@Param("title") String title,
                                        @Param("genresCsv") String genresCsv,
                                        @Param("month") Integer month,
                                        @Param("day") Integer day,
                                        @Param("year") Integer year);

    /**
     * Paginated search NOW_PLAYING ordered by score (highest first).
     * Pattern: Repository Pattern. Cached at service layer.
     */
    @Query(value = """
      SELECT m.* FROM movie m
      INNER JOIN movie_show ms ON ms.movie_id = m.movie_id
      LEFT JOIN show_time st ON st.movie_show_id = ms.id
      WHERE m.status = 'now_playing'
        AND (:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')))
        AND (:genresCsv IS NULL OR EXISTS (
          SELECT 1 FROM unnest(string_to_array(:genresCsv, ',')) g
          WHERE LOWER(m.genres) LIKE LOWER(CONCAT('%', trim(g), '%'))
        ))
        AND (
          (:month IS NULL AND :day IS NULL AND :year IS NULL) OR
          EXISTS (
            SELECT 1 FROM show_time st2 
            INNER JOIN movie_show ms2 ON st2.movie_show_id = ms2.id
            WHERE ms2.movie_id = m.movie_id 
            AND (:month IS NULL OR EXTRACT(MONTH FROM st2.show_time) = :month)
            AND (:day IS NULL OR EXTRACT(DAY FROM st2.show_time) = :day)
            AND (:year IS NULL OR EXTRACT(YEAR FROM st2.show_time) = :year)
          )
        )
      GROUP BY m.movie_id, m.title, m.status, m.genres, m.release_date, m.rating, m.synopsis, m.trailer_link, m.poster_link, m.cast_names, m.directors, m.producers, m.score, m.duration
      ORDER BY m.score DESC
    """,
    countQuery = """
      SELECT COUNT(DISTINCT m.movie_id) FROM movie m
      INNER JOIN movie_show ms ON ms.movie_id = m.movie_id
      LEFT JOIN show_time st ON st.movie_show_id = ms.id
      WHERE m.status = 'now_playing'
        AND (:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')))
        AND (:genresCsv IS NULL OR EXISTS (
          SELECT 1 FROM unnest(string_to_array(:genresCsv, ',')) g
          WHERE LOWER(m.genres) LIKE LOWER(CONCAT('%', trim(g), '%'))
        ))
        AND (
          (:month IS NULL AND :day IS NULL AND :year IS NULL) OR
          EXISTS (
            SELECT 1 FROM show_time st2 
            INNER JOIN movie_show ms2 ON st2.movie_show_id = ms2.id
            WHERE ms2.movie_id = m.movie_id 
            AND (:month IS NULL OR EXTRACT(MONTH FROM st2.show_time) = :month)
            AND (:day IS NULL OR EXTRACT(DAY FROM st2.show_time) = :day)
            AND (:year IS NULL OR EXTRACT(YEAR FROM st2.show_time) = :year)
          )
        )
    """,
    nativeQuery = true)
    Page<Movie> searchNowPlayingOrdered(@Param("title") String title,
                                        @Param("genresCsv") String genresCsv,
                                        @Param("month") Integer month,
                                        @Param("day") Integer day,
                                        @Param("year") Integer year,
                                        Pageable pageable);

    /**
     * Search upcoming ordered by score (highest first).
     * Filters: AND across title/genres/date; OR within multiple genres.
     * Return: List<Movie>
     * Example JSON: [ { "movie_id": 12, "status": "upcoming", ... }, ... ]
     */
    @Query(value = """
      SELECT m.* FROM movie m
      INNER JOIN movie_show ms ON ms.movie_id = m.movie_id
      WHERE m.status = 'upcoming'
        AND (:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')))
        AND (:genresCsv IS NULL OR EXISTS (
             SELECT 1 FROM unnest(string_to_array(:genresCsv, ',')) g
             WHERE LOWER(m.genres) LIKE LOWER(CONCAT('%', trim(g), '%'))
        ))
        AND (
          (:month IS NULL AND :day IS NULL AND :year IS NULL) OR
          EXISTS (
            SELECT 1 FROM show_time st 
            INNER JOIN movie_show ms2 ON st.movie_show_id = ms2.id
            WHERE ms2.movie_id = m.movie_id 
              AND (:month IS NULL OR EXTRACT(MONTH FROM st.show_time) = :month)
              AND (:day IS NULL OR EXTRACT(DAY FROM st.show_time) = :day)
              AND (:year IS NULL OR EXTRACT(YEAR FROM st.show_time) = :year)
          )
        )
      ORDER BY m.score DESC
    """, nativeQuery = true)
    List<Movie> searchUpcomingOrdered(@Param("title") String title,
                                      @Param("genresCsv") String genresCsv,
                                      @Param("month") Integer month,
                                      @Param("day") Integer day,
                                      @Param("year") Integer year);

    /**
     * Paginated search UPCOMING ordered by score (highest first).
     * Pattern: Repository Pattern. Cached at service layer.
     * Uses LEFT JOIN to include movies without movie_show records.
     */
    @Query(value = """
      SELECT m.* FROM movie m
      LEFT JOIN movie_show ms ON ms.movie_id = m.movie_id
      LEFT JOIN show_time st ON st.movie_show_id = ms.id
      WHERE m.status = 'upcoming'
        AND (:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')))
        AND (:genresCsv IS NULL OR EXISTS (
             SELECT 1 FROM unnest(string_to_array(:genresCsv, ',')) g
             WHERE LOWER(m.genres) LIKE LOWER(CONCAT('%', trim(g), '%'))
        ))
        AND (
          (:month IS NULL AND :day IS NULL AND :year IS NULL) OR
          EXISTS (
            SELECT 1 FROM show_time st2 
            INNER JOIN movie_show ms2 ON st2.movie_show_id = ms2.id
            WHERE ms2.movie_id = m.movie_id 
              AND (:month IS NULL OR EXTRACT(MONTH FROM st2.show_time) = :month)
              AND (:day IS NULL OR EXTRACT(DAY FROM st2.show_time) = :day)
              AND (:year IS NULL OR EXTRACT(YEAR FROM st2.show_time) = :year)
          )
        )
      GROUP BY m.movie_id, m.title, m.status, m.genres, m.release_date, m.rating, m.synopsis, m.trailer_link, m.poster_link, m.cast_names, m.directors, m.producers, m.score, m.duration
      ORDER BY m.score DESC
    """,
    countQuery = """
      SELECT COUNT(DISTINCT m.movie_id) FROM movie m
      WHERE m.status = 'upcoming'
        AND (:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')))
        AND (:genresCsv IS NULL OR EXISTS (
             SELECT 1 FROM unnest(string_to_array(:genresCsv, ',')) g
             WHERE LOWER(m.genres) LIKE LOWER(CONCAT('%', trim(g), '%'))
        ))
        AND (
          (:month IS NULL AND :day IS NULL AND :year IS NULL) OR
          EXISTS (
            SELECT 1 FROM show_time st 
            INNER JOIN movie_show ms2 ON st.movie_show_id = ms2.id
            WHERE ms2.movie_id = m.movie_id 
              AND (:month IS NULL OR EXTRACT(MONTH FROM st.show_time) = :month)
              AND (:day IS NULL OR EXTRACT(DAY FROM st.show_time) = :day)
              AND (:year IS NULL OR EXTRACT(YEAR FROM st.show_time) = :year)
          )
        )
    """,
    nativeQuery = true)
    Page<Movie> searchUpcomingOrdered(@Param("title") String title,
                                      @Param("genresCsv") String genresCsv,
                                      @Param("month") Integer month,
                                      @Param("day") Integer day,
                                      @Param("year") Integer year,
                                      Pageable pageable);

    /**
     * Get all unique genres from all movie.
     * Return: List<String> of unique genre names (sorted alphabetically)
     * Example JSON: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi"]
     */
    @Query(value = """
        SELECT DISTINCT trim(unnest(string_to_array(genres, ','))) as genre
        FROM movie 
        WHERE genres IS NOT NULL AND genres != ''
        ORDER BY genre ASC
    """, nativeQuery = true)
    List<String> findAllDistinctGenres();
} 


