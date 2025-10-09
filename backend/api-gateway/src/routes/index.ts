/**
 * Route registration
 */

import { FastifyInstance } from 'fastify';
import authRoutes from './auth';
import usersRoutes from './users';
import devicesRoutes from './devices';
import { alertRoutes } from './alerts';
import { scriptsRoutes } from './scripts';
import { metricsRoutes } from './metrics';

export async function setupRoutes(app: FastifyInstance) {
  // API v1 routes
  app.register(async (apiV1) => {
    // Authentication routes
    apiV1.register(authRoutes, { prefix: '/auth' });

    // User management routes
    apiV1.register(usersRoutes, { prefix: '/users' });

    // Device management routes
    apiV1.register(devicesRoutes, { prefix: '/devices' });

    // Metrics routes (InfluxDB)
    apiV1.register(metricsRoutes, { prefix: '/metrics' });

    // Alert management routes - temporarily disabled due to schema issues
    // apiV1.register(alertRoutes, { prefix: '/alerts' });

    // Script management routes - temporarily disabled due to schema issues
    // apiV1.register(scriptsRoutes, { prefix: '/scripts' });
  }, { prefix: '/api/v1' });

  // Root endpoint
  app.get('/', async () => {
    return {
      name: 'NinjaIT API Gateway',
      version: '0.1.0',
      status: 'running',
      docs: '/docs',
      health: '/health',
    };
  });
}

