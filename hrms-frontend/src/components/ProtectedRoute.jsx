import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  
  // Check if user is authenticated and authorized
  if (!token) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }
  
  // If allowedRoles is provided and not empty, check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // User is authenticated but not authorized for this route
    // Redirect to the appropriate dashboard based on role
    return <Navigate to={userRole === 'admin' ? '/admin-dashboard' : '/employee-dashboard'} replace />;
  }
  
  // User is authenticated and authorized, render the protected component
  return element;
};

export default ProtectedRoute; 