const User = require('../models/user.model');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { logger } = require('../utils/logger');
const { redisClient } = require('../config/redis');
const crypto = require('crypto');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;

    const allowedRoles = ['student', 'counselor'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role is required and must be either student or counselor'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role
    });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in Redis if available
    try {
      if (redisClient.isReady) {
        await redisClient.set(
          `refresh_token:${user._id}`,
          refreshToken,
          'EX',
          7 * 24 * 60 * 60 // 7 days in seconds
        );
      }
    } catch (error) {
      logger.error('Redis error storing refresh token:', error);
      // Continue even if Redis fails
    }

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Check if user exists
    const allowedRoles = ['student', 'counselor'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role is required and must be either student or counselor'
      });
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in Redis if available
    try {
      if (redisClient.isReady) {
        await redisClient.set(
          `refresh_token:${user._id}`,
          refreshToken,
          'EX',
          7 * 24 * 60 * 60 // 7 days in seconds
        );
      }
    } catch (error) {
      logger.error('Redis error storing refresh token:', error);
      // Continue even if Redis fails
    }

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token
 * @route POST /api/auth/refresh-token
 * @access Public
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    // Check if token is in Redis if available
    try {
      if (redisClient.isReady) {
        const storedToken = await redisClient.get(`refresh_token:${decoded.id}`);
        
        if (storedToken !== refreshToken) {
          return res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
          });
        }
      }
    } catch (error) {
      logger.error('Redis error checking refresh token:', error);
      // Continue even if Redis fails
    }

    // Get user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token in Redis if available
    try {
      if (redisClient.isReady) {
        await redisClient.set(
          `refresh_token:${user._id}`,
          newRefreshToken,
          'EX',
          7 * 24 * 60 * 60 // 7 days in seconds
        );
      }
    } catch (error) {
      logger.error('Redis error updating refresh token:', error);
      // Continue even if Redis fails
    }

    res.status(200).json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    next(error);
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res, next) => {
  try {
    // Remove refresh token from Redis if available
    try {
      if (redisClient.isReady && req.user) {
        await redisClient.del(`refresh_token:${req.user._id}`);
      }
    } catch (error) {
      logger.error('Redis error removing refresh token:', error);
      // Continue even if Redis fails
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // In a real application, send email with reset URL
    // For now, just log it
    logger.info(`Password reset token: ${resetToken}`);
    logger.info(`Reset URL: ${resetUrl}`);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      // For development only, remove in production
      resetUrl,
      resetToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * @route PUT /api/auth/reset-password/:resetToken
 * @access Public
 */
const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword
};