const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    counselor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isAvailable: { type: Boolean, default: true },
    type: { type: String, enum: ['therapy', 'coaching', 'consultation'], required: true },
    notes: { type: String }
  },
  { timestamps: true }
);

// Index for efficient queries
slotSchema.index({ counselor: 1, startTime: 1, isAvailable: 1 });

module.exports = mongoose.model('Slot', slotSchema);