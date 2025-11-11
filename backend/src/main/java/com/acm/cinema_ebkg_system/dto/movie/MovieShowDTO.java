package com.acm.cinema_ebkg_system.dto.movie;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

import com.acm.cinema_ebkg_system.model.Movie;
import com.acm.cinema_ebkg_system.model.ShowRoom;

@Data
public class MovieShowDTO {
    private Long movieId;
    private Long showRoomId;
    private String showTime;
}
