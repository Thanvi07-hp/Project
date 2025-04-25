const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add the decoded user to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  
  next();
};

// Middleware to check employee role
const isEmployee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Access denied. Employee privileges required.' });
  }
  
  next();
};

// Middleware to check if user is admin or if employee is accessing their own data
const isAdminOrSelf = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  
  // If admin, allow access
  if (req.user.role === 'admin') {
    return next();
  }
  
  // If employee is accessing their own data, check employee ID
  const requestedEmployeeId = req.params.id || req.params.employeeId;
  if (req.user.role === 'employee' && req.user.employeeId === parseInt(requestedEmployeeId)) {
    return next();
  }
  
  return res.status(403).json({ message: 'Access denied. You can only access your own data.' });
};

module.exports = {
  authenticateToken,
  isAdmin,
  isEmployee,
  isAdminOrSelf
}; 