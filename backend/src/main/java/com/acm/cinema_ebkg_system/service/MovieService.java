package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.dto.movie.MovieSummary;
import com.acm.cinema_ebkg_system.dto.movie.PaginatedMovieResponse;
import com.acm.cinema_ebkg_system.model.Movie;
import com.acm.cinema_ebkg_system.repository.MovieRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors; // For converting List<Movie> to List<MovieSummary>

@Service // Spring service bean for business logic layer
public class MovieService {

    // ===== CONSTANTS ===== //
    private static final int MOVIES_PER_PAGE = 10; // 10 movies/page

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    // ===== PAGINATION HELPER METHODS ===== //
    /**
     * Converts Page<Movie> to PaginatedMovieResponse DTO.
     * Pattern: Helper method for code reuse
     */
    private PaginatedMovieResponse toPaginatedResponse(Page<Movie> moviePage) {
        List<MovieSummary> summaries = moviePage.getContent().stream()
                .map(MovieSummary::fromMovie)
                .collect(Collectors.toList());
        
        // int currentPage = moviePage.getNumber();
        // int totalPages = moviePage.getTotalPages();
        // long totalElements = moviePage.getTotalElements();
        
        // // Manually calculate hasNext/hasPrevious to ensure correctness
        // // Spring's hasNext() can be incorrect in some edge cases
        // boolean hasNext = currentPage < totalPages - 1;
        // boolean hasPrevious = currentPage > 0;
        
        return new PaginatedMovieResponse(
            summaries,
            moviePage.getNumber(),
            moviePage.getTotalPages(),
            moviePage.getTotalElements(),
            moviePage.hasNext(),
            moviePage.hasPrevious(),
            MOVIES_PER_PAGE
        );

        // return new PaginatedMovieResponse(
        //     summaries,
        //     currentPage,
        //     totalPages,
        //     totalElements,
        //     hasNext,
        //     hasPrevious,
        //     MOVIES_PER_PAGE
        // );
    }

    /**
     * Normalizes search parameters (converts blank strings to null).
     */
    private String normalizeStringParam(String param) {
        return (param != null && !param.isBlank()) ? param : null;
    }

    // // AND-based combined filters; blanks treated as nulls; genresCsv = OR across tokens; month/day/year each optional
    // // Return: List<Movie> (mixed NOW_PLAYING/UPCOMING)
    // // Example JSON: [ { "movie_id": 1, "status": "NOW_PLAYING", ... }, { "movie_id": 9, "status": "UPCOMING", ... } ]
    // public List<Movie> searchMovies(String title, String genres, Integer month, Integer day, Integer year) {
    //     String titleParam = (title != null && !title.isBlank()) ? title : null;
    //     // Multi-genre OR: pass the CSV string as-is (backend will match ANY token)
    //     String genresCsvParam = (genres != null && !genres.isBlank()) ? genres : null;
    //     Integer monthParam = month;
    //     Integer dayParam = day;
    //     Integer yearParam = year;

    //     // Return a mixed list matching AND across provided filters (unsorted by show_date).
    //     List<Movie> results = movieRepository.findByAndFilters(titleParam, genresCsvParam, monthParam, dayParam, yearParam);
    //     if (results != null && !results.isEmpty()) return results;

    //     // Fallback to previous behavior if no filters provided at all
    //     if (titleParam == null && genresCsvParam == null && monthParam == null && dayParam == null && yearParam == null) {
    //         return movieRepository.findAll();
    //     }
    //     return results;
    // }

    /**
     * NOW_PLAYING list ordered by earliest upcoming show_date.
     * Return: List<Movie>
     * Example JSON: [ { "movie_id": 2, "title": "Superman", ... }, ... ]
     */
    public List<Movie> getNowPlayingOrdered() {
        // Use repository custom query to get NOW_PLAYING movies ordered by show date
        return movieRepository.findNowPlayingOrderedByNextShowDate();
    }

    /**
     * UPCOMING list ordered by first show_date.
     * Return: List<Movie>
     * Example JSON: [ { "movie_id": 12, "title": "Materialists", ... }, ... ]
     */
    public List<Movie> getUpcomingOrdered() {
        // Use repository custom query to get UPCOMING movies ordered by show date
        return movieRepository.findUpcoming();
    }

    // ===== NON-PAGINATED SEARCH METHODS ===== //
    /**
     * Search NOW_PLAYING only, ordered by earliest show_date.
     * Return: List<Movie>
     * Example JSON: [ { "movie_id": 5, "status": "NOW_PLAYING", ... }, ... ]
     */
    public List<Movie> searchNowPlayingOrdered(String title, String genres, Integer month, Integer day, Integer year) {
        String t = normalizeStringParam(title);
        String g = normalizeStringParam(genres);
        return movieRepository.searchNowPlayingOrdered(t, g, month, day, year);
    }

    /**
     * Search UPCOMING only, ordered by earliest show_date.
     * Return: List<Movie>
     * Example JSON: [ { "movie_id": 9, "status": "UPCOMING", ... }, ... ]
     */
    public List<Movie> searchUpcomingOrdered(String title, String genres, Integer month, Integer day, Integer year) {
        String t = normalizeStringParam(title);
        String g = normalizeStringParam(genres);
        return movieRepository.searchUpcomingOrdered(t, g, month, day, year); 
    }

    // ===== PAGINATED BROWSING METHODS ===== //
    /**
     * Get paginated NOW_PLAYING movies (10/page).
     * Cached by page number. Eviction: 10min TTL, 100 entries max, or @CacheEvict on create/delete
     */
    @Cacheable(value = "nowPlayingMovies", key = "#page")
    public PaginatedMovieResponse getNowPlayingForBrowsingPaginated(int page) {
        Pageable pageable = PageRequest.of(page, MOVIES_PER_PAGE);
        Page<Movie> moviePage = movieRepository.findNowPlayingOrderedByNextShowDate(pageable);
        return toPaginatedResponse(moviePage);
    }

    /**
     * Get paginated UPCOMING movies (10/page).
     * Cached by page number. Eviction: 10min TTL, 100 entries max, or @CacheEvict on create/delete
     */
    @Cacheable(value = "upcomingMovies", key = "#page")
    public PaginatedMovieResponse getUpcomingForBrowsingPaginated(int page) {
        Pageable pageable = PageRequest.of(page, MOVIES_PER_PAGE);
        Page<Movie> moviePage = movieRepository.findUpcoming(pageable);
        return toPaginatedResponse(moviePage);
    }

    /**
     * Get paginated movies regardless of status (10/page).
     * Cached by page number. Eviction: 10min TTL, 100 entries max, or @CacheEvict on create/delete
     */
    
    public PaginatedMovieResponse getAllMoviesForBrowsingPaginated(int page) {
        Pageable pageable = PageRequest.of(page, MOVIES_PER_PAGE);
        Page<Movie> moviePage = movieRepository.findAllMovies(pageable);
        return toPaginatedResponse(moviePage);
    }

    // ===== PAGINATED SEARCH METHODS ===== //
    /**
     * Paginated search NOW_PLAYING (10/page).
     * Cached by search params + page. Eviction: 10min TTL, 100 entries max, or @CacheEvict on create/delete
     */
    @Cacheable(
        value = "searchNowPlayingMovies",
        key = "#title + '_' + (#genres != null ? #genres : 'null') + '_' + " +
            "(#month != null ? #month : 'null') + '_' + (#day != null ? #day : 'null') + '_' + " +
            "(#year != null ? #year : 'null') + '_' + #page"
    )
    public PaginatedMovieResponse searchNowPlayingPaginated(String title, String genres, Integer month, Integer day, Integer year, int page) {
        String t = normalizeStringParam(title);
        String g = normalizeStringParam(genres);
        
        Pageable pageable = PageRequest.of(page, MOVIES_PER_PAGE);
        Page<Movie> moviePage = movieRepository.searchNowPlayingOrdered(t, g, month, day, year, pageable);
        return toPaginatedResponse(moviePage);
    }

    /**
     * Paginated search UPCOMING (10/page).
     * Cached by search params + page. Eviction: 10min TTL, 100 entries max, or @CacheEvict on create/delete
     */
    @Cacheable(
        value = "searchUpcomingMovies",
        key = "#title + '_' + (#genres != null ? #genres : 'null') + '_' + " +
            "(#month != null ? #month : 'null') + '_' + (#day != null ? #day : 'null') + '_' + " +
            "(#year != null ? #year : 'null') + '_' + #page"
    )
    public PaginatedMovieResponse searchUpcomingPaginated(String title, String genres, Integer month, Integer day, Integer year, int page) {
        String t = normalizeStringParam(title);
        String g = normalizeStringParam(genres);
        
        Pageable pageable = PageRequest.of(page, MOVIES_PER_PAGE);
        Page<Movie> moviePage = movieRepository.searchUpcomingOrdered(t, g, month, day, year, pageable);
        return toPaginatedResponse(moviePage);
    }



    
    /**
     * Get all unique genres available in the system, ordered alphabetically.
     * Return: List<String>
     * Example JSON: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi"]
     */
    public List<String> getAvailableGenres() {
        // Use repository custom query to get distinct genres from all movies
        return movieRepository.findAllDistinctGenres();
    }

    /**
     * Simple test method - just get all movies without complex queries.
     */
    public List<Movie> getAllMoviesSimple() {
        // Use repository built-in method to get all movies from database
        return movieRepository.findAll();
    }

    /**
     * Test database connection with raw JDBC.
     */
    public String testDatabaseConnection() {
        try {
            // This will test if we can connect to the database
            long count = movieRepository.count();
            return "Database connection successful! Movie count: " + count;
        } catch (Exception e) {
            return "Database connection failed: " + e.getMessage();
        }
    }

    // ===== MOVIE CRUD OPERATIONS ===== //
    
    /**
     * Creates a new movie.
     * Handles DTO to Entity conversion 
     * Evicts all pagination caches (pagination changes when movie count changes)
     * 
     * @param movieDTO MovieDTO from controller
     * @return Persisted Movie entity
     */
    @CacheEvict(value = {"nowPlayingMovies", "upcomingMovies", "searchNowPlayingMovies", "searchUpcomingMovies"}, allEntries = true)
    public Movie createMovie(com.acm.cinema_ebkg_system.dto.movie.MovieDTO movieDTO) {
        // Business logic: DTO to Entity conversion
        Movie newMovie = new Movie();
        newMovie.setTitle(movieDTO.getTitle());
        newMovie.setStatus(com.acm.cinema_ebkg_system.enums.MovieStatus.upcoming); // default status (no shows scheduled)
        newMovie.setGenres(movieDTO.getGenres());
        newMovie.setRating(movieDTO.getRating());
        newMovie.setRelease_date(movieDTO.getRelease_date());
        newMovie.setSynopsis(movieDTO.getSynopsis());
        newMovie.setTrailer_link(movieDTO.getTrailer_link());
        newMovie.setPoster_link(movieDTO.getPoster_link());
        newMovie.setCast_names(movieDTO.getCast_names());
        newMovie.setDirectors(movieDTO.getDirectors());
        newMovie.setProducers(movieDTO.getProducers());
        newMovie.setScore(movieDTO.getScore());
        newMovie.setDuration(movieDTO.getDuration());
        
        return movieRepository.save(newMovie);
    }

    /**
     * Updates a movie's information.
     * Handles DTO to Entity conversion 
     * Evicts all pagination caches (pagination changes when movie count changes)
     * 
     * @param movieDTO MovieDTO from controller
     * @return Persisted Movie entity
     */
    @CacheEvict(value = {"nowPlayingMovies", "upcomingMovies", "searchNowPlayingMovies", "searchUpcomingMovies"}, allEntries = true)
    public Movie updateMovie(Long movieId, com.acm.cinema_ebkg_system.dto.movie.MovieDTO movieDTO) {
        // Business logic: DTO to Entity conversion

        // Retrieve the movie associated with the movie ID
        Movie updateMovie = getMovieById(movieId);

        // Update all attributes using the DTO
        updateMovie.setTitle(movieDTO.getTitle());
        updateMovie.setGenres(movieDTO.getGenres());
        updateMovie.setRating(movieDTO.getRating());
        updateMovie.setRelease_date(movieDTO.getRelease_date());
        updateMovie.setSynopsis(movieDTO.getSynopsis());
        updateMovie.setTrailer_link(movieDTO.getTrailer_link());
        updateMovie.setPoster_link(movieDTO.getPoster_link());
        updateMovie.setCast_names(movieDTO.getCast_names());
        updateMovie.setDirectors(movieDTO.getDirectors());
        updateMovie.setProducers(movieDTO.getProducers());
        updateMovie.setScore(movieDTO.getScore());
        updateMovie.setDuration(movieDTO.getDuration());
        
        // Save updated movie in database
        return movieRepository.save(updateMovie);
    }

    /**
     * Deletes a movie.
     * Evicts all pagination caches (pagination changes when movie count changes)
     */
    @CacheEvict(value = {"nowPlayingMovies", "upcomingMovies", "searchNowPlayingMovies", "searchUpcomingMovies"}, allEntries = true)
    public void deleteMovie(Long movieId) {
        // Get the movie by id
        Movie movie = movieRepository.findById(movieId)
            .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        // If the movie has no MovieShows, allow it to be deleted
        System.out.println(movie.getStatus());
        // if (movie.getStatus() == "UPCOMING") {
            movieRepository.deleteById(movieId);
        /* } else {
            System.out.println("hohohoho, no!");
            throw new RuntimeException("Cannot delete a movie that is still playing");
        }*/
        
    }




    // ===== LIGHTWEIGHT BROWSING ENDPOINTS ===== //
    // These endpoints use the above methods but return a lighter weight version of the data.

    // /**
    //  * Get movies for browsing (lightweight summaries only).
    //  * Return: List<MovieSummary> (mixed NOW_PLAYING/UPCOMING)
    //  */
    // public List<MovieSummary> getMoviesForBrowsing(String title, String genres, Integer month, Integer day, Integer year) {
    //     List<Movie> movies = searchMovies(title, genres, month, day, year);
    //     return movies.stream()
    //             .map(MovieSummary::fromMovie)
    //             .collect(Collectors.toList());
    // }

    /**
     * Get NOW_PLAYING movies for browsing (lightweight summaries only).
     * Return: List<MovieSummary>
     * @deprecated Use getNowPlayingForBrowsingPaginated instead
     */
    @Deprecated
    public List<MovieSummary> getNowPlayingForBrowsing() {
        List<Movie> movies = getNowPlayingOrdered();
        return movies.stream()
                .map(MovieSummary::fromMovie)
                .collect(Collectors.toList());
    }

    /**
     * Get UPCOMING movies for browsing (lightweight summaries only).
     * Return: List<MovieSummary>
     * @deprecated Use getUpcomingForBrowsingPaginated instead
     */
    @Deprecated
    public List<MovieSummary> getUpcomingForBrowsing() {
        List<Movie> movies = getUpcomingOrdered();
        return movies.stream()
                .map(MovieSummary::fromMovie)
                .collect(Collectors.toList());
    }


    /**
     * Get full movie details by ID (including cast, directors, producers).
     * Return: Movie (full entity)
     */
    public Movie getMovieById(Long movieId) {
        return movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + movieId));
    }

    /**
     * Get full movie details by title (including cast, directors, producers).
     * Return: Movie (full entity)
     */
    public Movie getMovieByTitle(String title) {
        return movieRepository.findByTitle(title)
                .orElseThrow(() -> new RuntimeException("Movie not found with title: " + title));
    }

}


