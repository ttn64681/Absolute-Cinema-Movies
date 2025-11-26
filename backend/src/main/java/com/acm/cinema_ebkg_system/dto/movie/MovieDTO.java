package com.acm.cinema_ebkg_system.dto.movie;

import com.acm.cinema_ebkg_system.model.Movie;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Setter;

/**
 * Movie DTO - Full movie entity data
 * 
 * Used by:
 * - MovieController.createMovie() -> Request (Admin creates movie)
 * - MovieController.getMovieById() -> Response (Virtual Proxy - returns full entity)
 * - MovieController.updateMovie() -> Request (Admin updates movie)
 * 
 * Contains complete movie information including cast, directors, producers
 * For browsing (lightweight), use MovieSummary instead
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MovieDTO {
    private Long movie_id;
    private String title;
    private String status;
    private String genres;
    private String rating;
    private LocalDate release_date;
    private String synopsis; 
    private String trailer_link;
    private String poster_link;
    private String cast_names;
    private String directors;
    private String producers;
    private int score;
    private int duration;
    
}
