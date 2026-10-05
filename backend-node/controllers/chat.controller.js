const Chat = require('../models/chat.model');
const User = require('../models/user.model');

/**
 * Chat controller
 * Handles chat sessions and messages
 */

exports.getSessions = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true
    })
    .populate('participants', 'firstName lastName username role')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: chats,
      message: 'Chat sessions retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getSessions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.createSession = async (req, res) => {
  try {
    const { participantId, type = 'student-counselor', title } = req.body;

    if (type === 'student-counselor') {
      if (!participantId) {
        return res.status(400).json({
          success: false,
          message: 'Participant ID is required for student-counselor chats'
        });
      }

      // Check if chat already exists
      const existingChat = await Chat.findOne({
        participants: { $all: [req.user._id, participantId] },
        type: 'student-counselor'
      });

      if (existingChat) {
        return res.status(200).json({
          success: true,
          data: existingChat,
          message: 'Existing chat session retrieved'
        });
      }

      const chat = await Chat.create({
        participants: [req.user._id, participantId],
        type,
        title: title || 'Student-Counselor Chat'
      });

      const populatedChat = await Chat.findById(chat._id).populate('participants', 'firstName lastName username role');

      res.status(201).json({
        success: true,
        data: populatedChat,
        message: 'Chat session created successfully'
      });
    } else {
      // For AI chats or other types
      const chat = await Chat.create({
        participants: [req.user._id],
        type,
        title: title || 'AI Chat'
      });

      res.status(201).json({
        success: true,
        data: chat,
        message: 'Chat session created successfully'
      });
    }
  } catch (error) {
    console.error('Error in createSession:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id,
      isActive: true
    })
    .populate('participants', 'firstName lastName username role')
    .populate('messages.sender', 'firstName lastName username');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.status(200).json({
      success: true,
      data: chat,
      message: 'Chat session retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getSessionById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateSession = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: { id: req.params.id },
      message: 'Chat session updated successfully'
    });
  } catch (error) {
    console.error('Error in updateSession:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteSession:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.status(200).json({
      success: true,
      data: chat.messages,
      message: 'Chat messages retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    const message = {
      sender: req.user._id,
      content: content.trim(),
      timestamp: new Date()
    };

    chat.messages.push(message);
    await chat.save();

    // Populate sender info for response
    const populatedChat = await Chat.findById(chat._id)
      .populate('messages.sender', 'firstName lastName username')
      .select('messages');

    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];

    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};