/**
 * NinjaIT API Gateway
 * High-performance Fastify-based API Gateway
 * 
 * @module api-gateway
 * @author NinjaIT Team
 */

import Fastify from 'fastify';
import { config } from './config';
import { setupPlugins } from './plugins';
import { setupRoutes } from './routes';
import { logger } from './utils/logger';

const app = Fastify({
  logger: logger,
  trustProxy: true,
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
  bodyLimit: 10485760, // 10MB
});

/**
 * Initialize and start the API Gateway
 */
async function start() {
  try {
    logger.info('🚀 Starting NinjaIT API Gateway...');

    // Setup plugins (CORS, JWT, rate limiting, etc.)
    await setupPlugins(app);
    logger.info('✅ Plugins loaded');

    // Setup routes
    await setupRoutes(app);
    logger.info('✅ Routes registered');

    // Health check
    app.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: config.app.version,
        environment: config.app.env,
      };
    });

    // Start server
    await app.listen({
      port: config.server.port,
      host: config.server.host,
    });

    logger.info(`
    ╔════════════════════════════════════════════════════════╗
    ║                                                        ║
    ║          🥷 NinjaIT API Gateway Started 🥷            ║
    ║                                                        ║
    ║  Server:     http://${config.server.host}:${config.server.port}            ║
    ║  Docs:       http://${config.server.host}:${config.server.port}/docs      ║
    ║  Health:     http://${config.server.host}:${config.server.port}/health    ║
    ║  Environment: ${config.app.env}                       ║
    ║                                                        ║
    ╚════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    logger.error('❌ Error starting API Gateway:', err);
    process.exit(1);
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    logger.info(`${signal} received, shutting down gracefully...`);
    await app.close();
    process.exit(0);
  });
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
start();

