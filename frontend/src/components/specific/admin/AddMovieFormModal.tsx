"use client";

import { useEffect, useState } from "react";
import { formatDateInput, formatTimeInput, parseScore } from "@/components/specific/admin/movieFormUtils";
import { useAdminMovie } from '@/hooks/useAdminMovie';

type Showtime = {
  date: string;
  time: string;
  ampm: string;
  room?: string;
};

export type AdminMovie = {
  movie_id: number;
  title: string;
  status: string;
  genres: string;
  rating: string;
  release_date: string;
  synopsis: string;
  trailer_link: string;
  poster_link: string;
  cast_names: string;
  directors: string;
  producers: string;
  score: number;
  duration: number;
}

interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (savedMovie: AdminMovie) => void;
}

// Add/edit movie form
export default function AddMovieFormModal({ isOpen, onClose, onSaved }: MovieFormModalProps) {

  const {selectedMovie, isLoading, error, addMovie, refreshMovie} = useAdminMovie(0);

  //const [editingMovie, setEditingMovie] = useState(dummyMovie);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [genres, setGenres] = useState("");
  const [poster_link, setPosterLink] = useState("");
  const [trailer_link, setTrailerLink] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [directors, setDirectors] = useState("");
  const [producers, setProducers] = useState("");
  const [cast_names, setCastNames] = useState("");
  //const [reviews, setReviews] = useState("");
  const [rating, setRating] = useState("");
  const [duration, setDuration] = useState(0);
  const [score, setScore] = useState(0);
  const [release_date, setReleaseDate] = useState("");
  //const [showtimes, setShowtimes] = useState<Showtime[]>([{ date: "", time: "", ampm: "AM" }]);


  useEffect(() => {
    if (!isOpen) return;

      setTitle("");
      setStatus("upcoming");
      setGenres("");
      setPosterLink("");
      setTrailerLink("");
      setSynopsis("");
      setDirectors("");
      setProducers("");
      setCastNames("");
      setRating("");
      setScore(0);
      setDuration(0);
      setReleaseDate("");
      console.log("Selected movie data was not set");
  
  }, [isOpen]);

  /*const handleAddShowtime = () => setShowtimes((prev) => [...prev, { date: "", time: "", ampm: "AM" }]);
  const handleRemoveShowtime = (index: number) => setShowtimes((prev) => prev.filter((_, i) => i !== index));
  const updateShowtime = (index: number, field: keyof Showtime, value: string) => {
    setShowtimes((previousShowtimes) =>
      previousShowtimes.map((showtime, i) => (i === index ? { ...showtime, [field]: value } : showtime))
    );
  };*/

  // Display helpers 
  const getHeaderTitle = () => {
    return "Add Movie";
  };

  const getStatusLabel = (status: String) => {
    if (status == "now_playing") {
      return "Now Playing";
    } else {
      return "Upcoming";
    }
  };

  const getPosterNameClass = () => {
    if (poster_link) return "text-white";
    return "opacity-80";
  };
  const getPosterDisplayText = () => {
    if (poster_link) return poster_link;
    return "Select File";
  };
  const isSaveDisabled = () => {
    if (saving) return true;
    if (!formValid()) return true;
    return false;
  };
  const getSaveOpacity = () => {
    if (isSaveDisabled()) return 0.6;
    return 1;
  };
  const getSaveButtonLabel = () => {
    if (saving) return "Saving...";
    return "Save";
  };

  const formValid = () => {
    if (!title || !genres || !synopsis) return false;
    //if (!showtimes.length || !showtimes[0].date || !showtimes[0].time) return false;
    return true;
  };

    const onSave = async () => {
      if (!formValid()) return;
      setSaving(true);
  
      /*const existing = typeof window !== "undefined" ? sessionStorage.getItem("movies") : null;
      const parsed: AdminMovie[] = existing ? JSON.parse(existing) : [];
  
        const primary = showtimes[0];*/
  
        // Partial movie object to send to backend
        const backendMovieRequest: Partial<AdminMovie> = {
          title,
          genres,
          rating,
          release_date,
          synopsis,
          trailer_link,
          poster_link,
          cast_names,
          directors,
          producers,
          duration,
          score
        };
  
      //sessionStorage.setItem("movies", JSON.stringify(updated));
      const newMovieId = await addMovie(backendMovieRequest);
      if (newMovieId) {
        // Full movie object to return to the movies list
        const updatedMovie: AdminMovie = {
          movie_id: newMovieId,
          status,
          title,
          genres,
          rating,
          release_date,
          synopsis,
          trailer_link,
          poster_link,
          cast_names,
          directors,
          producers,
          duration,
          score
        };
        onSaved(updatedMovie);
        refreshMovie();
        alert("New movie successfully created.");
      } else {
        alert("Error creating movie.");
      }
      onClose();
      setSaving(false);
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="bg-white/3 backdrop-blur-md rounded-lg p-6 sm:p-8 w-full max-w-[860px] mx-4 relative max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white text-2xl hover:text-white/70 transition-colors leading-none"
        >
          ×
        </button>

        <div className="mb-4 text-white font-red-rose text-2xl">{getHeaderTitle()}</div>

        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-6 mb-6">
          {/* Title */ }
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Movie Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter movie title"
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent"
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* Status */ }
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Status</label>
            <div className="relative cursor-not-allowed">
              <p
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent"
              style={{ fontSize: "16px" }}
              >
              {getStatusLabel(status)}
            </p>
            </div>
          </div>
        </div>

        {/* Genres */ }
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-6 mb-6">
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Genres</label>
            <div className="relative">
              <input
                type="text"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                placeholder="Enter genres"
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent"
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>

        {/* Rating */ }
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Rating</label>
            <div className="relative">
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full pl-4 pr-4 py-3 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">-Select-</option>
                <option value="G">G</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
                <option value="NC-17">NC-17</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
    
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">

          {/* Release Date */ }
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Release Date</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={release_date}
                onChange={(e) => setReleaseDate(e.target.value)}
                placeholder="ex. 2025-03-18"
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent no-number-spinner"
              />
            </div>
          </div>

          {/* Score */ }
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Score (1-100%)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={100}
                inputMode="numeric"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="ex. 85%"
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent no-number-spinner"
              />
              <span className="text-white/80">%</span>
            </div>
          </div>

          {/* Duration */ }
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Duration (minutes)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={180}
                inputMode="numeric"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="ex. 120"
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent no-number-spinner"
              />
              <span className="text-white/80"></span>
            </div>
          </div>

        </div>

        {/* Poster link */ }
          <div className="mb-6">
            <label className="block text-sm mb-2 font-afacad text-white">Poster URL</label>
              <input
                type="url"
                value={poster_link}
                onChange={(e) => setPosterLink(e.target.value)}
                placeholder="Enter poster link (embed)"
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent"
              />
          </div>

        {/* Trailer link */ }
        <div className="mb-6">
          <label className="block text-sm mb-2 font-afacad text-white">Trailer URL</label>
          <input
            type="url"
            value={trailer_link}
            onChange={(e) => setTrailerLink(e.target.value)}
            placeholder="Enter trailer link (embed)"
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent"
          />
        </div>

        {/* Synopsis */ }
        <div className="mb-6">
          <label className="block text-sm mb-2 font-afacad text-white">Synopsis</label>
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="Enter movie synopsis"
            rows={4}
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent resize-none"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#6B7280 #374151", lineHeight: "1.5" }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Director(s)</label>
            <input
              type="text"
              value={directors}
              onChange={(e) => setDirectors(e.target.value)}
              placeholder="Enter director name"
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Producer(s)</label>
            <input
              type="text"
              value={producers}
              onChange={(e) => setProducers(e.target.value)}
              placeholder="Enter producer name"
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-2 font-afacad text-white">Cast</label>
          <textarea
            value={cast_names}
            onChange={(e) => setCastNames(e.target.value)}
            placeholder="Enter cast members"
            rows={4}
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent resize-none"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#6B7280 #374151" }}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full font-afacad text-white border border-white/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaveDisabled()}
            className="px-8 py-2 rounded-full font-afacad font-bold text-black"
            style={{ background: "linear-gradient(to right, #FF478B, #FF5C33)", opacity: getSaveOpacity() }}
          >
            {getSaveButtonLabel()}
          </button>
        </div>
      </div>
    </div>
  );
}


