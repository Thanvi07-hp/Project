const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Logout endpoint
router.post('/logout', authenticateToken, (req, res) => {
  // The token is already verified by the middleware
  // We don't need to do anything on the backend since we're using JWT
  // The frontend will handle clearing the token from localStorage
  res.status(200).json({ message: 'Logged out successfully' });
});

// Token refresh endpoint
router.post('/refresh-token', authenticateToken, (req, res) => {
  // Generate a new token with the same payload but new expiration
  const token = jwt.sign(
    { id: req.user.id, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  res.json({ token });
});

module.exports = router; 