package com.acm.cinema_ebkg_system.dto.movie;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.acm.cinema_ebkg_system.enums.MovieStatus;
import com.acm.cinema_ebkg_system.model.Movie;
import com.acm.cinema_ebkg_system.model.MovieShow;
import com.acm.cinema_ebkg_system.model.ShowRoom;
import com.acm.cinema_ebkg_system.model.ShowTime;

/**
 * Movie Show Response DTO - Sent from backend TO frontend (when getting all movie shows for a movie)
 */
@Data
public class MovieShowResponseDTO {
    private LocalDate date;
    private String time;
    private String ampm;
    private Long room;

    // Private constructor - use fromMovie() static factory method 
    private MovieShowResponseDTO(LocalDate date, String time, String ampm, Long room) {
        this.date = date;
        this.time = time;
        this.ampm = ampm;
        this.room = room;
    }

    private static String convertTo12HourTime(LocalTime time) {
        int hour = time.getHour();
        int minute = time.getMinute();

        if (hour > 12) {
            hour = hour - 12;
        }
        if (hour == 0) {
            hour = 12;
        }

        String formattedTime;

        if (minute < 10) {
            formattedTime = hour + ":" + "0" + minute;
        } else {
            formattedTime = hour + ":" + minute;
        }

        return formattedTime;
    }

    /**
     * Create MovieShowResponse from MovieShow entity. 
     * MovieShow entity will map to this DTO (Data Transfer Object).
     */
    public static MovieShowResponseDTO fromMovieShow(MovieShow movieShow) {
        
        // Retrieve the showtime associated with the movie show
        LocalDateTime timeAndDate = movieShow.getShowTime().getShowTime();

        // Get date, time, and AM/PM strings individually
        LocalDate date = timeAndDate.toLocalDate();
        LocalTime localtime = timeAndDate.toLocalTime();
        
        DateTimeFormatter amPmFormatter = DateTimeFormatter.ofPattern("a");
        String ampm = timeAndDate.format(amPmFormatter);

        // Convert time to 12 hour format
        String time = convertTo12HourTime(localtime);

        return new MovieShowResponseDTO(
            date,
            time,
            ampm,
            movieShow.getShowRoom().getId() 
        );
    }
}
