const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const splitToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
    const decoded = jwt.verify(splitToken, jwtSecret);
    
    // We assume the JWT contains { id, email } or similar user details.
    // If the previous registration logic used { email }, it should ideally use { id, email }.
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
