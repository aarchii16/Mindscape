/**
 * Middleware to check if the user is a counselor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.isCounselor = (req, res, next) => {
  // User should be attached to req by the authenticate middleware
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'counselor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Counselor privileges required'
    });
  }

  next();
};