package com.acm.cinema_ebkg_system.repository;

import com.acm.cinema_ebkg_system.model.Movie;
import com.acm.cinema_ebkg_system.model.ShowRoom;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Show Room Repository
 * 
 * Automatically provides: save(), findById(), findAll(), deleteById(), count(), existsById()
 */
@Repository
public interface ShowRoomRepository extends JpaRepository<ShowRoom, Long> {

    // Look up a showroom by its name
    @Query("SELECT r FROM ShowRoom r WHERE r.name = :name")
    Optional<ShowRoom> findByName(@Param("name") String name);

}
