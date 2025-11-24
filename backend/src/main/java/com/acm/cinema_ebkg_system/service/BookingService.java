package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.dto.booking.CreateBookingRequest;
import com.acm.cinema_ebkg_system.enums.TicketType;
import com.acm.cinema_ebkg_system.model.Booking;
import com.acm.cinema_ebkg_system.model.MovieShow;
import com.acm.cinema_ebkg_system.model.ShowSeat;
import com.acm.cinema_ebkg_system.model.Ticket;
import com.acm.cinema_ebkg_system.model.TicketCategory;
import com.acm.cinema_ebkg_system.model.TicketSeat;
import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.repository.BookingRepository;
import com.acm.cinema_ebkg_system.repository.MovieShowRepository;
import com.acm.cinema_ebkg_system.repository.ShowSeatRepository;
import com.acm.cinema_ebkg_system.repository.TicketCategoryRepository;
import com.acm.cinema_ebkg_system.repository.TicketRepository;
import com.acm.cinema_ebkg_system.repository.TicketSeatRepository;
import com.acm.cinema_ebkg_system.repository.UserRepository;
import com.acm.cinema_ebkg_system.repository.PaymentInfoRepository;
import com.acm.cinema_ebkg_system.model.PaymentInfo;
import com.acm.cinema_ebkg_system.model.ShowSeat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service for managing bookings and tickets
 */
@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private TicketSeatRepository ticketSeatRepository;
    
    @Autowired
    private ShowSeatRepository showSeatRepository;
    
    @Autowired
    private MovieShowRepository movieShowRepository;
    
    @Autowired
    private TicketCategoryRepository ticketCategoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PaymentInfoRepository paymentInfoRepository;
    
    /**
     * Create a booking with tickets and link seats permanently
     * This marks seats as permanently booked (via ticket_seat table)
     * Creates a placeholder payment_info record first (payment will be completed at checkout)
     */
    @Transactional
    public Booking createBooking(Long userId, CreateBookingRequest request) {
        // Get user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Get show
        MovieShow show = movieShowRepository.findById(request.getShowId())
            .orElseThrow(() -> new RuntimeException("Show not found with id: " + request.getShowId()));
        
        // Find or create seats by showId and seat row/number (not by IDs)
        // If seats don't exist, create them (they should have been reserved already, but handle edge case)
        List<ShowSeat> seats = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (CreateBookingRequest.SeatSelection seatSelection : request.getSeats()) {
            ShowSeat seat = showSeatRepository
                .findByMovieShowIdAndSeatRowAndSeatNumber(request.getShowId(), seatSelection.getSeatRow(), seatSelection.getSeatNumber())
                .orElse(null);
            
            // If seat doesn't exist, create it (shouldn't happen if reservation worked, but handle it)
            if (seat == null) {
                seat = new ShowSeat();
                seat.setMovieShow(show);
                seat.setSeatRow(seatSelection.getSeatRow());
                seat.setSeatNumber(seatSelection.getSeatNumber());
                seat.setSeatType("standard");
                seat.setIsAvailable(false); // Mark as booked
                seat.setCreatedAt(now);
                seat.setUpdatedAt(now);
                seat = showSeatRepository.save(seat);
            }
            
            seats.add(seat);
        }
        
        // Calculate total amount
        BigDecimal totalAmount = BigDecimal.ZERO;
        Map<String, Integer> ticketTypes = request.getTicketTypes();
        
        // Get ticket categories from database
        TicketCategory adultCategory = ticketCategoryRepository.findByName("adult")
            .orElseThrow(() -> new RuntimeException("Adult ticket category not found in database"));
        TicketCategory childCategory = ticketCategoryRepository.findByName("child")
            .orElseThrow(() -> new RuntimeException("Child ticket category not found in database"));
        TicketCategory seniorCategory = ticketCategoryRepository.findByName("senior")
            .orElseThrow(() -> new RuntimeException("Senior ticket category not found in database"));
        
        BigDecimal adultPrice = adultCategory.getPrice();
        BigDecimal childPrice = childCategory.getPrice();
        BigDecimal seniorPrice = seniorCategory.getPrice();
        
        // Calculate total
        int adultCount = ticketTypes.getOrDefault("adult", 0);
        int childCount = ticketTypes.getOrDefault("child", 0);
        int seniorCount = ticketTypes.getOrDefault("senior", 0);
        
        totalAmount = totalAmount.add(adultPrice.multiply(new BigDecimal(adultCount)));
        totalAmount = totalAmount.add(childPrice.multiply(new BigDecimal(childCount)));
        totalAmount = totalAmount.add(seniorPrice.multiply(new BigDecimal(seniorCount)));
        
        // Verify ticket count matches seat count
        int totalTickets = adultCount + childCount + seniorCount;
        if (totalTickets != seats.size()) {
            throw new RuntimeException("Ticket count (" + totalTickets + ") does not match seat count (" + seats.size() + ")");
        }
        
        // Create placeholder payment_info record (payment will be completed at checkout)
        // This is required because booking.payment_id is NOT NULL in the database
        PaymentInfo placeholderPayment = new PaymentInfo();
        placeholderPayment.setUser(user);
        placeholderPayment.setCard_number("PENDING_PAYMENT"); // Placeholder - will be updated at checkout
        placeholderPayment.setBilling_address("PENDING_PAYMENT");
        placeholderPayment.setCardholder_name("PENDING_PAYMENT");
        placeholderPayment.setExpiration_date(LocalDate.now().plusYears(1)); // Placeholder date
        placeholderPayment = paymentInfoRepository.save(placeholderPayment);
        
        // Get movie_id from the movie_show (show has a reference to movie)
        Long movieId = show.getMovie().getMovie_id();
        
        // Create booking with user_id, movie_id, payment_id, and num_tickets
        // Seats will be linked via tickets (ticket_seat table)
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setMovieId(movieId); // Set movie_id from movie_show
        booking.setNumTickets(totalTickets); // Set number of tickets (total seats)
        booking.setTotalAmount(totalAmount);
        booking.setStatus("confirmed");
        booking.setPaymentId(placeholderPayment.getPayment_info_id()); // Link to placeholder payment
        booking = bookingRepository.save(booking);
        
        // Create tickets and link to seats
        List<Ticket> tickets = new ArrayList<>();
        List<TicketSeat> ticketSeats = new ArrayList<>();
        
        int seatIndex = 0;
        
        // Create adult tickets
        for (int i = 0; i < adultCount; i++) {
            if (seatIndex >= seats.size()) {
                throw new RuntimeException("Not enough seats for tickets");
            }
            
            Ticket ticket = new Ticket();
            ticket.setBooking(booking);
            ticket.setTicType(TicketType.adult);
            ticket = ticketRepository.save(ticket);
            tickets.add(ticket);
            
            // Link ticket to seat
            TicketSeat ticketSeat = new TicketSeat();
            ticketSeat.setTicket(ticket);
            ticketSeat.setShowSeat(seats.get(seatIndex));
            ticketSeat = ticketSeatRepository.save(ticketSeat);
            ticketSeats.add(ticketSeat);
            
            seatIndex++;
        }
        
        // Create child tickets
        for (int i = 0; i < childCount; i++) {
            if (seatIndex >= seats.size()) {
                throw new RuntimeException("Not enough seats for tickets");
            }
            
            Ticket ticket = new Ticket();
            ticket.setBooking(booking);
            ticket.setTicType(TicketType.child);
            ticket = ticketRepository.save(ticket);
            tickets.add(ticket);
            
            // Link ticket to seat
            TicketSeat ticketSeat = new TicketSeat();
            ticketSeat.setTicket(ticket);
            ticketSeat.setShowSeat(seats.get(seatIndex));
            ticketSeat = ticketSeatRepository.save(ticketSeat);
            ticketSeats.add(ticketSeat);
            
            seatIndex++;
        }
        
        // Create senior tickets
        for (int i = 0; i < seniorCount; i++) {
            if (seatIndex >= seats.size()) {
                throw new RuntimeException("Not enough seats for tickets");
            }
            
            Ticket ticket = new Ticket();
            ticket.setBooking(booking);
            ticket.setTicType(TicketType.senior);
            ticket = ticketRepository.save(ticket);
            tickets.add(ticket);
            
            // Link ticket to seat
            TicketSeat ticketSeat = new TicketSeat();
            ticketSeat.setTicket(ticket);
            ticketSeat.setShowSeat(seats.get(seatIndex));
            ticketSeat = ticketSeatRepository.save(ticketSeat);
            ticketSeats.add(ticketSeat);
            
            seatIndex++;
        }
        
        // Mark all seats as permanently booked (remove reserved_at timestamp)
        // This indicates the seats are permanently booked, not just temporarily reserved
        for (ShowSeat seat : seats) {
            showSeatService.markSeatAsPermanentlyBooked(seat.getId());
        }
        
        // Update available seats count
        showSeatService.updateAvailableSeatsCount(request.getShowId());
        
        return booking;
    }
    
    @Autowired
    private ShowSeatService showSeatService;
}

