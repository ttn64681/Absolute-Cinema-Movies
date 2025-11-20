'use client';

import { useState, useMemo, useEffect } from 'react';
import { Seat } from '@/types/booking';
import api from '@/config/api';
import { useReservation } from '@/contexts/ReservationContext';

interface SeatDTO {
  id: number; // Database ID
  seatRow: string;
  seatNumber: string;
  seatType?: string;
  isAvailable: boolean;
  isReserved?: boolean; // May not always be present
  isTaken?: boolean; // Backend sends this - true if seat is booked (in ticket_seat table) or unavailable
}

export function useSeats(showId?: number) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]); // Display IDs for UI
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]); // Actual database seat IDs
  const [selectedSeatDetails, setSelectedSeatDetails] = useState<Array<{seatRow: string, seatNumber: string}>>([]); // Store seat row/number for reservation
  const [seats, setSeats] = useState<SeatDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get active reservation to check if seats are reserved by current user
  const { showId: reservationShowId, selectedSeats: reservationSeats } = useReservation();

  // Sync selectedSeats with reservation context when user returns to page with active reservation
  useEffect(() => {
    if (reservationShowId === showId && reservationSeats.length > 0) {
      // User has an active reservation for this show - restore their selection
      setSelectedSeats(reservationSeats);
      // Also restore seat details for reservation
      const seatDetails = reservationSeats.map(displayId => {
        const match = displayId.match(/^(\d+)([A-Z]+)$/);
        if (match) {
          return {
            seatRow: match[1],
            seatNumber: match[2]
          };
        }
        return null;
      }).filter((detail): detail is {seatRow: string, seatNumber: string} => detail !== null);
      setSelectedSeatDetails(seatDetails);
    }
  }, [reservationShowId, showId, reservationSeats]);

  // Fetch seats from backend if showId is provided
  useEffect(() => {
    if (showId) {
      setLoading(true);
      setError(null);
      api.get(`/api/seats/show/${showId}`)
        .then(response => {
          console.log('Seats API response:', response.data);
          const seatData: SeatDTO[] = response.data.seats || [];
          console.log('Parsed seat data:', seatData);
          console.log('Number of seats:', seatData.length);
          if (seatData.length > 0) {
            console.log('First seat example:', seatData[0]);
            console.log('First seat ID:', seatData[0].id, 'type:', typeof seatData[0].id);
            console.log('First seat seatRow:', seatData[0].seatRow, 'seatNumber:', seatData[0].seatNumber);
            
            // Validate that seats have required fields
            const invalidSeats = seatData.filter(s => !s.seatRow || !s.seatNumber);
            if (invalidSeats.length > 0) {
              console.error('Found seats with missing seatRow or seatNumber:', invalidSeats);
            }
          } else {
            console.warn('No seats returned from backend for showId:', showId);
            console.warn('Seats will be auto-initialized when first reserved');
          }
          setSeats(seatData);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching seats:', err);
          console.error('Error details:', err.response?.data || err.message);
          setError('Failed to load seats. Please check if the show exists.');
          setLoading(false);
        });
    }
  }, [showId]);

  // Convert backend seats to frontend format
  const seatLetters = useMemo(() => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], []);

  // Group seats by row for display
  const frontRows = useMemo(() => {
    if (!showId) {
      // No showId - return empty or mock data (but warn that seatId will be missing)
      console.warn('No showId provided - using mock data without seatId');
      return [
        Array.from({ length: 9 }, (_, idx) => ({ 
          id: `1${seatLetters[idx]}`, 
          occupied: false,
          seatId: undefined // Mock data - no real seatId
        })),
        Array.from({ length: 9 }, (_, idx) => ({ 
          id: `2${seatLetters[idx]}`, 
          occupied: false,
          seatId: undefined
        })),
        Array.from({ length: 9 }, (_, idx) => ({ 
          id: `3${seatLetters[idx]}`, 
          occupied: false,
          seatId: undefined
        })),
      ];
    }
    
    if (seats.length === 0) {
      console.warn('ShowId provided but no seats returned from backend');
      return [];
    }

    // Group seats by row
    const rows: { [key: string]: SeatDTO[] } = {};
    seats.forEach(seat => {
      const row = seat.seatRow;
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });

    // Convert to frontend format and sort
    const sortedRows = Object.keys(rows).sort();
    return sortedRows.slice(0, 3).map(row => {
      const rowSeats = rows[row].sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
      return rowSeats.map(seat => {
        // Validate that seat has required fields
        if (!seat.seatRow || !seat.seatNumber) {
          console.error('Seat missing seatRow or seatNumber:', seat);
          return null;
        }
        
        // Create display ID from row and number (e.g., "1A", "2B")
        const displayId = `${seat.seatRow}${seat.seatNumber}`;
        // Handle seat.id - may be null/undefined for seats not yet in database
        const dbSeatId = seat.id != null ? (typeof seat.id === 'number' ? seat.id : Number(seat.id)) : null;
        if (dbSeatId !== null && (isNaN(dbSeatId) || dbSeatId <= 0)) {
          console.warn('Invalid seat ID in mapping (will be created on reservation):', { seat, dbSeatId });
        }
        
        // A seat is occupied/taken if:
        // 1. It's linked to a ticket (permanently booked) - isTaken from backend
        // 2. OR it's not available AND it's NOT in the user's active reservation
        // If it's in the user's active reservation, it should be selectable (not occupied)
        const isInUserReservation = reservationShowId === showId && reservationSeats.includes(displayId);
        const isTaken = seat.isTaken !== undefined ? seat.isTaken : (!seat.isAvailable && !isInUserReservation);
        
        return {
          id: displayId, // Display ID for UI
          seatId: isNaN(dbSeatId) || dbSeatId <= 0 ? undefined : dbSeatId, // Database ID (may be undefined for new seats)
          seatRow: seat.seatRow, // REQUIRED for reservation
          seatNumber: seat.seatNumber, // REQUIRED for reservation
          occupied: isTaken, // Use isTaken from backend (checks ticket_seat table), but allow user's reserved seats
          isAvailable: seat.isAvailable || isInUserReservation, // Consider user's reserved seats as available for selection
          isReserved: seat.isReserved || isTaken,
        };
      }).filter((seat): seat is Seat => seat !== null); // Remove null entries
    });
  }, [seats, seatLetters, showId]);

  const backRows = useMemo(() => {
    if (!showId) {
      // No showId - return empty or mock data (but warn that seatId will be missing)
      console.warn('No showId provided - using mock data without seatId');
      return [
        Array.from({ length: 10 }, (_, idx) => ({ 
          id: `4${seatLetters[idx]}`, 
          occupied: false,
          seatId: undefined
        })),
        Array.from({ length: 10 }, (_, idx) => ({ 
          id: `5${seatLetters[idx]}`, 
          occupied: false,
          seatId: undefined
        })),
        Array.from({ length: 10 }, (_, idx) => ({ 
          id: `6${seatLetters[idx]}`, 
          occupied: false,
          seatId: undefined
        })),
        Array.from({ length: 10 }, (_, idx) => ({ 
          id: `7${seatLetters[idx]}`, 
          occupied: false,
          seatId: undefined
        })),
      ];
    }
    
    if (seats.length === 0) {
      console.warn('ShowId provided but no seats returned from backend');
      return [];
    }

    // Group seats by row
    const rows: { [key: string]: SeatDTO[] } = {};
    seats.forEach(seat => {
      const row = seat.seatRow;
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });

    // Convert to frontend format and sort
    const sortedRows = Object.keys(rows).sort();
    return sortedRows.slice(3).map(row => {
      const rowSeats = rows[row].sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
      return rowSeats.map(seat => {
        // Validate that seat has required fields
        if (!seat.seatRow || !seat.seatNumber) {
          console.error('Seat missing seatRow or seatNumber:', seat);
          return null;
        }
        
        // Create display ID from row and number (e.g., "4A", "5B")
        const displayId = `${seat.seatRow}${seat.seatNumber}`;
        // Handle seat.id - may be null/undefined for seats not yet in database
        const dbSeatId = seat.id != null ? (typeof seat.id === 'number' ? seat.id : Number(seat.id)) : null;
        if (dbSeatId !== null && (isNaN(dbSeatId) || dbSeatId <= 0)) {
          console.warn('Invalid seat ID in mapping (will be created on reservation):', { seat, dbSeatId });
        }
        
        // A seat is occupied/taken if:
        // 1. It's linked to a ticket (permanently booked) - isTaken from backend
        // 2. OR it's not available
        const isTaken = seat.isTaken !== undefined ? seat.isTaken : (!seat.isAvailable || seat.isReserved);
        
        return {
          id: displayId, // Display ID for UI
          seatId: dbSeatId !== null && !isNaN(dbSeatId) && dbSeatId > 0 ? dbSeatId : undefined, // Database ID (may be undefined for new seats)
          seatRow: seat.seatRow, // REQUIRED for reservation
          seatNumber: seat.seatNumber, // REQUIRED for reservation
          occupied: isTaken, // Use isTaken from backend (checks if seat is booked)
          isAvailable: seat.isAvailable,
          isReserved: seat.isReserved || isTaken,
        };
      }).filter((seat): seat is Seat => seat !== null); // Remove null entries
    });
  }, [seats, seatLetters, showId]);

  const toggleSeat = async (seat: Seat) => {
    // Prevent selecting occupied seats
    if (seat.occupied) {
      console.log('Seat is occupied, cannot select:', seat);
      return;
    }

    // Get seat row and number from the seat object
    let seatRow = seat.seatRow;
    let seatNumber = seat.seatNumber;
    const displayId = seat.id; // This is the display ID (e.g., "1A", "2B")

    console.log('Toggle seat - seat object:', seat);
    console.log('Toggle seat - seatRow:', seatRow, 'seatNumber:', seatNumber);
    console.log('Toggle seat - displayId:', displayId);

    // If seatRow or seatNumber is missing, try to extract from displayId
    // Display ID format: "1A", "2B", "7J" (row number + letter)
    if (!seatRow || !seatNumber) {
      console.warn('Seat row or number missing, attempting to extract from displayId:', displayId);
      
      // Try to extract: first character(s) = row, rest = seat number
      // Pattern: "1A" -> row="1", number="A"
      // Pattern: "12A" -> row="12", number="A" (if rows go beyond 9)
      const match = displayId.match(/^(\d+)([A-Z]+)$/);
      if (match) {
        seatRow = match[1];
        seatNumber = match[2];
        console.log('Extracted from displayId - seatRow:', seatRow, 'seatNumber:', seatNumber);
      } else {
        // Try reverse pattern: "A1" -> row="A", number="1"
        const reverseMatch = displayId.match(/^([A-Z]+)(\d+)$/);
        if (reverseMatch) {
          seatRow = reverseMatch[1];
          seatNumber = reverseMatch[2];
          console.log('Extracted from displayId (reverse) - seatRow:', seatRow, 'seatNumber:', seatNumber);
        }
      }
    }

    // Validate seatRow and seatNumber after extraction attempt
    if (!seatRow || !seatNumber) {
      console.error('Seat row or number is missing after extraction attempt:', { 
        seat, 
        seatRow, 
        seatNumber, 
        displayId 
      });
      alert('Seat information is missing. Please refresh the page and try again.');
      return;
    }

    console.log('Toggle seat called:', { seat, seatRow, seatNumber, displayId, showId, selectedSeats });
    console.log('ShowId validation:', { 
      showId, 
      showIdType: typeof showId, 
      showIdIsNumber: typeof showId === 'number',
      showIdIsValid: showId !== undefined && showId !== null && !isNaN(Number(showId))
    });

    if (selectedSeats.includes(displayId)) {
      // Deselect seat - just remove from selection (no API call)
      setSelectedSeats(prev => prev.filter((id) => id !== displayId));
      // Remove from selectedSeatIds if we have the seatId
      if (seat.seatId) {
        setSelectedSeatIds(prev => prev.filter((id) => id !== seat.seatId!));
      }
      // Remove from selectedSeatDetails
      setSelectedSeatDetails(prev => prev.filter(s => !(s.seatRow === seatRow && s.seatNumber === seatNumber)));
    } else {
      // Select seat - just update local state (NO API call - reservation happens on Continue)
      setSelectedSeats([...selectedSeats, displayId]);
      // Track seatId if available
      if (seat.seatId) {
        setSelectedSeatIds([...selectedSeatIds, seat.seatId]);
      }
      // Store seat details for later reservation
      setSelectedSeatDetails(prev => [...prev, { seatRow, seatNumber }]);
      console.log('Seat selected (not yet reserved):', { seatRow, seatNumber, displayId });
    }
  };

  // Reserve all currently selected seats (called when user clicks Continue)
  const reserveSelectedSeats = async (): Promise<boolean> => {
    if (!showId || selectedSeats.length === 0) {
      console.error('Cannot reserve seats: missing showId or no seats selected');
      return false;
    }

    // If selectedSeatDetails is empty but selectedSeats has items, derive details from selectedSeats
    let seatDetailsToUse = selectedSeatDetails;
    if (seatDetailsToUse.length === 0 && selectedSeats.length > 0) {
      console.log('selectedSeatDetails is empty, deriving from selectedSeats:', selectedSeats);
      seatDetailsToUse = selectedSeats.map(displayId => {
        const match = displayId.match(/^(\d+)([A-Z]+)$/);
        if (match) {
          return {
            seatRow: match[1],
            seatNumber: match[2]
          };
        }
        return null;
      }).filter((detail): detail is {seatRow: string, seatNumber: string} => detail !== null);
      
      // Update selectedSeatDetails for future use
      setSelectedSeatDetails(seatDetailsToUse);
    }

    if (seatDetailsToUse.length === 0) {
      console.error('Cannot reserve seats: unable to extract seat details from selected seats');
      alert('Unable to process seat selection. Please try selecting seats again.');
      return false;
    }

    // Check if seats are already in the active reservation
    const selectedDisplayIds = seatDetailsToUse.map(detail => `${detail.seatRow}${detail.seatNumber}`);
    const allSeatsInReservation = selectedDisplayIds.every(id => reservationSeats.includes(id));
    
    if (reservationShowId === showId && allSeatsInReservation && selectedDisplayIds.length === reservationSeats.length) {
      // Seats are already reserved and match the active reservation - skip API call
      console.log('Seats are already in active reservation, skipping reservation API call');
      return true;
    }

    try {
      const requestBody = {
        showId: showId,
        seats: seatDetailsToUse.map(detail => ({
          seatRow: detail.seatRow,
          seatNumber: detail.seatNumber
        }))
      };

      console.log('Reserving selected seats:', requestBody);
      const response = await api.post('/api/seats/reserve', requestBody);
      console.log('Seats reserved successfully, response:', response.data);
      
      // Seats are reserved - we don't need the IDs anymore since we use showId + row/number
      return true;
    } catch (err: any) {
      console.error('Error reserving seats:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
      alert(`Failed to reserve seats: ${errorMsg}`);
      return false;
    }
  };

  // Reserve multiple seats (legacy function - kept for compatibility)
  const reserveSeats = async (showId: number, seatIds: number[]) => {
    try {
      // This function is deprecated - use reserveSelectedSeats instead
      console.warn('reserveSeats with seatIds is deprecated. Use reserveSelectedSeats instead.');
      await api.post('/api/seats/reserve', {
        showId: showId,
        seatIds: seatIds
      });
      return true;
    } catch (err) {
      console.error('Error reserving seats:', err);
      return false;
    }
  };

  const resetSeats = () => {
    // Just clear local state - seats aren't reserved until Continue is clicked
    setSelectedSeats([]);
    setSelectedSeatIds([]);
    setSelectedSeatDetails([]);
  };

  // Combine frontRows and backRows into a single rows array
  const rows = useMemo(() => {
    return [...frontRows, ...backRows];
  }, [frontRows, backRows]);

  return {
    selectedSeats, // Display IDs for UI
    selectedSeatIds, // Actual database seat IDs for API calls
    selectedSeatDetails, // Seat row/number details for reservation
    rows, // Combined rows array for CinemaLayout
    frontRows, // Keep for backward compatibility if needed
    backRows, // Keep for backward compatibility if needed
    toggleSeat,
    resetSeats,
    reserveSelectedSeats, // New function to reserve all selected seats
    reserveSeats, // Legacy function (deprecated)
    loading,
    error,
    totalSeats: frontRows.length * frontRows[0]?.length + backRows.length * backRows[0]?.length || 0,
  };
}
