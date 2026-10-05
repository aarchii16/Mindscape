const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slotId: { type: String, required: true },
    type: { type: String, enum: ['therapy', 'coaching', 'consultation'], required: true },
    notes: { type: String },
    status: { type: String, enum: ['confirmed', 'cancelled', 'rescheduled'], default: 'confirmed' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);