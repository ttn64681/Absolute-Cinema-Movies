package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.dto.movie.MovieDTO;
import com.acm.cinema_ebkg_system.dto.movie.PaginatedMovieResponse;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import com.acm.cinema_ebkg_system.model.Movie;
import com.acm.cinema_ebkg_system.service.MovieService;
import com.acm.cinema_ebkg_system.service.ShowTimeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController // Bean that creates a RESTful controller class that handles HTTP requests
@RequestMapping("/api/movies")
@Validated // Enables method-level validation for @RequestParam/@PathVariable
public class MovieController {

    // Dependency injection of services for business logic
    private final MovieService movieService;
    private final ShowTimeService showTimeService;

    // Constructor injection - Spring automatically provides service instances
    public MovieController(MovieService movieService, ShowTimeService showTimeService) {
        this.movieService = movieService;
        this.showTimeService = showTimeService;
    }

    // ===== NON-PAGINATED ENDPOINTS ===== //
    /**
     * Get all now playing movies, ordered by earliest show_date.
     * Use when displaying the now playing movies on the homepage. (default behavior)
     */
    @GetMapping("/now-playing")
    public List<Movie> getNowPlaying() {
        return movieService.getNowPlayingOrdered();
    }

    /**
     * Get all upcoming movies, ordered by earliest show_date.
     * Use when clicking the "Upcoming" button on the homepage.
     */
    @GetMapping("/upcoming")
    public List<Movie> getUpcoming() {
        return movieService.getUpcomingOrdered();
    }

    /**
     * Get all unique genres available in the system, ordered alphabetically.
     * Use when displaying the genres on the homepage and
     * when clicking on the filters popup in navbar or Movies page.
     */
    @GetMapping("/genres")
    public List<String> getAvailableGenres() {
        return movieService.getAvailableGenres();
    }

    // ===== PAGINATED BROWSING ENDPOINTS ===== //
    /**
     * Paginated NOW_PLAYING movies (10/page). Validates page >= 0
     */
    @GetMapping("/browse/now-playing")
    public PaginatedMovieResponse getNowPlayingForBrowsingPaginated(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page number must be >= 0") int page) {
        return movieService.getNowPlayingForBrowsingPaginated(page);
    }

    /**
     * Paginated UPCOMING movies (10/page). Validates page >= 0
     */
    @GetMapping("/browse/upcoming")
    public PaginatedMovieResponse getUpcomingForBrowsingPaginated(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page number must be >= 0") int page) {
        return movieService.getUpcomingForBrowsingPaginated(page);
    }

    // ===== PAGINATED SEARCH ENDPOINTS ===== //
    /**
     * Paginated search NOW_PLAYING (10/page). Validates page >= 0
     */
    @GetMapping("/search-now-playing")
    public PaginatedMovieResponse searchNowPlayingPaginated(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genres,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer day,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page number must be >= 0") int page) {
        return movieService.searchNowPlayingPaginated(title, genres, month, day, year, page);
    }

    /**
     * Paginated search UPCOMING (10/page). Validates page >= 0
     */
    @GetMapping("/search-upcoming")
    public PaginatedMovieResponse searchUpcomingPaginated(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genres,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer day,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page number must be >= 0") int page) {
        return movieService.searchUpcomingPaginated(title, genres, month, day, year, page);
    }

    // ===== SHOWTIME ENDPOINTS ===== //
    /**
     * Get all available dates for a movie ordered by earliest show_date.
     * Use when displaying the dates for a movie.
     */
    @GetMapping("/{movieId}/dates")
    public List<LocalDate> getAvailableDates(@PathVariable Long movieId) {
        return showTimeService.getAvailableDatesForMovie(movieId);
    }

    /**
     * Get all available times for a movie on a certain date.
     * Use when displaying the times for a movie.
     */
    @GetMapping("/{movieId}/times")
    public List<String> getAvailableTimesForDate(@PathVariable Long movieId, @RequestParam String date) {
        LocalDate showDate = LocalDate.parse(date);
        return showTimeService.getAvailableTimesForMovieAndDate(movieId, showDate);
    }

    /**
     * Get all available showings of a movie (date and time combined).
     */
    @GetMapping("/{movieId}/times/combined")
    public List<LocalDateTime> getAvailableTimes(@PathVariable Long movieId) {
        return showTimeService.getAvailableTimesForMovie(movieId);
    }

    // @GetMapping("/{movieId}/schedule")
    // public Map<LocalDate, List<ShowTime>> getMovieSchedule(@PathVariable Long movieId) {
    //     // Frontend (optional convenience): fetch full schedule (dates -> times) in one call.
    //     // Return format (JSON): {"2025-10-01": [ShowTime, ...], "2025-10-02": [ShowTime, ...], ...}
    //     return showTimeService.getMovieShowSchedule(movieId);
    // }

    // ===== MOVIE DETAIL ENDPOINTS ===== //

    /**
     * Get full movie details by ID (including cast, directors, producers).
     * Called when selecting a movie for detailed view.
     */
    @GetMapping("/{movieId}")
    public Movie getMovieDetails(@PathVariable Long movieId) {
        return movieService.getMovieById(movieId);
    }

    /**
     * Get full movie details by title (including cast, directors, producers).
     * Called when searching for a movie by title.
     */
    @GetMapping("/title/{title}")
    public Movie getMovieDetailsByTitle(@PathVariable String title) {
        return movieService.getMovieByTitle(title);
    }

    // ===== MOVIE CRUD OPERATIONS ===== //
    /**
     * POST api/movies/create
     * Called when adding a new movie (when logged in as Admin).
     * 
     * Takes MovieDTO, delegates to service for entity creation and persistence.
     */
    @PostMapping("/create")
    public ResponseEntity<?> createMovie(@RequestBody MovieDTO dto) {
        try {
            Movie created = movieService.createMovie(dto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating movie: " + e.getMessage());
        }
    }

    /**
     * PUT api/movies/create
     * Called when editing a movie (when logged in as Admin).
     * 
     * Takes MovieDTO, delegates to service for entity creation and persistence.
     */
    @PutMapping("/{movieId}")
    public ResponseEntity<?> editMovie(@PathVariable Long movieId, @RequestBody MovieDTO dto) {
        try {
            Movie created = movieService.updateMovie(movieId, dto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating movie: " + e.getMessage());
        }
    }


    /**
     * DELETE /api/movies/{movieId}
     * Used to delete a movie.
     */
    @DeleteMapping("/{movieId}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long movieId) {
        movieService.deleteMovie(movieId);
        return ResponseEntity.ok().build();
    }

    // ===== TEST ENDPOINTS ===== //
    /**
     * Test endpoint to check if the API is working.
     */
    @GetMapping("/test")
    public String testEndpoint() {
        return "API is working!";
    }

    /**
     * Simple test endpoint - just get all movies without complex queries.
     */
    @GetMapping("/simple-test")
    public List<Movie> getSimpleTest() {
        return movieService.getAllMoviesSimple();
    }

    /**
     * Raw JDBC test to check database connection.
     */
    @GetMapping("/db-test")
    public String getDbTest() {
        return movieService.testDatabaseConnection();
    }

}