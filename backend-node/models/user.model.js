const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const wellnessAssessmentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Depression', 'Anxiety', 'Perceived Stress'], required: true },
    score: { type: Number, required: true },
    takenAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  role: { type: String, enum: ['student', 'counselor', 'admin'], default: 'student', required: true },
  isActive: { type: Boolean, default: true },
  profilePicture: String,
  bio: String,
  // New profile fields
  institution: { type: String, trim: true },
  yearOfStudy: { type: String, trim: true },
  preferredLanguage: { type: String, default: 'en' },
  wellness: {
    latestWellnessScore: { type: Number, default: 0 },
    assessments: [wellnessAssessmentSchema]
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.firstName && this.lastName 
    ? `${this.firstName} ${this.lastName}` 
    : this.username;
});

const User = mongoose.model('User', userSchema);

module.exports = User;