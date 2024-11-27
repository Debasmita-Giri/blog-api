// authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {  
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) 
    return res.status(401).json({ message: 'Access token is required' });

  jwt.verify(token, process.env.SECRET_KEY_JWT, (err, user) => {
    if (err) 
      return res.status(403).json({ message: 'Invalid or expired token' });
    else{     
      req.user = user;
      next();
    }
  });
}

// Middleware to authorize roles
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
