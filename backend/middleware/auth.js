// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  console.log('Auth headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  console.log('Token received:', token.substring(0, 10) + '...');
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified for user:', user.email);
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
}

module.exports = authenticateToken;