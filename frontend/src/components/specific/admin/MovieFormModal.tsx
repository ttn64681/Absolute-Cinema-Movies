"use client";

import { useEffect, useState } from "react";
import { formatDateInput, formatTimeInput, parseScore } from "@/components/specific/admin/movieFormUtils";

type Showtime = {
  date: string;
  time: string;
  ampm: string;
  room?: string;
};

export type AdminMovie = {
  id: number;
  title: string;
  date: string;
  time: string;
  _meta?: {
    movieType?: string;
    genre?: string;
    posterName?: string | null;
    trailerUrl?: string;
    synopsis?: string;
    director?: string;
    producer?: string;
    cast?: string;
    reviews?: string;
    rating?: string;
    score?: number;
    showtimes?: Showtime[];
  };
};

interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (savedMovie: AdminMovie) => void;
  initialMovie?: AdminMovie | null;
}

export default function MovieFormModal({ isOpen, onClose, onSaved, initialMovie }: MovieFormModalProps) {
  const [title, setTitle] = useState("");
  const [movieType, setMovieType] = useState("New Movie");
  const [genre, setGenre] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [director, setDirector] = useState("");
  const [producer, setProducer] = useState("");
  const [cast, setCast] = useState("");
  const [reviews, setReviews] = useState("");
  const [rating, setRating] = useState("");
  const [score, setScore] = useState<string>("");
  const [showtimes, setShowtimes] = useState<Showtime[]>([{ date: "", time: "", ampm: "AM" }]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialMovie) {
      setEditingId(initialMovie.id);
      setTitle(initialMovie.title || "");
      setMovieType(initialMovie._meta?.movieType || "New Movie");
      setGenre(initialMovie._meta?.genre || "");
      setTrailerUrl(initialMovie._meta?.trailerUrl || "");
      setSynopsis(initialMovie._meta?.synopsis || "");
      setDirector(initialMovie._meta?.director || "");
      setProducer(initialMovie._meta?.producer || "");
      setCast(initialMovie._meta?.cast || "");
      setReviews(initialMovie._meta?.reviews || "");
      setRating(initialMovie._meta?.rating || "");
      setScore(
        typeof initialMovie._meta?.score === "number"
          ? String(initialMovie._meta.score)
          : ""
      );

      if (initialMovie._meta?.showtimes && initialMovie._meta.showtimes.length > 0) {
        setShowtimes(initialMovie._meta.showtimes);
      } else {
        let ampmValue: "AM" | "PM" = "AM";
        if (initialMovie.time.includes("AM")) {
          ampmValue = "AM";
        } else {
          ampmValue = "PM";
        }
        setShowtimes([
          {
            date: initialMovie.date,
            time: initialMovie.time.split(":").slice(0, 2).join(":"),
            ampm: ampmValue,
          },
        ]);
      }
    } else {
      // reset for new
      setEditingId(null);
      setTitle("");
      setMovieType("New Movie");
      setGenre("");
      setPosterFile(null);
      setTrailerUrl("");
      setSynopsis("");
      setDirector("");
      setProducer("");
      setCast("");
      setReviews("");
      setRating("");
      setScore("");
      setShowtimes([{ date: "", time: "", ampm: "AM" }]);
    }
  }, [isOpen, initialMovie]);

  const handleAddShowtime = () => setShowtimes((prev) => [...prev, { date: "", time: "", ampm: "AM" }]);
  const handleRemoveShowtime = (index: number) => setShowtimes((prev) => prev.filter((_, i) => i !== index));
  const updateShowtime = (index: number, field: keyof Showtime, value: string) => {
    setShowtimes((previousShowtimes) =>
      previousShowtimes.map((showtime, i) => (i === index ? { ...showtime, [field]: value } : showtime))
    );
  };

  // Display helpers 
  const getHeaderTitle = () => {
    if (editingId) return "Edit Movie";
    return "Add Movie";
  };
  const getPosterNameClass = () => {
    if (posterFile) return "text-white";
    return "opacity-80";
  };
  const getPosterDisplayText = () => {
    if (posterFile) return posterFile.name;
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
    if (!title || !genre || !synopsis) return false;
    if (!showtimes.length || !showtimes[0].date || !showtimes[0].time) return false;
    return true;
  };

  const onSave = () => {
    if (!formValid()) return;
    setSaving(true);

    const existing = typeof window !== "undefined" ? sessionStorage.getItem("movies") : null;
    const parsed: AdminMovie[] = existing ? JSON.parse(existing) : [];

      const primary = showtimes[0];
      const movieData: AdminMovie = {
        id: editingId || Date.now(),
        title,
        date: primary.date,
        time: `${primary.time} ${primary.ampm}`,
        _meta: {
          movieType,
          genre,
          posterName: posterFile?.name ?? null,
          trailerUrl,
          synopsis,
          director,
          producer,
          cast,
          reviews,
          rating,
          score: parseScore(score),
          showtimes,
        },
      };

    let updated: AdminMovie[];
    if (editingId) {
      const exists = parsed.some((m) => m.id === editingId);
      if (exists) {
        updated = parsed.map((m) => {
          if (m.id === editingId) return movieData;
          return m;
        });
      } else {
        updated = [...parsed, movieData];
      }
    } else {
      updated = [...parsed, movieData];
    }

    sessionStorage.setItem("movies", JSON.stringify(updated));
    onSaved(movieData);
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
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Type</label>
            <div className="relative">
              <select
                value={movieType}
                onChange={(e) => setMovieType(e.target.value)}
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="New Movie">New Movie</option>
                <option value="Upcoming Movie">Upcoming Movie</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Genre</label>
            <div className="relative">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full pl-4 pr-4 py-3 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none 
                focus:ring-1 focus:ring-[#FF478B] focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">-Select-</option>
                <option value="Action">Action</option>
                <option value="Adventure">Adventure</option>
                <option value="Comedy">Comedy</option>
                <option value="Drama">Drama</option>
                <option value="Horror">Horror</option>
                <option value="Romance">Romance</option>
                <option value="Sci-Fi">Sci-Fi</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Poster</label>
            <label className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white block cursor-pointer">
              <span className={getPosterNameClass()}>
                {getPosterDisplayText()}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-2 font-afacad text-white">Trailer URL</label>
          <input
            type="url"
            value={trailerUrl}
            onChange={(e) => setTrailerUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-2 font-afacad text-white">Synopsis</label>
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="Enter movie synopsis"
            rows={5}
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent resize-none"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#6B7280 #374151", lineHeight: "1.5" }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Director(s)</label>
            <input
              type="text"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              placeholder="Enter director name"
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Producer(s)</label>
            <input
              type="text"
              value={producer}
              onChange={(e) => setProducer(e.target.value)}
              placeholder="Enter producer name"
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-2 font-afacad text-white">Cast</label>
          <textarea
            value={cast}
            onChange={(e) => setCast(e.target.value)}
            placeholder="Enter cast members"
            rows={4}
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent resize-none"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#6B7280 #374151" }}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-2 font-afacad text-white">Reviews</label>
          <textarea
            value={reviews}
            onChange={(e) => setReviews(e.target.value)}
            placeholder="Enter reviews"
            rows={4}
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent resize-none"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#6B7280 #374151" }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-6 mb-6">
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
          <div>
            <label className="block text-sm mb-2 font-afacad text-white">Score (1-100%)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={100}
                inputMode="numeric"
                value={score}
                onChange={(e) => {
                  const raw = e.target.value;
                  const parsed = parseScore(raw);
                  setScore(parsed ? String(parsed) : "");
                }}
                placeholder="85%"
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#FF478B] focus:border-transparent no-number-spinner"
              />
              <span className="text-white/80">%</span>
            </div>
          </div>
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


