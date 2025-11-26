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

        // Process the JSON data
        const profileData = (await response.json()) as {
          user: {
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            enrolledForPromotions: boolean;
            profileImageLink?: string;
          };
          homeAddress: {
            street: string;
            city: string;
            state: string;
            zip: string;
            country: string;
          } | null;
        };

        // Combine user data with home address

        // User
        const userData: Partial<BackendUser> & {
          id: number;
          email: string;
          firstName: string;
          lastName: string;
          phoneNumber: string;
          enrolledForPromotions: boolean;
          homeStreet?: string;
          homeCity?: string;
          homeState?: string;
          homeZip?: string;
          homeCountry?: string;
          profileImageLink?: string;
        } = { ...profileData.user };
        
        // Address
        if (profileData.homeAddress) {
          userData.homeStreet = profileData.homeAddress.street;
          userData.homeCity = profileData.homeAddress.city;
          userData.homeState = profileData.homeAddress.state;
          userData.homeZip = profileData.homeAddress.zip;
          userData.homeCountry = profileData.homeAddress.country || 'US';
        }

        // Return the combined user and address data
        console.log('Successfully retrieved user profile from backend');
        return userData;

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

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Password change failed:', response.status, errorText);
      // Try to parse as JSON for structured error messages
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || errorData.error || 'Failed to change password');
      } catch {
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating password:', error);
    // Re-throw error so caller can handle it
    throw error;
  }
}

// Exports the functions that call the API, so they can be called from other files
export { getUserInfo, updateUserInfo, changePassword }; 