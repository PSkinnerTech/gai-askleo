
# Askleo Real-time Language API

A high-performance WebSocket API for real-time medical writing assistance powered by OpenAI's GPT models.

## Features

- **Real-time Suggestions**: WebSocket-based streaming for sub-200ms latency
- **Medical Focus**: Specialized prompts for clinical documentation
- **Secure Authentication**: JWT-based authentication with Supabase
- **Scalable Architecture**: Built with Fastify for high performance

## Getting Started

### Prerequisites

- Node.js 20+
- OpenAI API key
- Supabase JWT secret

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## API Usage

### WebSocket Endpoint

Connect to `/suggest` with a valid Supabase JWT token in the Authorization header:

```javascript
const ws = new WebSocket('ws://localhost:3001/suggest', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});

// Send text for analysis
ws.send(JSON.stringify({
  docId: 'uuid-here',
  text: 'The patient compains of chest pain.'
}));

// Receive suggestions
ws.onmessage = (event) => {
  const suggestion = JSON.parse(event.data);
  console.log(suggestion);
};
```

### Suggestion Format

```json
{
  "type": "suggestion",
  "payload": {
    "id": "suggestion-uuid",
    "range": { "from": 10, "to": 20 },
    "replacement": "complains of",
    "rule": "Spelling",
    "explanation": "Corrected spelling of 'compains'."
  }
}
```

## Deployment

Deploy to Fly.io:

```bash
flyctl launch
flyctl secrets set OPENAI_API_KEY=your-key
flyctl secrets set SUPABASE_JWT_SECRET=your-secret
flyctl deploy
```
