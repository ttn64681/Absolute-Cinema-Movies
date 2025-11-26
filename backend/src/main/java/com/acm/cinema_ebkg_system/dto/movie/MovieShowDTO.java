package com.acm.cinema_ebkg_system.dto.movie;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

import com.acm.cinema_ebkg_system.model.Movie;
import com.acm.cinema_ebkg_system.model.ShowRoom;

/**
 * Movie Show Request DTO - Sent FROM frontend TO backend (Admin creates showtime)
 * 
 * Used by:
 * - ShowController.createShow() -> Request (Admin creates showtime)
 * 
 * Represents a scheduled showing of a movie in a specific room at a specific time
 */
@Data
public class MovieShowDTO {
    private Long movieId;
    private Long showRoomId;
    private String startTime;
}
