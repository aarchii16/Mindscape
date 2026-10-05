const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
  },
  { _id: true }
);

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    type: { type: String, enum: ['student-counselor', 'ai'], default: 'student-counselor' },
    title: { type: String, default: 'Chat Session' },
    messages: [messageSchema],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Ensure participants array has exactly 2 for student-counselor chats
chatSchema.pre('save', function(next) {
  if (this.type === 'student-counselor' && this.participants.length !== 2) {
    return next(new Error('Student-counselor chats must have exactly 2 participants'));
  }
  next();
});

module.exports = mongoose.model('Chat', chatSchema);