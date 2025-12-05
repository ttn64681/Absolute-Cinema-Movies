"use client";

import { useEffect, useState } from "react";
import { BackendMovieShow } from "@/types/admin";
import { useAdminMovieShows } from '@/hooks/useAdminMovieShows';

type Showtime = {
  date: string;
  time: string;
  ampm: string;
  room?: string;
};

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (movieId: number) => void;
  movieId: number;
  movieTitle: string;
  //existingShowtimes?: Showtime[];
}

// Hardcoded show rooms with capacities: 60, 70, 80, 90
const SHOW_ROOMS = [
  { id: 3, name: "A", capacity: 60 },
  { id: 4, name: "B", capacity: 70 },
  { id: 5, name: "C", capacity: 80 },
  { id: 6, name: "D", capacity: 90 },
];

export default function ScheduleModal({
  isOpen,
  onClose,
  onSchedule,
  movieId,
  movieTitle,
}: ScheduleModalProps) {

  const {movieShows, isLoading, error, scheduleMovieShow} = useAdminMovieShows(movieId);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedShowRoomId, setSelectedShowRoomId] = useState<number | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>(movieShows);

  // Update showtimes when existingShowtimes prop changes
  useEffect(() => {
    setShowtimes(movieShows);
  }, [movieShows]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate("");
      setSelectedTime("");
      setSelectedShowRoomId(null);
      setShowtimes(movieShows);
    }
  }, [isOpen]);

  // Save the new movie show!
  const handleSchedule = async () => {
    console.log(selectedDate);
    console.log(selectedTime);
    console.log(selectedShowRoomId);

    if (selectedDate && selectedTime && selectedShowRoomId !== null) {

      // Parse the input date
      const dateParts = selectedDate.split("-");
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed in JavaScript
      const day = parseInt(dateParts[2], 10);

      // Parse the input time
      const timeParts = selectedTime.split(/:|\s/); // Split by ":" and whitespace
      let hour = parseInt(timeParts[0], 10);
      const minute = parseInt(timeParts[1], 10);
      const period = timeParts[2]; // "AM" or "PM"

      console.log(hour, minute);

      // Convert to 24-hour format if necessary
      if (period === "PM" && hour < 12) {
          hour += 12; // Convert PM hour
      }
      if (period === "AM" && hour === 12) {
          hour = 0; // 12 AM should be 0 hours
      }

      console.log(hour, minute);

      // Create a Date object
      const dateTime = new Date(year, month, day, hour, minute, 0); // Seconds set to 0
      console.log(dateTime);

      // Get all the pieces to create a string that looks like a Java LocalDateTime object (for backend)
      const localYear = dateTime.getFullYear();
      const localMonth = String(dateTime.getMonth() + 1).padStart(2, '0');
      const localDate = String(dateTime.getDate()).padStart(2, '0');

      const localHour = String(dateTime.getHours()).padStart(2, '0');
      const localMinute = String(dateTime.getMinutes()).padStart(2, '0');

      // Format to mimic Java LocalDateTime (YYYY-MM-DDTHH:mm:ss)
      const formattedDateTime = `${localYear}-${localMonth}-${localDate}T${localHour}:${localMinute}:00`;
      console.log(formattedDateTime);

      // Create an object the backend will accept
      const newMovieShow: BackendMovieShow = {
          movieId: movieId,
          showRoomId: selectedShowRoomId,
          startTime: formattedDateTime
      }

      // Send the movie show to backend and await response
      const movieShowStatus = await scheduleMovieShow(newMovieShow, movieTitle, selectedDate, selectedTime, selectedShowRoomId);
      if (movieShowStatus) {
        //alert("Movie show for \" " + movieTitle + "\"  on " + selectedDate + " at " + selectedTime + " in Showroom " + selectedShowRoomId + " successfully scheduled.");
        //onClose();
      } else {
        //alert("Movie show schedule conflict. Check that there isn't another show at the same time in the same room.");
      }
      
    }
  };

  if (!isOpen) return null;

  // Hardcoded date options (mid-December to early January)
  // TODO: Replace with dates from backend
  const generateDateOptions = () => {
    return [
      "2025-12-15",
      "2025-12-16",
      "2025-12-17",
      "2025-12-18",
      "2025-12-19",
      "2025-12-20",
      "2025-12-21",
      "2025-12-22",
      "2025-12-23",
      "2025-12-24",
      "2025-12-25",
      "2025-12-26",
      "2025-12-27",
      "2025-12-28",
      "2025-12-29",
      "2025-12-30",
      "2025-12-31",
    ];
  };

  // Generate time options
  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let hour = 10; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const m = String(minute).padStart(2, "0");
        const ampm = hour >= 12 ? "PM" : "AM";
        times.push(`${h}:${m} ${ampm}`);
      }
    }
    return times;
  };

  const dateOptions = generateDateOptions();
  const timeOptions = generateTimeOptions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal Container */}
      <div
        className="bg-white/3 backdrop-blur-md rounded-lg p-6 sm:p-8 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          title="Close"
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 text-white text-2xl hover:text-white/70 transition-colors leading-none"
        >
          ×
        </button>

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-white text-xl font-bold">Schedule Showtime</h2>
          <p className="text-white/80 text-sm font-afacad mt-2">Movie: <span className="text-white font-semibold">{movieTitle}</span></p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Existing Scheduled Showtimes */}
          {showtimes.length > 0 && (
            <div>
              <label className="block text-sm mb-3 font-afacad text-white">Scheduled Showtimes</label>
              <div
                className="rounded-md overflow-hidden shadow-lg h-48 overflow-y-auto bg-white/5 backdrop-blur-sm"
              >
                {showtimes.map((showtime, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-5 py-4 border-b border-white/10"
                  >
                    <div className="flex-1 font-afacad flex items-center gap-4">
                      <span className="w-32">{showtime.date}</span>
                      <span className="w-32">{showtime.time} {showtime.ampm}</span>
                      {showtime.room && (
                        <span className="w-40 text-white/60 text-sm">Room {showtime.room}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {showtimes.length > 0 && (
            <div className="border-t border-white/10 my-2" />
          )}

          {/* Add New Showtime Section */}
          <div>
            <label className="block text-sm mb-3 font-afacad text-white">Add New Showtime</label>
          </div>
          {/* Select Date */}
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Show Date</label>
            <div className="relative">
              <select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  console.log("Date:" + selectedDate);
                  setSelectedTime("");
                  setSelectedShowRoomId(null);
                }}
                className="w-full pl-4 pr-10 py-3 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent appearance-none cursor-pointer font-afacad"
              >
                <option value="">-Select Date-</option>
                {dateOptions.map((date) => (
                  <option key={date} value={date} className="bg-[#242424]">
                    {date}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Select Time */}
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Show Time</label>
            <div className="relative">
              <select
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  console.log("Time:" + selectedTime);
                  setSelectedShowRoomId(null);
                }}
                disabled={!selectedDate}
                className={`w-full pl-4 pr-10 py-3 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent appearance-none font-afacad ${
                  !selectedDate ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <option value="">-Select Time-</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time} className="bg-[#242424]">
                    {time}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Select Show Room */}
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Show Room</label>
            <div className="relative">
              <select
                value={selectedShowRoomId || ""}
                onChange={(e) => {
                  setSelectedShowRoomId(e.target.value ? Number(e.target.value) : null);
                  console.log(selectedShowRoomId);
                }}
                disabled={!selectedTime}
                className={`w-full pl-4 pr-10 py-3 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent appearance-none font-afacad ${
                  !selectedTime ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <option value="">-Select Room-</option>
                {SHOW_ROOMS.map((room) => (
                  <option key={room.id} value={room.id} className="bg-[#242424]">
                    {room.id}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-full font-afacad text-white border border-white/30 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSchedule}
              disabled={!selectedDate || !selectedTime || selectedShowRoomId === null}
              className={`px-8 py-2 rounded-full font-afacad font-bold text-black bg-gradient-to-r from-[#FF478B] to-[#FF5C33] ${
                selectedDate && selectedTime && selectedShowRoomId !== null
                  ? "opacity-100 hover:shadow-md hover:underline hover:shadow-acm-pink/50"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

