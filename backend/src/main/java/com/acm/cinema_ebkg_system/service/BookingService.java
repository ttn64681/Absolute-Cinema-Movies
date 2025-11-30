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
import com.acm.cinema_ebkg_system.model.Promotion;
import com.acm.cinema_ebkg_system.repository.PromotionRepository;
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
    
    @Autowired
    private PromotionRepository promotionRepository;
    
    /**
     * Complete payment for a booking
     * Updates booking status to "paid", updates payment_info, and applies promotion if provided
     * @param finalTotalAmount - Final total amount including tax, fees, and discount (calculated on frontend)
     */
    @Transactional
    public Booking completePayment(Long bookingId, Long userId, String cardNumber, 
            String expirationDate, String cardholderName, String billingAddress, Long promotionId, BigDecimal finalTotalAmount) {
        
        // Get booking
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        
        // Verify booking belongs to user
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Booking does not belong to user");
        }
        
        // Verify booking is not already paid
        if ("paid".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already paid");
        }
        
        // Handle promotion - only set if valid, otherwise ensure it's null
        // First, clear any existing promotion to avoid foreign key issues
        booking.setPromotion(null);
        
        // Apply promotion if provided and exists
        if (promotionId != null && promotionId > 0) {
            try {
                java.util.Optional<Promotion> promotionOpt = promotionRepository.findById(promotionId);
                if (promotionOpt.isPresent()) {
                    Promotion promotion = promotionOpt.get();
                    // Verify promotion is active and not expired
                    if (promotion.getStatus() == com.acm.cinema_ebkg_system.enums.PromotionStatus.active 
                        && promotion.getExpirationDate().isAfter(java.time.LocalDateTime.now())) {
                        // Verify the promotion ID matches what we're looking for
                        if (promotion.getId().equals(promotionId)) {
                            // Only set if valid and IDs match
                            booking.setPromotion(promotion);
                            System.out.println("Applied promotion " + promotionId + " (id=" + promotion.getId() + ") to booking " + bookingId);
                        } else {
                            System.err.println("Warning: Promotion ID mismatch. Expected " + promotionId + " but got " + promotion.getId());
                        }
                    } else {
                        // Promotion exists but is not valid - keep as null
                        System.err.println("Warning: Promotion with id " + promotionId + " is not active or expired. Proceeding without promotion.");
                    }
                } else {
                    // Promotion doesn't exist - keep as null
                    System.err.println("Warning: Promotion with id " + promotionId + " not found in database. Proceeding without promotion.");
                }
            } catch (Exception e) {
                // If any error occurs, keep promotion as null
                System.err.println("Error checking promotion " + promotionId + ": " + e.getMessage() + ". Proceeding without promotion.");
            }
        }
        
        // Calculate final total amount (includes tax, fees, and discount)
        BigDecimal ticketSubtotal = booking.getTotalAmount(); // Start with ticket prices only
        System.out.println("Payment completion - Starting with ticket subtotal: " + ticketSubtotal);
        
        // Add tax (8% of subtotal)
        BigDecimal tax = ticketSubtotal.multiply(new BigDecimal("0.08"));
        System.out.println("Tax (8%): " + tax);
        
        // Add online fees ($2.50 per ticket)
        BigDecimal onlineFeePerTicket = new BigDecimal("2.50");
        BigDecimal onlineFees = onlineFeePerTicket.multiply(new BigDecimal(booking.getNumTickets()));
        System.out.println("Online fees ($2.50 x " + booking.getNumTickets() + " tickets): " + onlineFees);
        
        // Calculate total before discount
        BigDecimal totalBeforeDiscount = ticketSubtotal.add(tax).add(onlineFees);
        System.out.println("Total before discount: " + totalBeforeDiscount);
        
        // Apply promotion discount if promotion is set
        if (booking.getPromotion() != null) {
            Promotion promotion = booking.getPromotion();
            BigDecimal discountAmount = BigDecimal.ZERO;
            
            if (promotion.getDiscountType() == com.acm.cinema_ebkg_system.enums.DiscountType.percentage) {
                // Percentage discount on total (after tax and fees)
                discountAmount = totalBeforeDiscount
                    .multiply(promotion.getDiscountValue())
                    .divide(new BigDecimal(100), 2, java.math.RoundingMode.HALF_UP);
                System.out.println("Percentage discount (" + promotion.getDiscountValue() + "%): " + discountAmount);
            } else {
                // Fixed discount
                discountAmount = promotion.getDiscountValue();
                System.out.println("Fixed discount: " + discountAmount);
            }
            
            // Subtract discount
            totalBeforeDiscount = totalBeforeDiscount.subtract(discountAmount);
            if (totalBeforeDiscount.compareTo(BigDecimal.ZERO) < 0) {
                totalBeforeDiscount = BigDecimal.ZERO;
            }
            System.out.println("Total after discount: " + totalBeforeDiscount);
        }
        
        // Use provided finalTotalAmount if available, otherwise use calculated total
        BigDecimal finalTotalToSave;
        if (finalTotalAmount != null && finalTotalAmount.compareTo(BigDecimal.ZERO) >= 0) {
            finalTotalToSave = finalTotalAmount;
            System.out.println("Using provided finalTotalAmount: " + finalTotalToSave);
        } else {
            // Use calculated total (ticket prices + tax + fees - discount)
            finalTotalToSave = totalBeforeDiscount;
            System.out.println("Using calculated finalTotalAmount: " + finalTotalToSave);
        }
        
        // Always update the total amount in the database
        booking.setTotalAmount(finalTotalToSave);
        System.out.println("Final total saved to booking: " + booking.getTotalAmount());
        
        // Update payment_info
        PaymentInfo paymentInfo = paymentInfoRepository.findById(booking.getPaymentId())
            .orElseThrow(() -> new RuntimeException("Payment info not found"));
        
        // Parse expiration date (MM/YY format)
        String[] expParts = expirationDate.split("/");
        int month = Integer.parseInt(expParts[0]);
        int year = 2000 + Integer.parseInt(expParts[1]);
        LocalDate expDate = LocalDate.of(year, month, 1).withDayOfMonth(
            LocalDate.of(year, month, 1).lengthOfMonth()
        );
        
        paymentInfo.setCard_number(cardNumber);
        paymentInfo.setExpiration_date(expDate);
        paymentInfo.setCardholder_name(cardholderName);
        paymentInfo.setBilling_address(billingAddress);
        paymentInfo = paymentInfoRepository.save(paymentInfo);
        
        // Update booking status to "paid"
        booking.setStatus("paid");
        booking = bookingRepository.save(booking);
        
        return booking;
    }
}

