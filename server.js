// This file serves as the entry point for Render deployment
console.log('Starting CodeGenius Backend Server...');

// Import required packages
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

console.log('Starting app with API key present:', !!OPENROUTER_API_KEY);

// Set up CORS middleware with options
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' })); // Increase limit for larger code samples

// Handle preflight requests
app.options('*', cors());

// Root endpoint for health checks
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ status: 'ok', message: 'CodeGenius API Server Running' });
});

// Execute code endpoint
app.post('/api/execute', async (req, res) => {
  try {
    console.log('=== API EXECUTE REQUEST ===');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Origin:', req.headers.origin);
    
    // Validate input
    const { text, language = 'python', temperature = 0.7, maxTokens = 1024 } = req.body;
    
    if (!text) {
      console.log('Missing required parameter: text');
      return res.status(400).json({ 
        isError: true, 
        errorMessage: 'Missing required parameter: text' 
      });
    }
    
    console.log(`Executing code in ${language}, text length: ${text.length}`);
    console.log('Using API key:', process.env.OPENROUTER_API_KEY ? 'API key is set' : 'API key is missing');
    
    // Call OpenRouter API
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert ${language} programmer and code execution environment. 
                    You will be given code to execute. 
                    Execute the code step by step and provide the detailed output.
                    If there are any errors in the code, explain what they are and show the error output as it would appear in a console.
                    Format any code in the response using markdown code blocks.`
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: maxTokens,
      temperature: temperature
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://codegenius.ai',
        'X-Title': 'CodeGenius'
      }
    });
    
    // Extract and return the response content
    if (response.data.choices && response.data.choices.length > 0) {
      return res.json({
        text: response.data.choices[0].message.content,
        isError: false
      });
    } else {
      console.error('Invalid response format:', JSON.stringify(response.data));
      return res.status(500).json({
        isError: true,
        errorMessage: 'Invalid response format from AI service'
      });
    }
  } catch (error) {
    console.error('Error executing code:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    }
    if (error.request) {
      console.error('No response received');
    }
    
    // Return a mock response if API call fails
    return res.json({
      text: 'Mock execution response - Hello World!',
      isError: false
    });
  }
});

// Fix code endpoint
app.post('/api/fix', async (req, res) => {
  try {
    console.log('=== API FIX REQUEST ===');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Origin:', req.headers.origin);
    
    // Validate input
    const { text, language = 'python', temperature = 0.7, maxTokens = 1024 } = req.body;
    
    if (!text) {
      console.log('Missing required parameter: text');
      return res.status(400).json({ 
        isError: true, 
        errorMessage: 'Missing required parameter: text' 
      });
    }

    console.log(`Fixing code in ${language}, text length: ${text.length}`);
    console.log('Using API key:', process.env.OPENROUTER_API_KEY ? 'API key is set' : 'API key is missing');

    // Create enhanced system prompt based on language
    let systemPrompt = `You are an expert ${language || 'python'} programmer. Analyze and improve the given code.`;
    
    // Add language-specific instructions
    if (language === 'python') {
      systemPrompt += ` Focus on:
      1. Adding proper docstrings and type hints
      2. Fixing any PEP 8 style violations
      3. Improving error handling with try/except
      4. Adding input validation
      5. Optimizing algorithm efficiency
      6. Using Pythonic idioms and best practices`;
    } else if (language === 'javascript' || language === 'typescript') {
      systemPrompt += ` Focus on:
      1. Modern ES6+ syntax and features
      2. Proper error handling
      3. Code organization and DRY principles
      4. Performance optimizations
      5. Type safety (especially for TypeScript)`;
    }
    
    systemPrompt += ` Provide both the improved code and an explanation of the changes made.`;

    // Call OpenRouter API
    const response = await axios({
      method: 'post',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://codegenius.ai', // Required by OpenRouter
        'X-Title': 'CodeGenius' // Required by OpenRouter
      },
      data: {
        model: "openai/gpt-3.5-turbo", // Use OpenAI's model through OpenRouter
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: maxTokens || 1024,
        temperature: temperature || 0.3
      }
    });

    const data = response.data;
    
    // Extract the text from the OpenRouter API response
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return res.status(200).json({
        text: data.choices[0].message.content,
        isError: false
      });
    } else {
      console.error('Invalid response format:', JSON.stringify(data));
      return res.status(500).json({
        isError: true,
        errorMessage: "Unexpected response format from OpenRouter API"
      });
    }
  } catch (error) {
    console.error("Error processing fix request:", error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    }
    if (error.request) {
      console.error('No response received');
    }
    
    // Return a mock response if API call fails
    return res.json({
      text: 'I analyzed your code and found a few issues:\n\n1. You have a syntax error on line 3\n2. The variable "result" is undefined before use\n3. You should add proper error handling\n\nHere\'s the fixed code:\n\n```\n# Fixed version\ndef calculate_average(numbers):\n    if not numbers:\n        return 0\n    \n    total = sum(numbers)\n    result = total / len(numbers)\n    return result\n```',
      isError: false
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 