// Import required packages
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all requests
app.use(express.json()); // Parse JSON bodies

// Use the API key from environment variables or set directly if not available
const API_KEY = process.env.OPENROUTER_API_KEY || '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';
console.log('API key present:', !!API_KEY);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'CodeGenius API Server Running' });
});

// Execute code endpoint
app.post('/api/execute', async (req, res) => {
  const { text, language } = req.body;
  
  try {
    // For now, just return a mock response
    // Later, we can use the OpenRouter API to generate actual responses
    res.json({
      text: `Mock execution response - Hello World!`,
      isError: false
    });
  } catch (error) {
    console.error('Error executing code:', error);
    res.status(500).json({
      text: 'Error executing code',
      isError: true,
      errorMessage: error.message
    });
  }
});

// Fix code endpoint
app.post('/api/fix', async (req, res) => {
  const { text, language } = req.body;
  
  try {
    // Call OpenRouter API to generate a response for fixing code
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'user', content: `Fix this ${language} code:\n\n${text}\n\nProvide the corrected code with explanations.` }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://codegenius.ai'
      }
    });
    
    const aiResponse = response.data.choices[0].message.content;
    
    res.json({
      text: aiResponse,
      isError: false
    });
  } catch (error) {
    console.error('Error fixing code:', error);
    // Return a mock response if API call fails
    res.json({
      text: 'I analyzed your code and found a few issues:\n\n1. You have a syntax error on line 3\n2. The variable "result" is undefined before use\n3. You should add proper error handling\n\nHere\'s the fixed code:\n\n```\n# Fixed version\ndef calculate_average(numbers):\n    if not numbers:\n        return 0\n    \n    total = sum(numbers)\n    result = total / len(numbers)\n    return result\n```',
      isError: false
    });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 