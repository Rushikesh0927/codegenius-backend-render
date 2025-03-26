// This file serves as the entry point for Render deployment
console.log('Starting CodeGenius Backend Server - SIMPLIFIED VERSION');

// Import required packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint - using JSON response instead of HTML
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'CodeGenius API Server Running' });
});

// Execute code endpoint with simplified mock response
app.post('/api/execute', (req, res) => {
  console.log('Execute API called');
  res.json({
    text: 'Mock execution response - Hello World!',
    isError: false
  });
});

// Fix code endpoint with simplified mock response
app.post('/api/fix', (req, res) => {
  console.log('Fix API called');
  res.json({
    text: 'Mock fix response - Code looks good!',
    isError: false
  });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 