package com.acm.cinema_ebkg_system.dto.movie;

import com.acm.cinema_ebkg_system.model.Movie;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Setter;

/**
 * Complete set of Movie attributes.
 * Used when the Admin adds a new Movie.
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
