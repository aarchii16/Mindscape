const User = require('../models/user.model');
const bcrypt = require('bcrypt');

/**
 * Get current user's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update current user's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, preferences, institution, yearOfStudy, preferredLanguage, username, appendAssessment, latestWellnessScore } = req.body;

    // Build base $set updates
    const setFields = {};
    if (firstName) setFields.firstName = firstName;
    if (lastName) setFields.lastName = lastName;
    if (bio) setFields.bio = bio;
    if (preferences) setFields.preferences = preferences;
    if (institution) setFields.institution = institution;
    if (yearOfStudy) setFields.yearOfStudy = yearOfStudy;
    if (preferredLanguage) setFields.preferredLanguage = preferredLanguage;
    if (username) setFields.username = username;
    if (typeof latestWellnessScore === 'number') setFields['wellness.latestWellnessScore'] = latestWellnessScore;

    // Build update query with optional push for wellness assessment
    const updateQuery = { $set: setFields };

    if (appendAssessment && appendAssessment.type && typeof appendAssessment.score === 'number') {
      // Ensure score is bounded 0-30 for safety
      const score = Math.max(0, Math.min(30, appendAssessment.score));
      updateQuery.$push = { 'wellness.assessments': {
        type: appendAssessment.type,
        score,
        takenAt: new Date()
      }};
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateQuery,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update current user's password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error in updatePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user by ID (limited info for public profile)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName bio createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all counselors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCounselors = async (req, res) => {
  try {
    const counselors = await User.find({ role: 'counselor' })
      .select('_id firstName lastName username bio credentials specializations createdAt')
      .sort({ firstName: 1 });

    res.status(200).json({
      success: true,
      data: counselors,
      message: 'Counselors retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getCounselors:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};