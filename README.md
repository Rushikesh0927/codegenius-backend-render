# CodeGenius Backend API

A simple backend API service for the CodeGenius application that handles code execution and code improvement requests.

## API Endpoints

### GET /
Health check endpoint that returns a simple JSON response indicating the server is running.

### POST /api/execute
Executes code using OpenRouter AI API.

**Request Body:**
```json
{
  "text": "Execute the following code: ```python\nprint('Hello World')\n```",
  "language": "python"
}
```

**Response:**
```json
{
  "text": "Output of the code execution...",
  "isError": false
}
```

### POST /api/fix
Analyzes and improves code using OpenRouter AI API.

**Request Body:**
```json
{
  "text": "def func(a, b):\n  return a + b",
  "language": "python"
}
```

**Response:**
```json
{
  "text": "Improved code with explanations...",
  "isError": false
}
```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your OpenRouter API key:
```
PORT=4000
OPENROUTER_API_KEY=your-api-key
```
4. Run the server: `npm start`

## Deployment

This service is configured to deploy on Render.com. The `render.yaml` file contains the configuration for deployment. 