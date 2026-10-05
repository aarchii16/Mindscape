const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema(
  {
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumTopic', required: true },
    content: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: { type: Number, default: 0 },
    reports: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ForumPost', forumPostSchema);