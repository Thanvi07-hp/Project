/**
 * Authentication utility functions
 */

import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// Check if user is logged in (token exists)
export const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch (error) {
    return false;
  }
};

// Get current user role
export const getUserRole = () => {
  return localStorage.getItem('role');
};

// Check if user has permission for a specific role
export const hasRole = (allowedRoles) => {
  const userRole = getUserRole();
  return allowedRoles.includes(userRole);
};

// Clear all auth related data from local storage and make backend call
export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
};

// Add authentication headers to fetch requests
export const authHeader = () => {
  const token = localStorage.getItem('token');
  
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

// Handle API responses for auth errors (token expired, etc.)
export const handleAuthResponse = async (response) => {
  if (response.status === 401) {
    // Token expired or invalid
    logout();
    return Promise.reject('Session expired. Please login again.');
  }
  return response;
};

// Check if token needs refresh (within 5 minutes of expiration)
export const shouldRefreshToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiration = decodedToken.exp - currentTime;
    return timeUntilExpiration < 300; // 5 minutes
  } catch (error) {
    return false;
  }
};

// Refresh token
export const refreshToken = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    logout();
    throw error;
  }
}; 