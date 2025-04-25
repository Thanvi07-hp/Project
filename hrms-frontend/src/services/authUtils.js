/**
 * Authentication utility functions
 */

// Check if user is logged in (token exists)
export const isLoggedIn = () => {
  return localStorage.getItem('token') !== null;
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

// Clear all auth related data from local storage
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('employeeId');
  // Redirect to login
  window.location.href = '/login';
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
export const handleAuthResponse = (response) => {
  if (response.status === 401) {
    // Token expired or invalid
    logout();
    return Promise.reject('Session expired. Please login again.');
  }
  return response;
}; 