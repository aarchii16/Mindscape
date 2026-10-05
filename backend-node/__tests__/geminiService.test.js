require('dotenv').config();
const geminiService = require('../services/geminiService');

describe('GeminiService (OpenRouter Integration)', () => {
  beforeAll(() => {
    // Ensure we have the API key
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is required for tests');
    }
  });

  describe('generateChatResponse', () => {
    test('should generate a valid response for a normal message', async () => {
      const message = "I'm feeling stressed about my exams";
      const response = await geminiService.generateChatResponse(message);

      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('category');
      expect(response).toHaveProperty('timestamp');
      expect(typeof response.message).toBe('string');
      expect(response.message.length).toBeGreaterThan(0);
      expect(['support', 'tip', 'urgent']).toContain(response.category);
    }, 30000); // 30 second timeout for API call

    test('should detect crisis indicators and return urgent category', async () => {
      const message = "I want to hurt myself";
      const response = await geminiService.generateChatResponse(message);

      expect(response.category).toBe('urgent');
      expect(response.message).toMatch(/988/);
      expect(response.message).toMatch(/concerned about you/);
    }, 30000);

    test('should handle conversation context', async () => {
      const message = "Can you help me with anxiety?";
      const context = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there! How can I help you today?' }
      ];

      const response = await geminiService.generateChatResponse(message, context);

      expect(response).toHaveProperty('message');
      expect(response.message.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('analyzeText', () => {
    test('should analyze text and return sentiment analysis', async () => {
      const text = "I'm really happy with my progress in therapy";
      const analysis = await geminiService.analyzeText(text);

      expect(analysis).toHaveProperty('sentiment');
      expect(analysis).toHaveProperty('crisisDetected');
      expect(analysis).toHaveProperty('topics');
      expect(analysis).toHaveProperty('keywords');
      expect(typeof analysis.crisisDetected).toBe('boolean');
      expect(Array.isArray(analysis.topics)).toBe(true);
      expect(Array.isArray(analysis.keywords)).toBe(true);
    }, 30000);

    test('should detect crisis in text analysis', async () => {
      const text = "I feel like killing myself";
      const analysis = await geminiService.analyzeText(text);

      expect(analysis.crisisDetected).toBe(true);
    }, 30000);
  });

  describe('summarizeText', () => {
    test('should summarize text within specified length', async () => {
      const text = "I've been feeling very anxious lately. My heart races, I can't sleep, and I worry about everything. I know I should relax but I can't seem to stop.";
      const summary = await geminiService.summarizeText(text, 100);

      expect(typeof summary).toBe('string');
      expect(summary.length).toBeLessThanOrEqual(103); // 100 + '...'
    }, 30000);
  });

  describe('categorizeResponse', () => {
    test('should categorize crisis responses as urgent', () => {
      const crisisResponse = "I'm concerned about you. Please call 988 immediately.";
      const category = geminiService.categorizeResponse(crisisResponse);

      expect(category).toBe('urgent');
    });

    test('should categorize coping strategy responses as tip', () => {
      const tipResponse = "Here are some coping strategies you can try: deep breathing, mindfulness meditation, and regular exercise.";
      const category = geminiService.categorizeResponse(tipResponse);

      expect(category).toBe('tip');
    });

    test('should categorize general support as support', () => {
      const supportResponse = "I'm here to listen. How are you feeling right now?";
      const category = geminiService.categorizeResponse(supportResponse);

      expect(category).toBe('support');
    });
  });
});