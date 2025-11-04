package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.Movie;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

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
     * Combined AND filters with optional parts and multi-genre OR (native Postgres).
     * - title: substring (optional)
     * - genresCsv: comma-separated; ANY token match (optional)
     * - date parts: match against show_date (each part optional)
     * Return: List<Movie> (mixed NOW_PLAYING/UPCOMING)
     * Example JSON: [ { "movie_id": 4, "status": "NOW_PLAYING", ... }, { "movie_id": 9, "status": "UPCOMING", ... } ]
     */
    @Query(value =
        "SELECT DISTINCT m.* FROM movie m " +
        "LEFT JOIN movie_show ms ON ms.movie_id = m.movie_id " +
        "LEFT JOIN show_date sd ON sd.movie_show_id = ms.id " +
        "WHERE " +
        "(:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
        "(:genresCsv IS NULL OR EXISTS ( " +
        "  SELECT 1 FROM unnest(string_to_array(:genresCsv, ',')) g " +
        "  WHERE LOWER(m.genres) LIKE LOWER(CONCAT('%', trim(g), '%')) " +
        ")) AND " +
        "(:month IS NULL OR EXTRACT(MONTH FROM sd.show_date) = :month) AND " +
        "(:day IS NULL OR EXTRACT(DAY FROM sd.show_date) = :day) AND " +
        "(:year IS NULL OR EXTRACT(YEAR FROM sd.show_date) = :year)",
        nativeQuery = true)
    List<Movie> findByAndFilters(@Param("title") String title,
                                 @Param("genresCsv") String genresCsv,
                                 @Param("month") Integer month,
                                 @Param("day") Integer day,
                                 @Param("year") Integer year);

    /**
     * NOW_PLAYING ordered by earliest upcoming show_date (>= today).
     * Return: List<Movie>
     * Example JSON: [ { "movie_id": 2, "title": "Superman", ... }, { "movie_id": 5, ... } ]
     */
    @Query(value = """
      SELECT m.* FROM movie m
      INNER JOIN movie_show ms ON ms.movie_id = m.movie_id
      INNER JOIN show_date sd ON sd.movie_show_id = ms.id
      WHERE ms.status = 'now_playing' AND sd.show_date >= CURRENT_DATE
      GROUP BY m.movie_id
      ORDER BY MIN(sd.show_date) ASC
    """, nativeQuery = true)
    List<Movie> findNowPlayingOrderedByNextShowDate();

    /**
     * UPCOMING ordered by first show_date (> today).
     * Return: List<Movie>
     * Example JSON: [ { "movie_id": 9, "title": "Oldboy", ... }, { "movie_id": 12, ... } ]
     */
    @Query(value = """
      SELECT m.* FROM movie m
      INNER JOIN movie_show ms ON ms.movie_id = m.movie_id
      INNER JOIN show_date sd ON sd.movie_show_id = ms.id
      WHERE ms.status = 'upcoming' AND sd.show_date > CURRENT_DATE
      GROUP BY m.movie_id
      ORDER BY MIN(sd.show_date) ASC
    """, nativeQuery = true)
    List<Movie> findUpcomingOrderedByFirstShowDate();

    /**
     * Search NOW_PLAYING ordered by earliest show_date.
     * Filters: AND across title/genres/date; OR within multiple genres.
     * Return: List<Movie>
     * Example JSON: [ { "movie_id": 2, "status": "NOW_PLAYING", ... }, ... ]
     */
    @Query(value = """
      SELECT m.* FROM movie m
      INNER JOIN movie_show ms ON ms.movie_id = m.movie_id
      WHERE ms.status = 'now_playing'
        AND (:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')))
        AND (:genresCsv IS NULL OR EXISTS (
             SELECT 1 FROM unnest(string_to_array(:genresCsv, ',')) g
             WHERE LOWER(m.genres) LIKE LOWER(CONCAT('%', trim(g), '%'))
        ))
        AND (
          (:month IS NULL AND :day IS NULL AND :year IS NULL) OR
          EXISTS (
            SELECT 1 FROM show_date sd 
            INNER JOIN movie_show ms2 ON sd.movie_show_id = ms2.id
            WHERE ms2.movie_id = m.movie_id 
              AND (:month IS NULL OR EXTRACT(MONTH FROM sd.show_date) = :month)
              AND (:day IS NULL OR EXTRACT(DAY FROM sd.show_date) = :day)
              AND (:year IS NULL OR EXTRACT(YEAR FROM sd.show_date) = :year)
          )
        )
      ORDER BY (
        SELECT MIN(sd.show_date) 
        FROM show_date sd 
        INNER JOIN movie_show ms3 ON sd.movie_show_id = ms3.id
        WHERE ms3.movie_id = m.movie_id
      ) ASC
    """, nativeQuery = true)
    List<Movie> searchNowPlayingOrdered(@Param("title") String title,
                                        @Param("genresCsv") String genresCsv,
                                        @Param("month") Integer month,
                                        @Param("day") Integer day,
                                        @Param("year") Integer year);

    /**
     * Search UPCOMING ordered by earliest show_date.
     * Filters: AND across title/genres/date; OR within multiple genres.
     * Return: List<Movie>
     * Example JSON: [ { "movie_id": 12, "status": "UPCOMING", ... }, ... ]
     */
    @Query(value = """
      SELECT m.* FROM movie m
      INNER JOIN movie_show ms ON ms.movie_id = m.movie_id
      WHERE ms.status = 'upcoming'
        AND (:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')))
        AND (:genresCsv IS NULL OR EXISTS (
             SELECT 1 FROM unnest(string_to_array(:genresCsv, ',')) g
             WHERE LOWER(m.genres) LIKE LOWER(CONCAT('%', trim(g), '%'))
        ))
        AND (
          (:month IS NULL AND :day IS NULL AND :year IS NULL) OR
          EXISTS (
            SELECT 1 FROM show_date sd 
            INNER JOIN movie_show ms2 ON sd.movie_show_id = ms2.id
            WHERE ms2.movie_id = m.movie_id 
              AND (:month IS NULL OR EXTRACT(MONTH FROM sd.show_date) = :month)
              AND (:day IS NULL OR EXTRACT(DAY FROM sd.show_date) = :day)
              AND (:year IS NULL OR EXTRACT(YEAR FROM sd.show_date) = :year)
          )
        )
      ORDER BY (
        SELECT MIN(sd.show_date) 
        FROM show_date sd 
        INNER JOIN movie_show ms3 ON sd.movie_show_id = ms3.id
        WHERE ms3.movie_id = m.movie_id
      ) ASC
    """, nativeQuery = true)
    List<Movie> searchUpcomingOrdered(@Param("title") String title,
                                      @Param("genresCsv") String genresCsv,
                                      @Param("month") Integer month,
                                      @Param("day") Integer day,
                                      @Param("year") Integer year);

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


