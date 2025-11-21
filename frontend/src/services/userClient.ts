'use client';
import { buildUrl } from '../config/api';
import { BackendUser } from '@/types/user';

/* FACADE FOR USER PROFILE DATA.
* Only purpose is to handle API requests and return the responses. */

// Helper function to get userId from JWT token
function getUserIdFromToken(): number {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return 0;

  try {
    const [, payloadBase64] = token.split('.');
    const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const userData = JSON.parse(decodedPayload);
    return userData.userId || 0;
  } catch (error) {
    console.error('Error decoding token:', error);
    return 0;
  }
}

// Function to fetch user data from backend (calls getUserProfile endpoint)
async function getUserInfo(userId: number) {
    try {
        // Get token from storage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
        // Get userId from token if not provided
        const actualUserId = userId || getUserIdFromToken();
        if (!actualUserId) {
          console.error('No user ID available');
          return null;
        }
    
        // Single API call to get all user profile data (user info + home address + payment cards)
        const response = await fetch(buildUrl(`/api/user/profile?userId=${actualUserId}`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (!response.ok) {
            console.error('Failed to fetch user profile:', response.status, response.statusText);
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

// Function to send updated user information to the backend (calls updateCurrentUserInfo endpoint)
async function updateUserInfo(userId: number, userInfo: Partial<BackendUser>) {
  console.log('ID: ' + userId);
  console.log(userInfo);
  try {
    // Get token from storage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    // Get userId from token if not provided
    const actualUserId = userId || getUserIdFromToken();
    if (!actualUserId) {
      console.error('No user ID available');
      return null;
    }

    const response = await fetch(buildUrl(`/api/user/info?userId=${actualUserId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(userInfo),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user info:', error);
    return null;
  }
}

// Function to request the backend to change a user's password (calls changeCurrentUserPassword endpoint)
async function changePassword(userId: number, passwordInfo: Partial<BackendUser>) {
  try {
    // Get token from storage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    // Get userId from token if not provided
    const actualUserId = userId || getUserIdFromToken();
    if (!actualUserId) {
      console.error('No user ID available');
      return null;
    }

    const response = await fetch(buildUrl(`/api/user/change-password?userId=${actualUserId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(passwordInfo),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating password:', error);
    return null;
  }
}

// Exports the functions that call the API, so they can be called from other files
export { getUserInfo, updateUserInfo, changePassword }; 