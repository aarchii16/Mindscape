const mongoose = require('mongoose');

const forumTopicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    category: { type: String, default: 'General' },
    tags: { type: [String], default: [] },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isAnonymous: { type: Boolean, default: true },
    replies: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isHot: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ForumTopic', forumTopicSchema);