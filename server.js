// This file serves as the entry point for Render deployment
console.log('Starting CodeGenius Backend Server...');

// Import the app module which contains the Express app definition
const app = require('./app');

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 