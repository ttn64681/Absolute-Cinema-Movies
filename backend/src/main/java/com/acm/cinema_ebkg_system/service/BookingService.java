package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.dto.booking.CreateBookingRequest;
import com.acm.cinema_ebkg_system.enums.TicketType;
import com.acm.cinema_ebkg_system.model.Booking;
import com.acm.cinema_ebkg_system.model.MovieShow;
import com.acm.cinema_ebkg_system.model.ShowSeat;
import com.acm.cinema_ebkg_system.model.Ticket;
import com.acm.cinema_ebkg_system.model.TicketCategory;
import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.repository.BookingRepository;
import com.acm.cinema_ebkg_system.repository.MovieShowRepository;
import com.acm.cinema_ebkg_system.repository.ShowSeatRepository;
import com.acm.cinema_ebkg_system.repository.TicketCategoryRepository;
import com.acm.cinema_ebkg_system.repository.TicketRepository;
import com.acm.cinema_ebkg_system.repository.UserRepository;
import com.acm.cinema_ebkg_system.repository.PaymentCardRepository;
import com.acm.cinema_ebkg_system.model.PaymentCard;
import com.acm.cinema_ebkg_system.model.Address;
import com.acm.cinema_ebkg_system.repository.AddressRepository;
import com.acm.cinema_ebkg_system.enums.PaymentCardType;
import com.acm.cinema_ebkg_system.enums.AddressType;
import com.acm.cinema_ebkg_system.model.Promotion;
import com.acm.cinema_ebkg_system.util.PaymentEncryptionUtil;
import com.acm.cinema_ebkg_system.repository.PromotionRepository;
import com.acm.cinema_ebkg_system.repository.MovieRepository;
import com.acm.cinema_ebkg_system.service.EmailService;
import com.acm.cinema_ebkg_system.dto.booking.OrderResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

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
    private ShowSeatRepository showSeatRepository;
    
    @Autowired
    private MovieShowRepository movieShowRepository;
    
    @Autowired
    private TicketCategoryRepository ticketCategoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PaymentCardRepository paymentCardRepository;
    
    @Autowired
    private AddressRepository addressRepository;
    
    /**
     * Create a booking with tickets and link seats permanently
     * This marks seats as permanently booked (via ticket.show_seat_id)
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
        
        // Get movie_id from the movie_show (show has a reference to movie)
        Long movieId = show.getMovie().getMovie_id();
        
        // Create booking with user_id, movie_id, and num_tickets
        // Payment card will be linked when payment is completed (payment_card_id can be null initially)
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setMovieId(movieId); // Set movie_id from movie_show
        booking.setNumTickets(totalTickets); // Set number of tickets (total seats)
        booking.setTotalAmount(totalAmount);
        booking.setPaymentId(null); // Will be set when payment is completed
        booking = bookingRepository.save(booking);
        
        // Create tickets and link to seats directly via show_seat_id
        List<Ticket> tickets = new ArrayList<>();
        
        int seatIndex = 0;
        
        // Create adult tickets
        for (int i = 0; i < adultCount; i++) {
            if (seatIndex >= seats.size()) {
                throw new RuntimeException("Not enough seats for tickets");
            }
            
            ShowSeat currentSeat = seats.get(seatIndex);
            Ticket ticket = new Ticket();
            ticket.setBooking(booking);
            ticket.setTicType(TicketType.adult);
            ticket.setShowSeat(currentSeat); // Link directly via show_seat_id
            ticket = ticketRepository.save(ticket);
            tickets.add(ticket);
            
            seatIndex++;
        }
        
        // Create child tickets
        for (int i = 0; i < childCount; i++) {
            if (seatIndex >= seats.size()) {
                throw new RuntimeException("Not enough seats for tickets");
            }
            
            ShowSeat currentSeat = seats.get(seatIndex);
            Ticket ticket = new Ticket();
            ticket.setBooking(booking);
            ticket.setTicType(TicketType.child);
            ticket.setShowSeat(currentSeat); // Link directly via show_seat_id
            ticket = ticketRepository.save(ticket);
            tickets.add(ticket);
            
            seatIndex++;
        }
        
        // Create senior tickets
        for (int i = 0; i < seniorCount; i++) {
            if (seatIndex >= seats.size()) {
                throw new RuntimeException("Not enough seats for tickets");
            }
            
            ShowSeat currentSeat = seats.get(seatIndex);
            Ticket ticket = new Ticket();
            ticket.setBooking(booking);
            ticket.setTicType(TicketType.senior);
            ticket.setShowSeat(currentSeat); // Link directly via show_seat_id
            ticket = ticketRepository.save(ticket);
            tickets.add(ticket);
            
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
    
    @Autowired
    private MovieRepository movieRepository;
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Complete payment for a booking
     * Updates payment_info and applies promotion if provided
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
        
        // Parse billing address (format: "street, city, state zip")
        String street = "";
        String city = "";
        String state = "";
        String zip = "";
        String country = "US"; // Default
        
        if (billingAddress != null && !billingAddress.isEmpty()) {
            String[] addressParts = billingAddress.split(",");
            if (addressParts.length >= 3) {
                street = addressParts[0].trim();
                city = addressParts[1].trim();
                String stateZip = addressParts[2].trim();
                String[] stateZipParts = stateZip.split(" ");
                if (stateZipParts.length >= 2) {
                    state = stateZipParts[0];
                    zip = stateZipParts[1];
                }
            }
        }
        
        // Get user from booking
        User user = booking.getUser();
        
        // Find or create billing address
        Address billingAddr = null;
        List<Address> existingAddresses = addressRepository.findByUserIdAndAddressType(userId, AddressType.billing);
        for (Address addr : existingAddresses) {
            if (addr.getStreet().equals(street) && 
                addr.getCity().equals(city) && 
                addr.getState().equals(state) && 
                addr.getZip().equals(zip)) {
                billingAddr = addr;
                System.out.println("Reusing existing address: " + billingAddr.getId());
                break;
            }
        }
        
        if (billingAddr == null) {
            // Create new billing address
            billingAddr = new Address();
            billingAddr.setUser(user);
            billingAddr.setAddressType(AddressType.billing);
            billingAddr.setStreet(street);
            billingAddr.setCity(city);
            billingAddr.setState(state);
            billingAddr.setZip(zip);
            billingAddr.setCountry(country);
            billingAddr = addressRepository.save(billingAddr);
            System.out.println("Created new billing address: " + billingAddr.getId());
        }
        
        // Extract last 4 digits of card number for matching
        String cardNumberDigits = cardNumber.replaceAll("[^0-9]", "");
        String lastFourDigits = cardNumberDigits.length() >= 4 
            ? cardNumberDigits.substring(cardNumberDigits.length() - 4) 
            : cardNumberDigits;
        
        // Find or create payment card
        PaymentCard paymentCard = null;
        List<PaymentCard> userCards = paymentCardRepository.findByUserIdOrderByIsDefaultDesc(userId);
        for (PaymentCard card : userCards) {
            // Decrypt existing card number to compare last 4 digits
            String existingCardNumber = null;
            try {
                existingCardNumber = PaymentEncryptionUtil.decryptCardNumber(card.getCardNumber());
            } catch (Exception e) {
                // If decryption fails, skip this card (might be corrupted or in wrong format)
                System.out.println("Warning: Could not decrypt card number for card " + card.getId() + ", skipping comparison");
                continue;
            }
            
            String existingCardDigits = existingCardNumber.replaceAll("[^0-9]", "");
            String existingLastFour = existingCardDigits.length() >= 4 
                ? existingCardDigits.substring(existingCardDigits.length() - 4) 
                : existingCardDigits;
            
            // Match by last 4 digits, expiration date, and cardholder name
            if (existingLastFour.equals(lastFourDigits) && 
                card.getExpirationDate().equals(expirationDate) &&
                card.getCardholderName().equals(cardholderName)) {
                paymentCard = card;
                System.out.println("Reusing existing payment card: " + paymentCard.getId());
                break;
            }
        }
        
        if (paymentCard == null) {
            // Create new payment card
            paymentCard = new PaymentCard();
            paymentCard.setUser(user);
            paymentCard.setAddress(billingAddr);
            
            // Encrypt card number before saving (same as PaymentCardService)
            try {
                String encryptedCardNumber = PaymentEncryptionUtil.encryptCardNumber(cardNumber);
                paymentCard.setCardNumber(encryptedCardNumber);
            } catch (Exception e) {
                throw new RuntimeException("Error encrypting card number", e);
            }
            
            paymentCard.setExpirationDate(expirationDate);
            paymentCard.setCardholderName(cardholderName);
            
            // Determine card type from first digit
            char firstDigit = cardNumberDigits.charAt(0);
            if (firstDigit == '4') {
                paymentCard.setPaymentCardType(PaymentCardType.visa);
            } else if (firstDigit == '5') {
                paymentCard.setPaymentCardType(PaymentCardType.mastercard);
            } else if (firstDigit == '3' && (cardNumberDigits.length() == 15)) {
                paymentCard.setPaymentCardType(PaymentCardType.amex);
            } else if (firstDigit == '6') {
                paymentCard.setPaymentCardType(PaymentCardType.discover);
            } else {
                paymentCard.setPaymentCardType(PaymentCardType.visa); // Default
            }
            
            // Set as default if user has no other cards
            if (userCards.isEmpty()) {
                paymentCard.setIsDefault(true);
            } else {
                paymentCard.setIsDefault(false);
            }
            
            paymentCard = paymentCardRepository.save(paymentCard);
            System.out.println("Created new payment card: " + paymentCard.getId());
        } else {
            // Update existing card - always encrypt card number (it's already matched, but ensure it's encrypted)
            // The card number should already be encrypted, but re-encrypt to ensure consistency
            try {
                String encryptedCardNumber = PaymentEncryptionUtil.encryptCardNumber(cardNumber);
                paymentCard.setCardNumber(encryptedCardNumber);
            } catch (Exception e) {
                throw new RuntimeException("Error encrypting card number", e);
            }
            
            // Update expiration date and cardholder name
            paymentCard.setExpirationDate(expirationDate);
            paymentCard.setCardholderName(cardholderName);
            
            // Update existing card's address if it changed
            if (!paymentCard.getAddress().getId().equals(billingAddr.getId())) {
                paymentCard.setAddress(billingAddr);
            }
            
            paymentCard = paymentCardRepository.save(paymentCard);
            System.out.println("Updated existing payment card: " + paymentCard.getId());
        }
        
        // Link booking to payment card
        booking.setPaymentId(paymentCard.getId());
        booking = bookingRepository.save(booking);
        
        // Send order confirmation email
        try {
            sendOrderConfirmationEmail(booking);
        } catch (Exception e) {
            // Log error but don't fail payment completion if email fails
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }
        
        return booking;
    }
    
    /**
     * Send order confirmation email to user
     * Extracts booking details and formats email
     */
    private void sendOrderConfirmationEmail(Booking booking) {
        try {
            // Get user details
            User user = booking.getUser();
            String userEmail = user.getEmail();
            String userName = user.getFirstName() != null ? user.getFirstName() : "Valued Customer";
            
            // Get movie title
            String movieTitle = "Movie";
            try {
                java.util.Optional<com.acm.cinema_ebkg_system.model.Movie> movieOpt = movieRepository.findById(booking.getMovieId());
                if (movieOpt.isPresent()) {
                    movieTitle = movieOpt.get().getTitle();
                }
            } catch (Exception e) {
                System.err.println("Error fetching movie for email: " + e.getMessage());
            }
            
            // Get show date/time and seats from tickets
            String showDateTime = "TBD";
            StringBuilder seatsBuilder = new StringBuilder();
            
            if (booking.getTickets() != null && !booking.getTickets().isEmpty()) {
                // Get show time from first ticket's show seat
                com.acm.cinema_ebkg_system.model.Ticket firstTicket = booking.getTickets().get(0);
                if (firstTicket.getShowSeat() != null) {
                    com.acm.cinema_ebkg_system.model.ShowSeat firstSeat = firstTicket.getShowSeat();
                    if (firstSeat.getMovieShow() != null) {
                        com.acm.cinema_ebkg_system.model.MovieShow movieShow = firstSeat.getMovieShow();
                        if (movieShow.getShowTime() != null) {
                            java.time.LocalDateTime showTime = movieShow.getShowTime().getShowTime();
                            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");
                            showDateTime = showTime.format(formatter);
                        }
                    }
                }
                
                // Collect all seat identifiers
                List<String> seatList = new ArrayList<>();
                for (com.acm.cinema_ebkg_system.model.Ticket ticket : booking.getTickets()) {
                    if (ticket.getShowSeat() != null) {
                        com.acm.cinema_ebkg_system.model.ShowSeat seat = ticket.getShowSeat();
                        String seatIdentifier = seat.getSeatRow() + seat.getSeatNumber();
                        seatList.add(seatIdentifier);
                    }
                }
                seatsBuilder.append(String.join(", ", seatList));
            }
            
            String seats = seatsBuilder.length() > 0 ? seatsBuilder.toString() : "N/A";
            
            // Get promotion name if applied
            String promotionName = null;
            if (booking.getPromotion() != null) {
                promotionName = booking.getPromotion().getTitle();
            }
            
            // Send email
            emailService.sendOrderConfirmationEmail(
                userEmail,
                userName,
                booking.getBookingId(),
                movieTitle,
                showDateTime,
                seats,
                booking.getNumTickets(),
                booking.getTotalAmount(),
                promotionName
            );
        } catch (Exception e) {
            System.err.println("Error preparing order confirmation email: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Get all orders for a user
     * Returns orders ordered by creation date descending (most recent first)
     * 
     * @param userId User ID
     * @return List of OrderResponseDTO with order details
     */
    public List<OrderResponseDTO> getUserOrders(Long userId) {
        // Get all bookings for user
        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        return bookings.stream().map(booking -> {
            OrderResponseDTO dto = new OrderResponseDTO();
            dto.setBookingId(booking.getBookingId());
            dto.setNumTickets(booking.getNumTickets());
            dto.setTotalAmount(booking.getTotalAmount());
            dto.setOrderDate(booking.getCreatedAt());
            
            // Get movie title and poster
            try {
                java.util.Optional<com.acm.cinema_ebkg_system.model.Movie> movieOpt = movieRepository.findById(booking.getMovieId());
                if (movieOpt.isPresent()) {
                    com.acm.cinema_ebkg_system.model.Movie movie = movieOpt.get();
                    dto.setMovieTitle(movie.getTitle());
                    dto.setMoviePosterUrl(movie.getPoster_link() != null ? movie.getPoster_link() : "");
                } else {
                    dto.setMovieTitle("Unknown Movie");
                    dto.setMoviePosterUrl("");
                }
            } catch (Exception e) {
                dto.setMovieTitle("Unknown Movie");
                dto.setMoviePosterUrl("");
            }
            
            // Get show date/time and seats from tickets
            LocalDateTime showDateTime = null;
            List<String> seatList = new ArrayList<>();
            List<Long> ticketIdList = new ArrayList<>();
            int adultCount = 0;
            int childCount = 0;
            int seniorCount = 0;
            
            if (booking.getTickets() != null && !booking.getTickets().isEmpty()) {
                // Get show time from first ticket
                com.acm.cinema_ebkg_system.model.Ticket firstTicket = booking.getTickets().get(0);
                if (firstTicket.getShowSeat() != null) {
                    com.acm.cinema_ebkg_system.model.ShowSeat firstSeat = firstTicket.getShowSeat();
                    if (firstSeat.getMovieShow() != null) {
                        com.acm.cinema_ebkg_system.model.MovieShow movieShow = firstSeat.getMovieShow();
                        if (movieShow.getShowTime() != null) {
                            showDateTime = movieShow.getShowTime().getShowTime();
                        }
                    }
                }
                
                // Collect seats, ticket IDs, and count ticket types
                for (com.acm.cinema_ebkg_system.model.Ticket ticket : booking.getTickets()) {
                    // Collect ticket ID
                    if (ticket.getId() != null) {
                        ticketIdList.add(ticket.getId());
                    }
                    
                    if (ticket.getShowSeat() != null) {
                        com.acm.cinema_ebkg_system.model.ShowSeat seat = ticket.getShowSeat();
                        String seatIdentifier = seat.getSeatRow() + seat.getSeatNumber();
                        seatList.add(seatIdentifier);
                    }
                    
                    // Count ticket types
                    if (ticket.getTicType() == TicketType.adult) {
                        adultCount++;
                    } else if (ticket.getTicType() == TicketType.child) {
                        childCount++;
                    } else if (ticket.getTicType() == TicketType.senior) {
                        seniorCount++;
                    }
                }
            }
            
            dto.setSeats(seatList);
            dto.setTicketIds(ticketIdList);
            dto.setShowDateTime(showDateTime);
            
            // Format date and time
            if (showDateTime != null) {
                DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("M/d/yy");
                DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mma");
                dto.setShowDate(showDateTime.format(dateFormatter));
                dto.setShowTime(showDateTime.format(timeFormatter));
            } else {
                dto.setShowDate("TBD");
                dto.setShowTime("TBD");
            }
            
            // Set ticket counts
            OrderResponseDTO.TicketCounts ticketCounts = new OrderResponseDTO.TicketCounts(adultCount, childCount, seniorCount);
            dto.setTicketCounts(ticketCounts);
            
            // Get payment method (masked card)
            if (booking.getPaymentId() != null) {
                try {
                    java.util.Optional<PaymentCard> paymentCardOpt = paymentCardRepository.findById(booking.getPaymentId());
                    if (paymentCardOpt.isPresent()) {
                        PaymentCard card = paymentCardOpt.get();
                        // Decrypt and mask card number
                        try {
                            String decrypted = PaymentEncryptionUtil.decryptCardNumber(card.getCardNumber());
                            String cardDigits = decrypted.replaceAll("[^0-9]", "");
                            String lastFour = cardDigits.length() >= 4 
                                ? cardDigits.substring(cardDigits.length() - 4) 
                                : cardDigits;
                            String cardType = card.getPaymentCardType() != null 
                                ? card.getPaymentCardType().name() 
                                : "Card";
                            dto.setPaymentMethod(cardType + " **** **** **** " + lastFour);
                        } catch (Exception e) {
                            dto.setPaymentMethod("Card **** **** **** ****");
                        }
                    } else {
                        dto.setPaymentMethod("N/A");
                    }
                } catch (Exception e) {
                    dto.setPaymentMethod("N/A");
                }
            } else {
                dto.setPaymentMethod("N/A");
            }
            
            // Get promotion name if applied
            if (booking.getPromotion() != null) {
                dto.setPromotionName(booking.getPromotion().getTitle());
            } else {
                dto.setPromotionName(null);
            }
            
            return dto;
        }).collect(Collectors.toList());
    }
    
    /**
     * Get booking details by booking ID
     * Used for order confirmation page
     * 
     * @param bookingId Booking ID
     * @param userId User ID (for security - verify booking belongs to user)
     * @return OrderResponseDTO with booking details
     */
    public OrderResponseDTO getBookingById(Long bookingId, Long userId) {
        // Get booking
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify booking belongs to user
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Booking does not belong to user");
        }
        
        // Build DTO (reuse logic from getUserOrders)
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setBookingId(booking.getBookingId());
        dto.setNumTickets(booking.getNumTickets());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setOrderDate(booking.getCreatedAt());
        
        // Get movie title and poster
        try {
            java.util.Optional<com.acm.cinema_ebkg_system.model.Movie> movieOpt = movieRepository.findById(booking.getMovieId());
            if (movieOpt.isPresent()) {
                com.acm.cinema_ebkg_system.model.Movie movie = movieOpt.get();
                dto.setMovieTitle(movie.getTitle());
                dto.setMoviePosterUrl(movie.getPoster_link() != null ? movie.getPoster_link() : "");
            } else {
                dto.setMovieTitle("Unknown Movie");
                dto.setMoviePosterUrl("");
            }
        } catch (Exception e) {
            dto.setMovieTitle("Unknown Movie");
            dto.setMoviePosterUrl("");
        }
        
        // Get show date/time and seats from tickets
        LocalDateTime showDateTime = null;
        List<String> seatList = new ArrayList<>();
        List<Long> ticketIdList = new ArrayList<>();
        int adultCount = 0;
        int childCount = 0;
        int seniorCount = 0;
        
        if (booking.getTickets() != null && !booking.getTickets().isEmpty()) {
            // Get show time from first ticket
            com.acm.cinema_ebkg_system.model.Ticket firstTicket = booking.getTickets().get(0);
            if (firstTicket.getShowSeat() != null) {
                com.acm.cinema_ebkg_system.model.ShowSeat firstSeat = firstTicket.getShowSeat();
                if (firstSeat.getMovieShow() != null) {
                    com.acm.cinema_ebkg_system.model.MovieShow movieShow = firstSeat.getMovieShow();
                    if (movieShow.getShowTime() != null) {
                        showDateTime = movieShow.getShowTime().getShowTime();
                    }
                }
            }
            
            // Collect seats, ticket IDs, and count ticket types
            for (com.acm.cinema_ebkg_system.model.Ticket ticket : booking.getTickets()) {
                // Collect ticket ID
                if (ticket.getId() != null) {
                    ticketIdList.add(ticket.getId());
                }
                
                if (ticket.getShowSeat() != null) {
                    com.acm.cinema_ebkg_system.model.ShowSeat seat = ticket.getShowSeat();
                    String seatIdentifier = seat.getSeatRow() + seat.getSeatNumber();
                    seatList.add(seatIdentifier);
                }
                
                // Count ticket types
                if (ticket.getTicType() == TicketType.adult) {
                    adultCount++;
                } else if (ticket.getTicType() == TicketType.child) {
                    childCount++;
                } else if (ticket.getTicType() == TicketType.senior) {
                    seniorCount++;
                }
            }
        }
        
        dto.setSeats(seatList);
        dto.setTicketIds(ticketIdList);
        dto.setShowDateTime(showDateTime);
        
        // Format date and time
        if (showDateTime != null) {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("M/d/yy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mma");
            dto.setShowDate(showDateTime.format(dateFormatter));
            dto.setShowTime(showDateTime.format(timeFormatter));
        } else {
            dto.setShowDate("TBD");
            dto.setShowTime("TBD");
        }
        
        // Set ticket counts
        OrderResponseDTO.TicketCounts ticketCounts = new OrderResponseDTO.TicketCounts(adultCount, childCount, seniorCount);
        dto.setTicketCounts(ticketCounts);
        
        // Get payment method (masked card)
        if (booking.getPaymentId() != null) {
            try {
                java.util.Optional<PaymentCard> paymentCardOpt = paymentCardRepository.findById(booking.getPaymentId());
                if (paymentCardOpt.isPresent()) {
                    PaymentCard card = paymentCardOpt.get();
                    // Decrypt and mask card number
                    try {
                        String decrypted = PaymentEncryptionUtil.decryptCardNumber(card.getCardNumber());
                        String cardDigits = decrypted.replaceAll("[^0-9]", "");
                        if (cardDigits.length() >= 4) {
                            String last4 = cardDigits.substring(cardDigits.length() - 4);
                            String cardType = card.getPaymentCardType() != null ? card.getPaymentCardType().name().toUpperCase() : "CARD";
                            dto.setPaymentMethod(cardType + " **** **** **** " + last4);
                        } else {
                            dto.setPaymentMethod("CARD");
                        }
                    } catch (Exception e) {
                        dto.setPaymentMethod("CARD");
                    }
                } else {
                    dto.setPaymentMethod("CARD");
                }
            } catch (Exception e) {
                dto.setPaymentMethod("CARD");
            }
        } else {
            dto.setPaymentMethod("CARD");
        }
        
        // Get promotion name if applied
        if (booking.getPromotion() != null) {
            dto.setPromotionName(booking.getPromotion().getTitle());
        } else {
            dto.setPromotionName(null);
        }
        
        return dto;
    }
}

