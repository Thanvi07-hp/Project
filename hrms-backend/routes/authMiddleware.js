const jwt = require('jsonwebtoken');
const SECRET = 'your_jwt_secret'; // Same secret you use when signing the token

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });

    req.user = user; // Set the user in the request for use in routes
    next(); // Move to the next middleware/route
  });
}

module.exports = authenticateToken;
