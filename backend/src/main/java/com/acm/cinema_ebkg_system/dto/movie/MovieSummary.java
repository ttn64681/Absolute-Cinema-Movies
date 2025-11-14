package com.acm.cinema_ebkg_system.dto.movie;

import com.acm.cinema_ebkg_system.model.Movie;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Lightweight movie summary for browsing -
 * excludes "heavy" fields like cast, directors, producers
 * Used for homepage, search results, and movie grids
 * 
 * Note: Use fromMovie() factory method to create instances.
 * Parameterized constructor is private to enforce use of factory method.
 * No-args constructor (from @NoArgsConstructor) is public for Jackson deserialization.
 */
@Getter
@Setter
@NoArgsConstructor
public class MovieSummary {
    private Long movie_id;
    private String title;
    private String status;
    private String genres;
    private String rating;
    private LocalDate release_date;
    private String synopsis; // Will be truncated to ~150 chars
    private String trailer_link;
    private String poster_link;
    
    // Private constructor - use fromMovie() factory method instead
    private MovieSummary(Long movie_id, String title, String status, String genres, 
                       String rating, LocalDate release_date, String synopsis, 
                       String trailer_link, String poster_link) {
        this.movie_id = movie_id;
        this.title = title;
        this.status = status;
        this.genres = genres;
        this.rating = rating;
        this.release_date = release_date;
        this.synopsis = synopsis;
        this.trailer_link = trailer_link;
        this.poster_link = poster_link;
    }
    
    /**
     * Factory method: Creates MovieSummary from Movie entity.
     * Handles synopsis truncation logic (max 150 chars).
     * 
     * @param movie Movie entity to convert
     * @return MovieSummary DTO with truncated synopsis
     */
    public static MovieSummary fromMovie(Movie movie) {
        String truncatedSynopsis = movie.getSynopsis();
        if (truncatedSynopsis != null && truncatedSynopsis.length() > 150) {
            truncatedSynopsis = truncatedSynopsis.substring(0, 147) + "...";
        }
        
        return new MovieSummary(
            movie.getMovie_id(),
            movie.getTitle(),
            movie.getStatus(),
            movie.getGenres(),
            movie.getRating(),
            movie.getRelease_date(),
            truncatedSynopsis,
            movie.getTrailer_link(),
            movie.getPoster_link()
        );
    }
}
