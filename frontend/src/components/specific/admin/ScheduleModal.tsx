"use client";

import { useEffect, useState } from "react";

type Showtime = {
  date: string;
  time: string;
  ampm: string;
  room?: string;
};

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: string, time: string, showRoomId: number) => void;
  movieId: number;
  movieTitle: string;
  existingShowtimes?: Showtime[];
}

// Hardcoded show rooms: A, B, C
const SHOW_ROOMS = [
  { id: 1, name: "A" },
  { id: 2, name: "B" },
  { id: 3, name: "C" },
];

export default function ScheduleModal({
  isOpen,
  onClose,
  onSchedule,
  movieId,
  movieTitle,
  existingShowtimes = [],
}: ScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedShowRoomId, setSelectedShowRoomId] = useState<number | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>(existingShowtimes);

  // Update showtimes when existingShowtimes prop changes
  useEffect(() => {
    setShowtimes(existingShowtimes);
  }, [existingShowtimes]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate("");
      setSelectedTime("");
      setSelectedShowRoomId(null);
      setShowtimes(existingShowtimes);
    }
  }, [isOpen, existingShowtimes]);

  const handleSchedule = () => {
    if (selectedDate && selectedTime && selectedShowRoomId !== null) {
      // Parse time string (e.g., "7:30 PM" -> time: "7:30", ampm: "PM")
      const timeParts = selectedTime.trim().split(/\s+/);
      const timeValue = timeParts[0];
      const ampm = timeParts[1] || 'PM';

      const roomName = SHOW_ROOMS.find(room => room.id === selectedShowRoomId)?.name || '';

      // Create new showtime object
      const newShowtime: Showtime = {
        date: selectedDate,
        time: timeValue,
        ampm,
        room: roomName,
      };

      // Add to local showtimes list immediately
      setShowtimes((prev) => [...prev, newShowtime]);

      // Save to parent component (which updates movie data)
      onSchedule(selectedDate, selectedTime, selectedShowRoomId);

      // Reset form fields after scheduling
      setSelectedDate("");
      setSelectedTime("");
      setSelectedShowRoomId(null);
    }
  };

  if (!isOpen) return null;

  // Hardcoded date options (mid-December to early January)
  // TODO: Replace with dates from backend
  const generateDateOptions = () => {
    return [
      "12/15/2024",
      "12/16/2024",
      "12/17/2024",
      "12/18/2024",
      "12/19/2024",
      "12/20/2024",
      "12/21/2024",
      "12/22/2024",
      "12/23/2024",
      "12/24/2024",
      "12/25/2024",
      "12/26/2024",
      "12/27/2024",
      "12/28/2024",
      "12/29/2024",
      "12/30/2024",
      "12/31/2024",
      "01/01/2025",
      "01/02/2025",
      "01/03/2025",
      "01/04/2025",
      "01/05/2025",
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
                onChange={(e) => setSelectedShowRoomId(e.target.value ? Number(e.target.value) : null)}
                disabled={!selectedTime}
                className={`w-full pl-4 pr-10 py-3 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent appearance-none font-afacad ${
                  !selectedTime ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <option value="">-Select Room-</option>
                {SHOW_ROOMS.map((room) => (
                  <option key={room.id} value={room.id} className="bg-[#242424]">
                    {room.name}
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
                  ? "opacity-100"
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

