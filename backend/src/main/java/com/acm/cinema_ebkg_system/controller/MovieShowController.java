package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.model.MovieShow;
import com.acm.cinema_ebkg_system.model.PaymentCard;
import com.acm.cinema_ebkg_system.model.Movie;
import com.acm.cinema_ebkg_system.model.ShowRoom;
import com.acm.cinema_ebkg_system.model.ShowTime;
import com.acm.cinema_ebkg_system.dto.movie.MovieShowDTO;
import com.acm.cinema_ebkg_system.dto.movie.MovieShowResponseDTO;
import com.acm.cinema_ebkg_system.service.MovieShowService;
import com.acm.cinema_ebkg_system.service.MovieService;
import com.acm.cinema_ebkg_system.service.ShowRoomService;
import com.acm.cinema_ebkg_system.service.ShowTimeService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDateTime;

/**
 * Movie Show Controller
 */
@RestController
@RequestMapping("/api/movie-shows")
public class MovieShowController {
    
    @Autowired // Spring automatically provides service instance (dependency injection)
    private MovieShowService movieShowService;
    private MovieService movieService;
    private ShowRoomService showRoomService;
    private ShowTimeService showTimeService;

    // Constructor injection - Spring automatically provides service instances
    public MovieShowController(MovieShowService movieShowService, MovieService movieService, ShowRoomService showRoomService, ShowTimeService showTimeService) {
        this.movieShowService = movieShowService;
        this.movieService = movieService;
        this.showRoomService = showRoomService;
        this.showTimeService = showTimeService;
    }
    
    /**
     * GET /api/movie-shows
     * Input: None
     * Returns: List<MovieShow> - All movie shows in system
     */
    @GetMapping
    public List<MovieShow> getAllMovieShows() {
        return movieShowService.getAllMovieShows();
    }
    
    /**
     * GET /api/movie-shows/movie/{movieId}
     * Input: movieId (Long) in URL path
     * Returns: List<MovieShowResponseDTO> - Contains a list of objects containing movie show ID, room ID, and showtime
     * Used for retrieving all movie shows associated with a movie.
     */
    @GetMapping("/movie/{movieId}")
    public List<MovieShowResponseDTO> getMovieShowsByMovie(@PathVariable Long movieId) {
        return movieShowService.getMovieShowsByMovieId(movieId);
    }
    
    /**
     * POST /api/movie-shows (admin only)
     * Input: MovieShow JSON body with {movie_id, show_room_id, and showtime}
     * Returns: MovieShow - Created show with ID and timestamps
     */
    @PostMapping
    public MovieShow createMovieShow(@RequestBody MovieShowDTO dto) {
        // Retrieve the movie and showroom by ID 
        Movie movie = movieService.getMovieById(dto.getMovieId());
        ShowRoom room = showRoomService.getShowRoomById(dto.getShowRoomId());

        // Get end time using the provided start time and the duration of the movie
        int durationMinutes = movie.getDuration();
        LocalDateTime startTime = LocalDateTime.parse(dto.getStartTime());
        LocalDateTime endTime = startTime.plusMinutes(durationMinutes);

        // Return the new MovieShow
        return movieShowService.scheduleMovieShow(movie, room, startTime, endTime);
    }
    
    /**
     * PUT /api/movie-shows/{movieShowId} (admin only)
     * Input: movieShowId (Long) in URL path, MovieShow JSON body with updated fields
     * Returns: MovieShow - Updated show
     */
    @PutMapping("/{movieShowId}")
    public MovieShow updateMovieShow(
            @PathVariable Long movieShowId,
            @RequestBody MovieShow movieShow) {
        movieShow.setId(movieShowId);
        return movieShowService.updateMovieShow(movieShow);
    }
    
    /**
     * DELETE /api/movie-shows/{movieShowId} (admin only)
     * Input: movieShowId (Long) in URL path
     * Returns: 200 OK - Show deleted (no body)
     */
    @DeleteMapping("/{movieShowId}")
    public ResponseEntity<Void> deleteMovieShow(@PathVariable Long movieShowId) {
        movieShowService.deleteMovieShow(movieShowId);
        return ResponseEntity.ok().build();
    }
}

