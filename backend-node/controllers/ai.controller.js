const geminiService = require('../services/geminiService');

exports.chatWithAI = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid message is required'
      });
    }

    // Generate AI response using Gemini
    const aiResponse = await geminiService.generateChatResponse(message.trim());

    const response = {
      id: `ai-response-${Date.now()}`,
      message: aiResponse.message,
      category: aiResponse.category,
      sessionId: sessionId || `session-${Date.now()}`,
      timestamp: aiResponse.timestamp
    };

    res.status(200).json({
      success: true,
      data: response,
      message: 'AI response generated successfully'
    });
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI response'
    });
  }
};

exports.analyzeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid text is required'
      });
    }

    // Analyze text using Gemini
    const analysis = await geminiService.analyzeText(text.trim());

    res.status(200).json({
      success: true,
      data: analysis,
      message: 'Text analyzed successfully'
    });
  } catch (error) {
    console.error('Error in analyzeText:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze text'
    });
  }
};

exports.summarizeText = async (req, res) => {
  try {
    const { text, maxLength } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid text is required'
      });
    }

    const maxLen = maxLength && typeof maxLength === 'number' && maxLength > 0 ? maxLength : 200;

    // Summarize text using Gemini
    const summary = await geminiService.summarizeText(text.trim(), maxLen);

    res.status(200).json({
      success: true,
      data: { summary },
      message: 'Text summarized successfully'
    });
  } catch (error) {
    console.error('Error in summarizeText:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to summarize text'
    });
  }
};

exports.getRecommendedResources = async (req, res) => {
  try {
    const { query, limit } = req.body;
    
    // In a real implementation, this would find relevant resources based on the query
    const resources = [
      { id: 'resource-1', title: 'Recommended Resource 1' },
      { id: 'resource-2', title: 'Recommended Resource 2' }
    ];
    
    res.status(200).json({
      success: true,
      data: resources.slice(0, limit || resources.length),
      message: 'Recommended resources retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getRecommendedResources:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.generateExercises = async (req, res) => {
  try {
    const { type, duration } = req.body;
    
    // In a real implementation, this would generate exercises based on the type and duration
    const exercise = {
      type,
      duration: duration || 5,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Exercise`,
      instructions: `Instructions for a ${duration || 5}-minute ${type} exercise`
    };
    
    res.status(200).json({
      success: true,
      data: exercise,
      message: 'Exercise generated successfully'
    });
  } catch (error) {
    console.error('Error in generateExercises:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { responseId, rating, feedback } = req.body;
    
    // In a real implementation, this would store the feedback
    
    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};