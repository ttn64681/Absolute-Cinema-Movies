package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.model.MovieShow;
import com.acm.cinema_ebkg_system.repository.MovieShowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Movie Show Service
 */
@Service
public class MovieShowService {
    
    @Autowired // Spring automatically provides repository instance (dependency injection)
    private MovieShowRepository movieShowRepository;
    
    /**
     * Get all movie shows
     * @return List<MovieShow> - All movie shows in system
     */
    public List<MovieShow> getAllMovieShows() {
        return movieShowRepository.findAll();
    }
    
    /**
     * Get movie shows by movie ID
     * @param movieId - Long: Movie ID
     * @return List<MovieShow> - All shows for this movie
     */
    public List<MovieShow> getMovieShowsByMovieId(Long movieId) {
        return movieShowRepository.findByMovieId(movieId);
    }
    
    /**
     * Get movie shows by room ID
     * @param showRoomId - Long: Show room ID
     * @return List<MovieShow> - All shows in this room
     */
    public List<MovieShow> getMovieShowsByRoomId(Long showRoomId) {
        return movieShowRepository.findByShowRoomId(showRoomId);
    }
    
    /**
     * Get movie shows by status
     * @param status - String: "now_playing" or "upcoming"
     * @return List<MovieShow> - All shows with this status
     */
    // public List<MovieShow> getMovieShowsByStatus(String status) {
    //     return movieShowRepository.findByStatus(status);
    // }
    
    /**
     * Create a new movie show (admin only)
     * @param movieShow - MovieShow: Show object with movie_id, show_room_id, status
     * @return MovieShow: Created show with ID and timestamps
     */
    public MovieShow createMovieShow(MovieShow movieShow) {
        return movieShowRepository.save(movieShow);
    }
    
    /**
     * Update an existing movie show (admin only)
     * @param movieShow - MovieShow: Show object with ID and updated fields
     * @return MovieShow: Updated show
     */
    public MovieShow updateMovieShow(MovieShow movieShow) {
        return movieShowRepository.save(movieShow);
    }
    
    /**
     * Delete a movie show (admin only)
     * @param movieShowId - Long: Show ID to delete
     */
    public void deleteMovieShow(Long movieShowId) {
        movieShowRepository.deleteById(movieShowId);
    }
}

