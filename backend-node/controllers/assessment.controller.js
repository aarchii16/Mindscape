const Assessment = require('../models/assessment.model');
const User = require('../models/user.model');

/**
 * Create an assessment entry and update user's wellness info
 * @route POST /api/assessments
 */
exports.createAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { depressionScore, anxietyScore, stressScore, wellnessScore, meta } = req.body || {};

    if ([depressionScore, anxietyScore, stressScore, wellnessScore].some(v => typeof v !== 'number')) {
      return res.status(400).json({ success: false, message: 'All scores must be numbers' });
    }

    // Clamp values
    const dep = Math.max(0, Math.min(30, depressionScore));
    const anx = Math.max(0, Math.min(30, anxietyScore));
    const str = Math.max(0, Math.min(30, stressScore));
    const wel = Math.max(0, Math.min(100, wellnessScore));

    // Create assessment document
    const assessment = await Assessment.create({
      user: userId,
      depressionScore: dep,
      anxietyScore: anx,
      stressScore: str,
      wellnessScore: wel,
      meta: meta || {}
    });

    // Update user wellness: latest score and append each assessment type
    const updates = {
      $set: { 'wellness.latestWellnessScore': wel },
      $push: {
        'wellness.assessments': { type: 'Depression', score: dep, takenAt: new Date() }
      }
    };

    // Push anxiety and stress too in one update using $each
    updates.$push['wellness.assessments'] = {
      $each: [
        { type: 'Depression', score: dep, takenAt: new Date() },
        { type: 'Anxiety', score: anx, takenAt: new Date() },
        { type: 'Perceived Stress', score: str, takenAt: new Date() },
      ]
    };

    await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });

    return res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get current user's assessments
 * @route GET /api/assessments
 */
exports.getMyAssessments = async (req, res) => {
  try {
    const userId = req.user.id;
    const assessments = await Assessment.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: assessments });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};