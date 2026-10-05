/**
 * Forum controller
 * Placeholder implementation
 */

exports.getTopics = async (req, res) => {
  try {
    const { category, search, tags, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: String(tags).split(',').map(t => t.trim()).filter(Boolean) };
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];

    const topics = await ForumTopic.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('author', 'username firstName lastName')
      .lean();

    // Map authors for anonymity
    const mapped = topics.map(t => ({
      ...t,
      author: t.isAnonymous ? null : t.author
    }));

    const count = await ForumTopic.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: mapped,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count
      }
    });
  } catch (error) {
    console.error('Error in getTopics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const ForumTopic = require('../models/forumTopic.model');
const ForumPost = require('../models/forumPost.model');

exports.createTopic = async (req, res) => {
  try {
    const { title, content, category, tags = [], isAnonymous = true } = req.body;

    const topic = await ForumTopic.create({
      title,
      content,
      category,
      tags,
      isAnonymous: !!isAnonymous,
      author: req.user._id
    });

    res.status(201).json({
      success: true,
      data: { id: topic._id },
      message: 'Topic created successfully'
    });
  } catch (error) {
    console.error('Error in createTopic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getTopicById = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: { id: req.params.id },
      message: 'Topic retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getTopicById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: { id: req.params.id },
      message: 'Topic updated successfully'
    });
  } catch (error) {
    console.error('Error in updateTopic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteTopic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { id } = req.params; // topic id
    const { content } = req.body;

    const post = await ForumPost.create({
      topic: id,
      content,
      author: req.user._id
    });

    // Increment replies counter on topic
    await ForumTopic.findByIdAndUpdate(id, { $inc: { replies: 1 } });

    res.status(201).json({
      success: true,
      data: { id: post._id },
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Error in createPost:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { id } = req.params; // topic id
    const posts = await ForumPost.find({ topic: id }).sort({ createdAt: -1 }).populate('author', 'username firstName lastName');
    res.status(200).json({
      success: true,
      data: posts,
      message: 'Posts retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getPosts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: { id: req.params.id },
      message: 'Post updated successfully'
    });
  } catch (error) {
    console.error('Error in updatePost:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error in deletePost:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    await ForumPost.findByIdAndUpdate(id, { $inc: { likes: 1 } });
    res.status(200).json({ success: true, message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error in likePost:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    await ForumPost.findByIdAndUpdate(id, { $inc: { likes: -1 } });
    res.status(200).json({ success: true, message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error in unlikePost:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Topic like/unlike
exports.likeTopic = async (req, res) => {
  try {
    const { id } = req.params;
    await ForumTopic.findByIdAndUpdate(id, { $inc: { likes: 1 } });
    res.status(200).json({ success: true, message: 'Topic liked successfully' });
  } catch (error) {
    console.error('Error in likeTopic:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.unlikeTopic = async (req, res) => {
  try {
    const { id } = req.params;
    await ForumTopic.findByIdAndUpdate(id, { $inc: { likes: -1 } });
    res.status(200).json({ success: true, message: 'Topic unliked successfully' });
  } catch (error) {
    console.error('Error in unlikeTopic:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.reportPost = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Post reported successfully'
    });
  } catch (error) {
    console.error('Error in reportPost:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: [],
      message: 'Reports retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getReports:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateReport = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: { id: req.params.id },
      message: 'Report updated successfully'
    });
  } catch (error) {
    console.error('Error in updateReport:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};