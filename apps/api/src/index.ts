
import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { config } from './config/index.js';
import { websocketRoutes } from './routes/websocket.js';

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: 'info',
    },
  });

  // Register CORS
  await fastify.register(cors, {
    origin: config.FRONTEND_DOMAIN ? [config.FRONTEND_DOMAIN] : true,
    credentials: true,
  });

  // Register WebSocket support
  await fastify.register(websocket);

  // Register routes
  await fastify.register(websocketRoutes);

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return fastify;
}

async function start() {
  try {
    const server = await buildServer();
    
    await server.listen({
      port: config.PORT,
      host: config.HOST,
    });

    console.log(`🚀 Askleo API Server running on ${config.HOST}:${config.PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
