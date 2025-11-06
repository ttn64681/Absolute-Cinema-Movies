package com.acm.cinema_ebkg_system.controller;

import com.acm.cinema_ebkg_system.dto.movie.MovieSummary;
import com.acm.cinema_ebkg_system.dto.movie.MovieInfo;
import com.acm.cinema_ebkg_system.model.Movie;
import com.acm.cinema_ebkg_system.model.PaymentCard;
import com.acm.cinema_ebkg_system.model.ShowTime;
import com.acm.cinema_ebkg_system.service.MovieService;
import com.acm.cinema_ebkg_system.service.ShowTimeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController // Bean that creates a RESTful controller class that handles HTTP requests
@RequestMapping("/api/movies")
public class MovieController {

    // Dependency injection of services for business logic
    private final MovieService movieService;
    private final ShowTimeService showTimeService;

    // Constructor injection - Spring automatically provides service instances
    public MovieController(MovieService movieService, ShowTimeService showTimeService) {
        this.movieService = movieService;
        this.showTimeService = showTimeService;
    }

    /**
     * Get all now playing movies, ordered by earliest show_date.
     * Use when displaying the now playing movies on the homepage. (default behavior)
     * @return
     */
    @GetMapping("/now-playing")
    public List<Movie> getNowPlaying() {
        // Return JSON: [ { "movie_id": 2, "title": "Superman", ... }, ... ] (NOW_PLAYING ordered by earliest show_date)
        return movieService.getNowPlayingOrdered();
    }

    /**
     * Get all upcoming movies, ordered by earliest show_date.
     * Use when clicking the "Upcoming" button on the homepage.
     * @return
     */
    @GetMapping("/upcoming")
    public List<Movie> getUpcoming() {
        // Return JSON: [ { "movie_id": 12, "title": "Materialists", ... }, ... ] (UPCOMING ordered by first show_date)
        return movieService.getUpcomingOrdered();
    }

    /**
     * Get all unique genres available in the system, ordered alphabetically.
     * Use when displaying the genres on the homepage and
     * when clicking on the filters popup in navbar or Movies page.
     */
    @GetMapping("/genres")
    public List<String> getAvailableGenres() {
        // Return JSON: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi"] (sorted alphabetically)
        return movieService.getAvailableGenres();
    }

    /**
     * Search for movies based on AND filters title, genres (internal OR), 
     * and date (month, day, year) (internal OR).
     * Use when searching for movies via search bar.
     */
    @GetMapping("/search-now-playing")
    public List<Movie> searchNowPlaying(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genres,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer day,
            @RequestParam(required = false) Integer year) {
        // Return JSON: [ { "movie_id": 5, "status": "NOW_PLAYING", ... }, ... ] (ordered by earliest show_date)
        return movieService.searchNowPlayingOrdered(title, genres, month, day, year);
    }

    /**
     * Search for upcoming movies based on AND filters title, genres (internal OR), 
     * and date (month, day, year) (internal OR).
     * Use when searching for movies via search bar.
     */
    @GetMapping("/search-upcoming")
    public List<Movie> searchUpcoming(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genres,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer day,
            @RequestParam(required = false) Integer year) {
        // Return JSON: [ { "movie_id": 9, "status": "UPCOMING", ... }, ... ] (ordered by earliest show_date)
        return movieService.searchUpcomingOrdered(title, genres, month, day, year);
    }

    /**
     * Test endpoint to check if the API is working.
     * Use when testing the API.
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

    /**
     * Get all available dates for a movie ordered by earliest show_date.
     * Use when displaying the dates for a movie.
     */
    @GetMapping("/{movieId}/dates")
    public List<LocalDate> getAvailableDates(@PathVariable Long movieId) {
        // Frontend: call this first to populate the date dropdown for a selected movie.
        // Return format (JSON): ["2025-10-01", "2025-10-02", ...]
        return showTimeService.getAvailableDatesForMovie(movieId);
    }

    /**
     * Get all available times for a movie on a given date ordered by start_time.
     * Use when displaying the times for a movie.
     */
    @GetMapping("/{movieId}/times")
    public List<ShowTime> getAvailableTimes(@PathVariable Long movieId, @RequestParam String date) {
        // Frontend: when user picks a date from the dropdown, call this with that date.
        // Return format (JSON): array of ShowTime objects, e.g.
        // [{"show_time_id": 123, "show_date_id": 45, "start_time": "10:00:00", "end_time": "12:30:00", "created_at": "2025-09-26T12:00:00"}, ...]
        LocalDate showDate = LocalDate.parse(date);
        return showTimeService.getAvailableTimesForMovieAndDate(movieId, showDate);
    }

    // @GetMapping("/{movieId}/schedule")
    // public Map<LocalDate, List<ShowTime>> getMovieSchedule(@PathVariable Long movieId) {
    //     // Frontend (optional convenience): fetch full schedule (dates -> times) in one call.
    //     // Return format (JSON): {"2025-10-01": [ShowTime, ...], "2025-10-02": [ShowTime, ...], ...}
    //     return showTimeService.getMovieShowSchedule(movieId);
    // }






    // ===== OPTIMIZED BROWSING ENDPOINTS =====

    /**
     * Get lightweight movie summaries for browsing (excludes cast, directors, producers).
     * Perfect for homepage, search results, and movie grids.
     */
    // @GetMapping("/browse")
    // public List<MovieSummary> getMoviesForBrowsing(
    //         @RequestParam(required = false) String title,
    //         @RequestParam(required = false) String genres,
    //         @RequestParam(required = false) Integer month,
    //         @RequestParam(required = false) Integer day,
    //         @RequestParam(required = false) Integer year) {
    //     return movieService.getMoviesForBrowsing(title, genres, month, day, year);
    // }

    /**
     * Lightweight version of getNowPlaying() for browsing.
     */
    @GetMapping("/browse/now-playing")
    public List<MovieSummary> getNowPlayingForBrowsing() {
        return movieService.getNowPlayingForBrowsing();
    }

    /**
     * Lightweight version of getUpcoming() for browsing.
     */
    @GetMapping("/browse/upcoming")
    public List<MovieSummary> getUpcomingForBrowsing() {
        return movieService.getUpcomingForBrowsing();
    }


    /**
     * Get full movie details by ID (including cast, directors, producers).
     * Use this only when user clicks on a movie for detailed view.
     */
    @GetMapping("/{movieId}")
    public Movie getMovieDetails(@PathVariable Long movieId) {
        return movieService.getMovieById(movieId);
    }

    /**
     * POST api/movies/create
     * Use when adding a new movie (when logged in as Admin).
     */
    @PostMapping("/create")
    public ResponseEntity<?> createMovie(@RequestBody MovieInfo dto) {
        try {
            // Create a new Movie object
            Movie newMovie = new Movie();
            newMovie.setTitle(dto.getTitle());
            newMovie.setStatus("UPCOMING"); // default status (no movie shows scheduled)
            newMovie.setGenres(dto.getGenres());
            newMovie.setRating(dto.getRating());
            newMovie.setRelease_date(dto.getRelease_date());
            newMovie.setSynopsis(dto.getSynopsis());
            newMovie.setTrailer_link(dto.getTrailer_link());
            newMovie.setPoster_link(dto.getPoster_link());
            newMovie.setCast_names(dto.getCast_names());
            newMovie.setDirectors(dto.getDirectors());
            newMovie.setProducers(dto.getProducers());
            newMovie.setScore(dto.getScore());
            newMovie.setDuration(dto.getDuration());

            Movie created = movieService.createMovie(newMovie);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating movie: " + e.getMessage());
        }

    }

    /**
     * DELETE /api/movies/{movieId}
     * Input: movie_id (Long) in URL path
     * Used to delete a movie.
     */
    @DeleteMapping("/{movieId}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long movieId) {
        movieService.deleteMovie(movieId);
        return ResponseEntity.ok().build();
    }

}