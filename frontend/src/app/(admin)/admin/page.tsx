'use client';

import { useEffect, useState } from 'react';
import NavBar from '@/components/common/navBar/NavBar';
import AdminCard from '@/components/specific/admin/AdminCard';
import AdminNavBar from '@/components/common/navBar/AdminNavBar';

interface Movie {
  id: number;
  title: string;
  date: string;
  time: string;
  _meta?: {
    showtimes?: Array<{ date: string; time: string; ampm: string }>
  };
}

const defaultMovies: Movie[] = [
  { id: 1, title: 'Oldboy', date: '12/15/2025', time: '7:30PM' },
  { id: 2, title: 'Him', date: '12/20/2025', time: '8:00PM' },
  { id: 3, title: 'Beauty and the Beast', date: '12/18/2024', time: '6:45PM' },
  { id: 4, title: 'Godzilla', date: '12/22/2025', time: '9:15PM' },
  { id: 5, title: 'Superman', date: '12/16/2025', time: '7:00PM' },
  { id: 6, title: 'Tron', date: '12/19/2025', time: '8:30PM' },
  { id: 7, title: 'The Conjuring', date: '12/21/2025', time: '10:00PM' },
  { id: 8, title: 'Demon Slayer', date: '12/17/2025', time: '6:30PM' },
  { id: 9, title: 'The Long Walk', date: '12/23/2025', time: '7:45PM' },
  { id: 10, title: 'Good Boy', date: '12/24/2025', time: '5:30PM' },
  { id: 11, title: 'Downton Abbey', date: '12/25/2025', time: '4:00PM' },
];

export default function AdminHomePage() {
  const [movies, setMovies] = useState(defaultMovies);

  useEffect(() => {
    const savedMovies = sessionStorage.getItem('movies');
    if (savedMovies) {
      try {
        const parsed = JSON.parse(savedMovies) as Movie[];
        // merge with defaults, keeping session data
        const merged = [...defaultMovies];
        parsed.forEach(p => {
          const idx = merged.findIndex(m => m.id === p.id);
          if (idx >= 0) {
            merged[idx] = p;
          } else {
            merged.push(p);
          }
        });
        setMovies(merged);
      } catch (err) {
        console.error('Failed to load movies from session:', err);
      }
    }
  }, []);

  const getShowtimes = () => {
    const result: Array<{ key: string; title: string; date: string; time: string; ampm: string }> = [];
    
    for (const movie of movies) {
      let showtimes = movie._meta?.showtimes;
      
      if (!showtimes || showtimes.length === 0) {
        const timeMatch = movie.time.match(/(\d+:\d+)\s*(AM|PM)/i);
        let timeStr = movie.time.replace(/AM|PM/i, '').trim();
        if (timeMatch) {
          timeStr = timeMatch[1];
        }
        
        let ampmStr = 'PM';
        if (movie.time.toUpperCase().includes('AM')) {
          ampmStr = 'AM';
        }
        
        showtimes = [{
          date: movie.date,
          time: timeStr,
          ampm: ampmStr
        }];
      }
      
      showtimes.forEach((s, i) => {
        result.push({
          key: `${movie.id}-${i}`,
          title: movie.title,
          date: s.date,
          time: s.time,
          ampm: s.ampm
        });
      });
    }
    
    return result.slice(0, 12);
  };

  const upcomingShowtimes = getShowtimes();

  return (
    <div className="text-white pb-16" style={{ backgroundColor: '#1C1C1C', minHeight: '100vh' }}>
      <AdminNavBar />
      <div className="h-30" />

      <div className="max-w-[70rem] mx-auto px-4 mt-6">
        <h1 className="text-3xl sm:text-4xl font-red-rose">Admin Home Page</h1>
      </div>

      <div className="max-w-[70rem] mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <AdminCard href="/admin/movies" title="Manage Movies" tooltip="Manage movies and scheduling" />
        <AdminCard href="/admin/pricing" title="Manage Pricing" tooltip="Manage pricing, fees, and discounts" />
        <AdminCard href="/admin/users" title="Manage Users" tooltip="Manage users" />
      </div>

      {<div className="max-w-[70rem] mx-auto px-4 mt-10 mb-16">
        <h2 className="text-xl font-afacad mb-3">Upcoming Showtimes</h2>
        <div className="rounded-md p-4 sm:p-6 overflow-y-auto" style={{ backgroundColor: '#242424', border: '1px solid #FF478B', maxHeight: '360px' }}>
          {upcomingShowtimes.length === 0 && (
            <div className="text-white/70">No showtimes available</div>
          )}
          {upcomingShowtimes.length > 0 && (
            <ul className="divide-y divide-white/10">
              {upcomingShowtimes.map((s) => (
                <li key={s.key} className="py-3 sm:py-4">
                  <div className="flex items-center gap-4">
                    <div className="font-afacad flex-1">{s.title}</div>
                    <div className="text-white/80 font-afacad">{s.date} {s.time} {s.ampm}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>}
    </div>
  );
}