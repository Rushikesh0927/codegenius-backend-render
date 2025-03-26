const axios = require('axios');

// Using the actual Render backend URL
const BASE_URL = 'https://codegenius-backend.onrender.com';

async function testBackend() {
  try {
    console.log('Testing backend API...');
    
    // Test root endpoint
    console.log(`Testing root endpoint: ${BASE_URL}`);
    const rootResponse = await axios.get(BASE_URL);
    console.log('Root endpoint response:', rootResponse.data);
    
    // Test execute endpoint with a simple Python code
    console.log(`Testing execute endpoint: ${BASE_URL}/api/execute`);
    const executeResponse = await axios.post(
      `${BASE_URL}/api/execute`,
      {
        text: 'Execute the following Python code:\n```python\nprint("Hello, World!")\n```',
        language: 'python'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Execute endpoint response:', executeResponse.data);
    
  } catch (error) {
    console.error('Error testing backend:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
}

testBackend(); 