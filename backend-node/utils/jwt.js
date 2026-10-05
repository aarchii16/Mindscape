const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { 
      expiresIn: process.env.JWT_EXPIRATION || '1h'
    }
  );
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {String} Refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user._id
    },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { 
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d'
    }
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken
};