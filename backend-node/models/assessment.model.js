const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    depressionScore: { type: Number, required: true, min: 0, max: 30 },
    anxietyScore: { type: Number, required: true, min: 0, max: 30 },
    stressScore: { type: Number, required: true, min: 0, max: 30 },
    wellnessScore: { type: Number, required: true, min: 0, max: 100 },
    meta: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;