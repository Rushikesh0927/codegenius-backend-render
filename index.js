const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Parse allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [
      'http://localhost:8080', 
      'http://localhost:8081', 
      'http://localhost:8082', 
      'https://codegenius-evolve-5r3iyttko-rushikeshs-projects-8d5b90eb.vercel.app',
      'https://codegenius-evolve.vercel.app',
      'https://codegenius-evolve-bb1t1kmke-rushikeshs-projects-8d5b90eb.vercel.app',
      'https://codegenius-evolve-ckic1lant-rushikeshs-projects-8d5b90eb.vercel.app',
      'https://codegenius-evolve-ccj2isoxz-rushikeshs-projects-8d5b90eb.vercel.app',
      'https://codegenius-evolve-4u2kk3nfu-rushikeshs-projects-8d5b90eb.vercel.app',
      'https://codegenius-evolve-ic54z3eeb-rushikeshs-projects-8d5b90eb.vercel.app',
      'https://codegenius-evolve-h412ohhbk-rushikeshs-projects-8d5b90eb.vercel.app'
    ];

// Set up CORS middleware with options
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Handle preflight requests
app.options('*', cors());

// Root endpoint for health checks
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'CodeGenius API Server Running' });
});

// Execute code endpoint
app.post('/api/execute', async (req, res) => {
  try {
    // Validate input
    const { text, language = 'python', temperature = 0.7, maxTokens = 1024 } = req.body;
    
    if (!text) {
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
    
    return res.status(500).json({
      isError: true,
      errorMessage: error.response?.data?.error?.message || error.message || 'Failed to execute code'
    });
  }
});

// Fix code endpoint
app.post('/api/fix', async (req, res) => {
  try {
    // Validate input
    const { text, language = 'python', temperature = 0.7, maxTokens = 1024 } = req.body;
    
    if (!text) {
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
    
    return res.status(500).json({
      isError: true,
      errorMessage: error.message || "Unknown error occurred"
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 