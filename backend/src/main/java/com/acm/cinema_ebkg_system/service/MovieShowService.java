package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.model.Movie;
import com.acm.cinema_ebkg_system.model.MovieShow;
import com.acm.cinema_ebkg_system.model.ShowRoom;
import com.acm.cinema_ebkg_system.model.ShowTime;
import com.acm.cinema_ebkg_system.repository.MovieShowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDateTime;

/**
 * Movie Show Service
 */
@Service
public class MovieShowService {
    
    @Autowired // Spring automatically provides repository instance (dependency injection)
    private MovieShowRepository movieShowRepository;
    private ShowTimeService showTimeService;
    
    public MovieShowService(ShowTimeService showTimeService) {
        this.showTimeService = showTimeService;
    }
    
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
    public MovieShow scheduleMovieShow(Movie movie, ShowRoom room, LocalDateTime startTime, LocalDateTime endTime){
        try {
            // Check for time conflicts before attempting to schedule
            List<MovieShow> conflictingShows = movieShowRepository.findOverlappingMovieShows(room.getId(), startTime, endTime);

            // If there is even a single conflicting show in the list, deny creation of the movie show.
            if (!conflictingShows.isEmpty()) {
                throw new Exception("There is already a movie show scheduled at this time and location. Please choose a different start time or showroom.");
            } else {
                // Create new MovieShow object
                MovieShow newShow = new MovieShow();
                newShow.setMovie(movie);
                newShow.setShowRoom(room);
                newShow.setAvailableSeats(room.getCapacity()); // starting available seats depends on showroom capacity

                // Save new MovieShow in the database
                MovieShow createdShow = movieShowRepository.save(newShow);

                // Create the ShowTime and link it to the MovieShow
                ShowTime newTime = new ShowTime();
                newTime.setShowTime(startTime); 
                newTime.setMovieShow(createdShow);

                // Save ShowTime in the database
                ShowTime createdTime = showTimeService.createShowTime(newTime);

                // Link the MovieShow to the ShowTime
                createdShow.setShowTime(createdTime);
                return movieShowRepository.save(createdShow);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error creating movie show: " + e.getMessage());
        }
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

