'use client';
import { buildUrl, endpoints } from '../config/api';
import { ShowTime, PaginatedMovieResponse, BackendMovieShow } from '@/types/admin';

// Gets all showtimes (date and time combined) for a single movie
// Calls the getAvailableTimes backend endpoint in MovieController
async function getMovieShowsForMovie(movieId: number) {
  try {
    const response = await fetch(buildUrl(`/api/movie-shows/movie/${movieId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve movie shows: ${response.status}`);
    }
    const responseText = await response.text();
    if (!responseText.trim()) {
      throw new Error('Empty response from server');
    } 

    const data: ShowTime[] = JSON.parse(responseText);

    return data;

  } catch (error) {
    console.error('Error retrieving movie shows: ', error);
  }
}

async function createMovieShow(newShow: BackendMovieShow) {
  try {
    const response = await fetch(buildUrl(`/api/movie-shows`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newShow)
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve movie shows: ${response.status}`);
    }
    const responseText = await response.text();
    if (!responseText.trim()) {
      throw new Error('Empty response from server');
    } 

    const data = JSON.parse(responseText);

    return data;

  } catch (error) {
    console.error('Error retrieving movie shows: ', error);
  }
}

export { getMovieShowsForMovie, createMovieShow };