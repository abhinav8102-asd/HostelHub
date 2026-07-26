const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'No authorization header provided!' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'Token missing!' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'hostelhub_secret_key_12345', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized! Invalid token.' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;
    next();
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Forbidden! Access denied for this role.' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
