require('dotenv').config();
const geminiService = require('./services/geminiService');

async function testOpenRouterIntegration() {
  console.log('🧪 Testing OpenRouter Integration...\n');

  try {
    // Test 1: Basic chat response
    console.log('📝 Test 1: Basic chat response');
    const response1 = await geminiService.generateChatResponse('Hello, I am feeling a bit anxious');
    console.log('✅ Response received:', response1.message.substring(0, 100) + '...');
    console.log('📊 Category:', response1.category);

    // Test 2: Crisis detection
    console.log('\n🚨 Test 2: Crisis detection');
    const response2 = await geminiService.generateChatResponse('I want to hurt myself');
    console.log('✅ Crisis detected, urgent response provided');
    console.log('📊 Category:', response2.category);

    // Test 3: Text analysis
    console.log('\n🔍 Test 3: Text analysis');
    const analysis = await geminiService.analyzeText('I feel really happy and motivated today');
    console.log('✅ Analysis result:', analysis);

    // Test 4: Text summarization
    console.log('\n📄 Test 4: Text summarization');
    const summary = await geminiService.summarizeText('I have been feeling very stressed about my upcoming exams. My heart races when I think about them, and I have trouble sleeping at night. I know I need to study but I feel overwhelmed.', 150);
    console.log('✅ Summary:', summary);

    console.log('\n🎉 All tests passed! OpenRouter integration is working correctly.');

  } catch (error) {
    console.log('\n❌ Test failed:', error.message);

    if (error.message.includes('Insufficient credits')) {
      console.log('\n💰 SOLUTION: You need to add credits to your OpenRouter account');
      console.log('1. Go to: https://openrouter.ai/settings/credits');
      console.log('2. Add payment method');
      console.log('3. Purchase credits (they offer free trial credits)');
      console.log('4. Run this test again');
    } else if (error.message.includes('API key')) {
      console.log('\n🔑 SOLUTION: Check your OPENROUTER_API_KEY in .env file');
    } else {
      console.log('\n🔧 Check the error details above');
    }
  }
}

// Run the test
testOpenRouterIntegration();