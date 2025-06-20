import type { FastifyInstance } from 'fastify';
import type { WebSocket } from '@fastify/websocket';
import { IncomingMessageSchema } from '../types/index.js';
import { AuthService } from '../services/auth.js';
import { OpenAIService } from '../services/openai.js';

export async function websocketRoutes(fastify: FastifyInstance) {
  const authService = new AuthService();
  const openaiService = new OpenAIService();

  fastify.get('/suggest', { websocket: true }, async (connection, req) => {
    console.log('WebSocket connection attempt');

    // Manually parse the token from the request URL for reliability
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      console.log('No token provided in query parameters');
      connection.close(1008, 'Authentication required');
      return;
    }

    console.log("Received token:", token);

    const user = authService.validateToken(token);
    if (!user) {
      console.error('Token validation failed.');
      connection.close(1008, 'Invalid authentication token');
      return;
    }

    console.log(`WebSocket connection established for user:`, user);

    connection.on('message', async (rawMessage) => {
      try {
        const messageData = JSON.parse(rawMessage.toString());
        const validatedMessage = IncomingMessageSchema.parse(messageData);

        console.log(`Processing text analysis for doc: ${validatedMessage.docId}`);

        const suggestions = await openaiService.getSuggestions(validatedMessage.text);

        // Send all suggestions to the client
        for (const suggestion of suggestions) {
          if (connection.readyState === 1) { // 1 === OPEN
            connection.send(JSON.stringify(suggestion));
          } else {
            console.log('WebSocket connection closed, cannot send suggestion');
            break;
          }
        }

        // Optionally, send a completion message
        if (connection.readyState === 1) {
          connection.send(JSON.stringify({ type: 'complete', payload: { message: 'Analysis complete' } }));
        }

      } catch (error: any) {
        console.error('Message processing error:', error.message);
        if (connection.readyState === 1) { // 1 === OPEN
          connection.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Invalid message format or processing error' }
          }));
        }
      }
    });

    connection.on('close', () => {
      console.log(`WebSocket connection closed for user: ${user.sub}`);
    });

    connection.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}
