# CodeGenius Backend API

Backend API service for the CodeGenius application, built with Express and deployed on Render.

## Features

- Code execution API endpoint (`/api/execute`)
- Code fixing/optimization endpoint (`/api/fix`)
- CORS support for frontend applications
- Secure API key management with environment variables

## Environment Setup

Create a `.env` file with the following variables:

```
PORT=4000
OPENROUTER_API_KEY=your_openrouter_api_key
ALLOWED_ORIGINS=http://localhost:8080,https://your-frontend-url.vercel.app
```

## Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## API Endpoints

### 1. Execute Code

**Endpoint:** `POST /api/execute`

**Request Body:**
```json
{
  "text": "Execute the following Python code: ```python\nprint('Hello, world!')\n```",
  "language": "python",
  "temperature": 0.1,
  "maxTokens": 1024
}
```

**Response:**
```json
{
  "text": "Hello, world!",
  "isError": false
}
```

### 2. Fix Code

**Endpoint:** `POST /api/fix`

**Request Body:**
```json
{
  "text": "Fix the following code: ```python\ndef greet():\nprint('Hello')\n```",
  "language": "python",
  "temperature": 0.3,
  "maxTokens": 1024
}
```

**Response:**
```json
{
  "text": "Here's the improved code: [code and explanation]",
  "isError": false
}
```

## Deployment on Render

1. Create a new Web Service on Render
2. Link to your GitHub repository
3. Configure the service:
   - **Name:** codegenius-backend
   - **Runtime:** Node
   - **Build Command:** npm install
   - **Start Command:** npm start
4. Add the environment variables mentioned above
5. Deploy the service

## Frontend Integration

Update your frontend API service to use the Render deployed URL as the base URL for API requests. 