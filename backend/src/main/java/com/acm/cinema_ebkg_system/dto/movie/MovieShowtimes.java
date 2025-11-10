package com.acm.cinema_ebkg_system.dto.movie;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
public class MovieShowtimes {
    private Long movieId;
    private LocalDate showDate;
}
