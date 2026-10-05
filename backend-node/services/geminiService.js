const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      this.provider = 'gemini';
      this.apiKey = geminiKey;
      this.model = 'gemini-2.5-flash';
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    } else {
      this.provider = 'openrouter';
      this.apiKey = process.env.OPENROUTER_API_KEY;
      this.baseURL = 'https://openrouter.ai/api/v1';
      this.model = 'anthropic/claude-3.5-sonnet';
    }
  }

  async generateChatResponse(message, context = []) {
    try {
      const systemPrompt = `You are MindscapeAI, a compassionate and professional AI mental health companion for college students. Your role is to:

1. Provide empathetic, non-judgmental support
2. Offer evidence-based coping strategies and mental health information
3. Recognize crisis situations and direct users to appropriate help
4. Maintain appropriate boundaries - you're not a licensed therapist
5. Encourage professional help when needed
6. Keep responses supportive, concise, and actionable

Guidelines:
- Always prioritize user safety
- If crisis indicators are detected, immediately provide crisis resources
- Be warm, understanding, and validating
- Use simple, clear language
- Focus on empowerment and self-care
- Never give medical advice or diagnoses

Crisis keywords to watch for: suicide, self-harm, kill myself, end it all, not worth living, better off dead, want to die, hurt myself, cut myself.

If you detect crisis indicators, respond with:
- Immediate concern and validation
- Local and international crisis hotline numbers
- Encouragement to seek immediate professional help
- Offer to help them find resources or contact emergency services`;

      let text = '';

      if (this.provider === 'gemini') {
        const model = this.genAI.getGenerativeModel({
          model: this.model,
          systemInstruction: systemPrompt
        });

        const contents = [];
        context.forEach((msg) => {
          contents.push({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] });
        });
        contents.push({ role: 'user', parts: [{ text: message }] });

        const result = await model.generateContent({ contents });
        text = result.response?.text()?.trim() || '';
      } else {
        const messages = [
          {
            role: 'system',
            content: systemPrompt
          }
        ];

        context.forEach(msg => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });

        messages.push({
          role: 'user',
          content: message
        });

        const response = await axios.post(`${this.baseURL}/chat/completions`, {
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:8080',
            'X-Title': 'Mindscape Mental Health Chatbot'
          }
        });

        text = response.data.choices[0].message.content.trim();
      }

      // Check for crisis indicators in user message
      const crisisPatterns = [
        /suicide/i, /kill myself/i, /end it all/i, /hurt myself/i, /self harm/i,
        /cut myself/i, /no reason to live/i, /better off dead/i, /want to die/i
      ];

      const isCrisis = crisisPatterns.some(pattern => pattern.test(message));

      if (isCrisis) {
        text = "I'm really concerned about you right now. Your safety is the most important thing.\n\n" +
               "Please reach out to a crisis helpline immediately:\n\n" +
               "🇺🇸 988 Suicide & Crisis Lifeline: Call or text 988\n" +
               "🇬🇧 Samaritans: 116 123\n" +
               "🇮🇳 AASRA: +91-9820466726\n" +
               "🇦🇺 Lifeline: 13 11 14\n\n" +
               "You don't have to face this alone. Help is available 24/7. Would you like me to help you find local resources or contact emergency services?\n\n" + text;
      }

      return {
        message: text,
        category: isCrisis ? 'urgent' : this.categorizeResponse(text),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI provider error:', error.response?.data || error.message);
      throw new Error('Failed to generate AI response');
    }
  }

  categorizeResponse(response) {
    const lowerResponse = response.toLowerCase();

    if (lowerResponse.includes('crisis') || lowerResponse.includes('emergency') || lowerResponse.includes('988')) {
      return 'urgent';
    } else if (lowerResponse.includes('coping') || lowerResponse.includes('strategy') || lowerResponse.includes('technique')) {
      return 'tip';
    } else {
      return 'support';
    }
  }

  async analyzeText(text) {
    try {
      const prompt = `Analyze the following text for mental health indicators. Return a JSON object with:
- sentiment: "positive", "negative", or "neutral"
- crisisDetected: boolean
- topics: array of relevant mental health topics
- keywords: array of key mental health-related words

Text: "${text}"`;

      let analysisText = '';
      if (this.provider === 'gemini') {
        const model = this.genAI.getGenerativeModel({ model: this.model });
        const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
        analysisText = result.response?.text()?.trim() || '';
      } else {
        const response = await axios.post(`${this.baseURL}/chat/completions`, {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:8080',
            'X-Title': 'Mindscape Mental Health Chatbot'
          }
        });
        analysisText = response.data.choices[0].message.content.trim();
      }

      // Try to parse JSON response
      try {
        const analysis = JSON.parse(analysisText);
        return analysis;
      } catch (parseError) {
        // Fallback parsing
        return {
          sentiment: analysisText.toLowerCase().includes('negative') ? 'negative' :
                    analysisText.toLowerCase().includes('positive') ? 'positive' : 'neutral',
          crisisDetected: analysisText.toLowerCase().includes('crisis') || analysisText.toLowerCase().includes('suicide'),
          topics: ['general'],
          keywords: ['analyzed']
        };
      }
    } catch (error) {
      console.error('Text analysis error:', error.response?.data || error.message);
      return {
        sentiment: 'neutral',
        crisisDetected: false,
        topics: ['general'],
        keywords: []
      };
    }
  }

  async summarizeText(text, maxLength = 200) {
    try {
      const prompt = `Summarize the following text in ${maxLength} characters or less, focusing on key mental health insights and concerns:

Text: "${text}"`;

      let summary = '';
      if (this.provider === 'gemini') {
        const model = this.genAI.getGenerativeModel({ model: this.model });
        const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
        summary = result.response?.text()?.trim() || '';
      } else {
        const response = await axios.post(`${this.baseURL}/chat/completions`, {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:8080',
            'X-Title': 'Mindscape Mental Health Chatbot'
          }
        });
        summary = response.data.choices[0].message.content.trim();
      }

      return summary.length > maxLength ? summary.substring(0, maxLength) + '...' : summary;
    } catch (error) {
      console.error('Summarization error:', error.response?.data || error.message);
      return `Summary of the provided text (limited to ${maxLength} characters)`;
    }
  }
}

module.exports = new GeminiService();