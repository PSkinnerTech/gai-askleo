
import type { FastifyInstance } from 'fastify';
import { IncomingMessageSchema } from '../types/index.js';
import { AuthService } from '../services/auth.js';
import { OpenAIService } from '../services/openai.js';

export async function websocketRoutes(fastify: FastifyInstance) {
  const authService = new AuthService();
  const openaiService = new OpenAIService();

  fastify.register(async function (fastify) {
    fastify.get('/suggest', { websocket: true }, async (connection, req) => {
      console.log('WebSocket connection attempt');

      // Extract and validate JWT token
      const token = authService.extractTokenFromHeaders(req.headers);
      if (!token) {
        console.log('No token provided');
        connection.socket.close(1008, 'Authentication required');
        return;
      }

      const user = authService.validateToken(token);
      if (!user) {
        console.log('Invalid token');
        connection.socket.close(1008, 'Invalid authentication token');
        return;
      }

      console.log(`WebSocket connection established for user: ${user.sub}`);

      connection.socket.on('message', async (rawMessage) => {
        try {
          const messageData = JSON.parse(rawMessage.toString());
          const validatedMessage = IncomingMessageSchema.parse(messageData);

          console.log(`Processing text analysis for doc: ${validatedMessage.docId}`);

          // Stream suggestions back to client
          for await (const suggestion of openaiService.getSuggestions(
            validatedMessage.text,
            validatedMessage.docId
          )) {
            if (connection.socket.readyState === connection.socket.OPEN) {
              connection.socket.send(JSON.stringify(suggestion));
            } else {
              console.log('WebSocket connection closed, stopping stream');
              break;
            }
          }

        } catch (error) {
          console.error('Message processing error:', error);
          if (connection.socket.readyState === connection.socket.OPEN) {
            connection.socket.send(JSON.stringify({
              type: 'error',
              payload: { message: 'Invalid message format' }
            }));
          }
        }
      });

      connection.socket.on('close', () => {
        console.log(`WebSocket connection closed for user: ${user.sub}`);
      });

      connection.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  });
}
