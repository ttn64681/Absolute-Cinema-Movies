'use client';
import { buildUrl, endpoints } from '../config/api';
import { AdminMovie, PaginatedMovieResponse } from '@/types/admin';

// Fetches paginated movies for the Manage Movies page (10 at a time)
// Calls the getAllMoviesPaginated endpoint in MovieController
async function fetchMoviesPaginated(pageNum: number) {
    try {
          // Verify that login token is present (TODO: make a function to check if the ID matches the admin ID in the database)
          // const token = localStorage.getItem('token') || sessionStorage.getItem('token');

          // Fetch paginated now playing movies (test))
          const response = await fetch(buildUrl(`/api/movies/browse/all?page=${pageNum}`), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              
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
    const response = await fetch(buildUrl(`/api/movies/${movieId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
    console.log("Movie being created: " + JSON.stringify(movie));
    const response = await fetch(buildUrl(`/api/movies/create`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movie)
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
    console.log("Movie being edited " + JSON.stringify(movie));
    const response = await fetch(buildUrl(`/api/movies/${movieId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movie)
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

export { fetchMoviesPaginated, getMovieDetails, createNewMovie, editExistingMovie };