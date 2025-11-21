'use client';
import { buildUrl, endpoints } from '../config/api';
import { AdminMovie, PaginatedMovieResponse } from '@/types/admin';

async function fetchMoviesPaginated(pageNum: number) {
    try {
          // Verify that login token is present (TODO: make a function to check if the ID matches the admin ID in the database)
          // const token = localStorage.getItem('token') || sessionStorage.getItem('token');

          // Fetch paginated now playing movies (test))
          const response = await fetch(buildUrl(`/api/movies/browse/now-playing?page=${pageNum}`), {
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
            console.error('Error fetching movies on admin page:', error);
    }
}

export { fetchMoviesPaginated };