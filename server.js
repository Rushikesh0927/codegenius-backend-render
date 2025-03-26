// This file serves as the entry point for Render deployment
console.log('Starting CodeGenius Backend Server...');

// Load the application from app.js
const app = require('./app.js');
const PORT = process.env.PORT || 4000;

// Start the server
app.listen(PORT, () => {
  console.log(`CodeGenius Backend Server is running on port ${PORT}`);
}); 