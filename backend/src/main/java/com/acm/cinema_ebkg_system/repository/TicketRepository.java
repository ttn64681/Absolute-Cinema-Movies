package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Ticket Repository
 * 
 * Automatically provides: save(), findById(), findAll(), deleteById(), count(), existsById()
 */
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
}

