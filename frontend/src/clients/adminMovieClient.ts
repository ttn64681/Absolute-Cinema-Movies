'use client';
import { buildUrl } from '../config/api';
import { AdminMovie, PaginatedMovieResponse } from '@/types/admin';

/**
 * Fetches paginated movies for the Manage Movies page (10 at a time)
 * Calls the getAllMoviesPaginated endpoint in MovieController
 *
 * Used by: useMovies hook
 */
async function fetchMoviesPaginated(pageNum: number) {
  try {
    // Get auth token for admin requests (movies endpoints are public but good practice)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    // Fetch paginated now playing movies (test))
    const response = await fetch(buildUrl(`/api/movies/browse/all?page=${pageNum}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch movies: ${response.status}`);
    }
    const responseText = await response.text();
    if (!responseText.trim()) {
      throw new Error('Empty response from server');
    }
    const data: PaginatedMovieResponse = JSON.parse(responseText);
    return data;
  } catch (error) {
    console.error('Error fetching movies on admin page: ', error);
  }
}

// Fetch ALL information about a single movie
// Calls the getMovieDetails backend endpoint in MovieController
async function getMovieDetails(movieId: number) {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(buildUrl(`/api/movies/${movieId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch movies: ${response.status}`);
    }
    const responseText = await response.text();
    if (!responseText.trim()) {
      throw new Error('Empty response from server');
    }
    const data: AdminMovie = JSON.parse(responseText);
    return data;
  } catch (error) {
    console.error('Error fetching movie info: ', error);
  }
}

// Create a NEW movie
// Calls the createMovie backend endpoint in MovieController
async function createNewMovie(movie: Partial<AdminMovie>) {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('Movie being created: ' + JSON.stringify(movie));
    const response = await fetch(buildUrl(`/api/movies/create`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(movie),
    });

    if (!response.ok) {
      throw new Error(`Failed to create movie: ${response.status}`);
    }
    const responseText = await response.text();
    if (!responseText.trim()) {
      throw new Error('Empty response from server');
    }

    const data: AdminMovie = JSON.parse(responseText);

    return data;
  } catch (error) {
    console.error('Error creating movie: ', error);
  }
}

// UPDATES an existing movie
// Calls the editMovie backend endpoint in MovieController
async function editExistingMovie(movie: Partial<AdminMovie>, movieId: number) {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('Movie being edited ' + JSON.stringify(movie));
    const response = await fetch(buildUrl(`/api/movies/${movieId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(movie),
    });

    if (!response.ok) {
      throw new Error(`Failed to update movie: ${response.status}`);
    }
    const responseText = await response.text();
    if (!responseText.trim()) {
      throw new Error('Empty response from server');
    }

    const data: AdminMovie = JSON.parse(responseText);

    return data;
  } catch (error) {
    console.error('Error creating movie: ', error);
  }
}

// Deletes a movie
// Movie must be upcoming (has no movie shows) for this to work
async function deleteExistingMovie(movieId: number) {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(buildUrl(`/api/movies/${movieId}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete movie: ${response.status}`);
    }
    const responseText = await response.text();
    if (!responseText.trim()) {
      throw new Error('Empty response from server');
    }

    const data = JSON.parse(responseText);

    return data;
  } catch (error) {
    console.error('Error creating movie: ', error);
  }
}

// Gets all showtimes (date and time combined) for a single movie
// Calls the getAvailableTimes backend endpoint in MovieController
async function getShowtimes(movieId: number) {
  try {
    const response = await fetch(buildUrl(`/api/movies/${movieId}/times/combined`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve showtimes: ${response.status}`);
    }
    const responseText = await response.text();
    if (!responseText.trim()) {
      throw new Error('Empty response from server');
    }

    const data: AdminMovie = JSON.parse(responseText);

    return data;
  } catch (error) {
    console.error('Error retrieving showtimes: ', error);
  }
}

export { fetchMoviesPaginated, getMovieDetails, createNewMovie, editExistingMovie, deleteExistingMovie, getShowtimes };
