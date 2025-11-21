package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.model.Movie;
import com.acm.cinema_ebkg_system.model.ShowRoom;
import com.acm.cinema_ebkg_system.repository.ShowRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Show Room Service
 */
@Service
public class ShowRoomService {
    
    @Autowired
    private ShowRoomRepository showRoomRepository;
    
    /**
     * Get all show rooms
     * @return List<ShowRoom>: All show rooms in the system
     */
    public List<ShowRoom> getAllShowRooms() {
        return showRoomRepository.findAll();
    }
    
    // Get a show room by room ID 
    public ShowRoom getShowRoomById(Long roomId) {
         return showRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Showroom not found with id: " + roomId));
    }
    // Get a show room by room name
    public ShowRoom getShowRoomByName(String name) {
        return showRoomRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Showroom not found with name: " + name));
    }

    /**
     * Create a new show room (admin only)
     * @param showRoom - ShowRoom: Show room object with name and capacity
     * @return ShowRoom: Created show room with generated ID and timestamps
     */
    public ShowRoom createShowRoom(ShowRoom showRoom) {
        return showRoomRepository.save(showRoom);
    }
    
    /**
     * Update an existing show room (admin only)
     * @param showRoom - ShowRoom: Show room object with ID and updated fields
     * @return ShowRoom: Updated show room
     */
    public ShowRoom updateShowRoom(ShowRoom showRoom) {
        return showRoomRepository.save(showRoom);
    }
    
    /**
     * Delete a show room (admin only)
     * @param showRoomId - Long: Show room ID to delete
     */
    public void deleteShowRoom(Long showRoomId) {
        showRoomRepository.deleteById(showRoomId);
    }
}
