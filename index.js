/**
 * CodeGenius Backend API Server
 * A simple Express server to handle code execution and code fixing requests
 */

// Import required packages
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Check if API key is available
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
console.log('API key present:', !!OPENROUTER_API_KEY);

// Configure CORS middleware to allow requests from frontend
app.use(cors({
  origin: '*', // In production, you would restrict this to your frontend domain
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Handle JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Root endpoint for health checks
app.get('/', (req, res) => {
  console.log('Health check endpoint called');
  res.json({ status: 'ok', message: 'CodeGenius API Server Running' });
});

/**
 * Execute code endpoint - Simulates code execution by calling OpenRouter AI
 * POST /api/execute
 * Body: {text: string, language: string}
 */
app.post('/api/execute', async (req, res) => {
  try {
    console.log('==== EXECUTE API CALLED ====');
    console.log('Request body:', req.body);
    
    // Extract parameters from request body
    const { text, language = 'python' } = req.body;
    
    // Validate input
    if (!text) {
      return res.status(400).json({
        isError: true,
        errorMessage: 'Missing required parameter: text'
      });
    }
    
    // If no API key, return mock response
    if (!OPENROUTER_API_KEY) {
      console.log('No API key found, returning mock response');
      return res.json({
        text: 'Mock code execution response (no API key)\n\nOutput:\nHello, World!',
        isError: false
      });
    }
    
    console.log('Using API key:', OPENROUTER_API_KEY.substring(0, 10) + '...');
    
    try {
      // Call OpenRouter API
      console.log('Calling OpenRouter API');
      
      const payload = {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert ${language} programmer and code execution environment. 
                     Execute the code step by step and provide the detailed output.
                     If there are errors, explain what they are and show error output as it would appear in a console.`
          },
          { role: 'user', content: text }
        ],
        max_tokens: 1024,
        temperature: 0.7
      };
      
      console.log('OpenRouter payload:', JSON.stringify(payload).substring(0, 200) + '...');
      
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://codegenius.ai',
          'X-Title': 'CodeGenius'
        }
      });
      
      console.log('OpenRouter response status:', response.status);
      
      // Return AI response
      if (response.data?.choices?.[0]?.message?.content) {
        return res.json({
          text: response.data.choices[0].message.content,
          isError: false
        });
      } else {
        console.error('Invalid API response format:', response.data);
        throw new Error('Invalid API response format');
      }
    } catch (apiError) {
      console.error('OpenRouter API error:', apiError.message);
      console.error('Error details:', apiError.response?.data || 'No response data');
      
      // Return a more detailed error message in production
      return res.status(500).json({
        text: `Error calling AI service: ${apiError.message}. Please try again later.`,
        isError: true,
        errorMessage: apiError.message,
        errorDetails: apiError.response?.data || 'No error details available'
      });
    }
  } catch (error) {
    // Log error details
    console.error('Error executing code:', error.message);
    console.error(error.stack);
    
    // Return a more informative error response
    return res.status(500).json({
      text: `Error processing your request: ${error.message}. Please try again.`,
      isError: true,
      errorMessage: error.message
    });
  }
});

/**
 * Fix code endpoint - Uses OpenRouter AI to improve code
 * POST /api/fix
 * Body: {text: string, language: string}
 */
app.post('/api/fix', async (req, res) => {
  try {
    console.log('==== FIX API CALLED ====');
    console.log('Request body:', req.body);
    
    // Extract parameters from request body
    const { text, language = 'python' } = req.body;
    
    // Validate input
    if (!text) {
      return res.status(400).json({
        isError: true,
        errorMessage: 'Missing required parameter: text'
      });
    }
    
    // If no API key, return mock response
    if (!OPENROUTER_API_KEY) {
      console.log('No API key found, returning mock response');
      return res.json({
        text: 'I analyzed your code and found some improvements to make:\n\n1. Added proper docstrings\n2. Fixed PEP 8 style issues\n3. Improved error handling\n\n```python\n# Improved code\ndef calculate_sum(numbers):\n    """Calculate the sum of a list of numbers.\n    \n    Args:\n        numbers (list): A list of numeric values\n        \n    Returns:\n        float: The sum of all numbers\n        \n    Raises:\n        TypeError: If input is not a list or contains non-numeric values\n    """\n    if not isinstance(numbers, list):\n        raise TypeError("Input must be a list")\n        \n    try:\n        return sum(numbers)\n    except TypeError:\n        raise TypeError("All elements must be numeric")\n```',
        isError: false
      });
    }
    
    console.log('Using API key:', OPENROUTER_API_KEY.substring(0, 10) + '...');
    
    // Create language-specific system prompt
    let systemPrompt = `You are an expert ${language} programmer. Analyze and improve the given code.`;
    
    // Add language-specific instructions
    if (language === 'python') {
      systemPrompt += ` Focus on:
      1. Adding proper docstrings and type hints
      2. Fixing any PEP 8 style violations
      3. Improving error handling with try/except
      4. Adding input validation
      5. Optimizing algorithm efficiency
      6. Using Pythonic idioms and best practices`;
    }
    
    try {
      // Call OpenRouter API
      console.log('Calling OpenRouter API for code fix');
      
      const payload = {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        max_tokens: 1024,
        temperature: 0.3
      };
      
      console.log('OpenRouter payload:', JSON.stringify(payload).substring(0, 200) + '...');
      
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://codegenius.ai',
          'X-Title': 'CodeGenius'
        }
      });
      
      console.log('OpenRouter response status:', response.status);
      
      // Return AI response
      if (response.data?.choices?.[0]?.message?.content) {
        return res.json({
          text: response.data.choices[0].message.content,
          isError: false
        });
      } else {
        console.error('Invalid API response format:', response.data);
        throw new Error('Invalid API response format');
      }
    } catch (apiError) {
      console.error('OpenRouter API error:', apiError.message);
      console.error('Error details:', apiError.response?.data || 'No response data');
      
      // Return a more detailed error message in production
      return res.status(500).json({
        text: `Error calling AI service: ${apiError.message}. Please try again later.`,
        isError: true,
        errorMessage: apiError.message,
        errorDetails: apiError.response?.data || 'No error details available'
      });
    }
  } catch (error) {
    // Log error details
    console.error('Error fixing code:', error.message);
    console.error(error.stack);
    
    // Return a more informative error response
    return res.status(500).json({
      text: `Error processing your request: ${error.message}. Please try again.`,
      isError: true,
      errorMessage: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`CodeGenius Backend Server running on port ${PORT}`);
}); 