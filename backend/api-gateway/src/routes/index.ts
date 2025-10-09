/**
 * Route registration
 */

import { FastifyInstance } from 'fastify';
import authRoutes from './auth-v2'; // Use auth-v2 which has full implementation
import usersRoutes from './users';
import devicesRoutes from './devices';
import { alertRoutes } from './alerts';
import { scriptsRoutes } from './scripts';
import { metricsRoutes } from './metrics';
import { cacheRoutes } from './cache';
import { docsRoutes } from './docs';

export async function setupRoutes(app: FastifyInstance) {
  // API v1 routes
  app.register(async (apiV1) => {
    // Authentication routes (using auth-v2 with full implementation)
    apiV1.register(authRoutes, { prefix: '/auth' });

    // User management routes
    apiV1.register(usersRoutes, { prefix: '/users' });

    // Device management routes
    apiV1.register(devicesRoutes, { prefix: '/devices' });

    // Metrics routes (InfluxDB)
    apiV1.register(metricsRoutes, { prefix: '/metrics' });

    // Cache management routes (Dragonfly)
    apiV1.register(cacheRoutes, { prefix: '/cache' });

    // Alert management routes - temporarily disabled due to schema issues
    // apiV1.register(alertRoutes, { prefix: '/alerts' });

    // Script management routes - temporarily disabled due to schema issues
    // apiV1.register(scriptsRoutes, { prefix: '/scripts' });
  }, { prefix: '/api/v1' });

  // Documentation routes
  app.register(docsRoutes, { prefix: '/api-docs' });

  // Root endpoint
  app.get('/', async () => {
    return {
      name: 'NinjaIT API Gateway',
      version: '0.3.0',
      status: 'running',
      documentation: {
        swagger: '/docs',
        redoc: '/api-docs/redoc',
        postman: '/api-docs/postman',
        changelog: '/api-docs/changelog',
        openapi: '/docs/json',
      },
      endpoints: {
        health: '/health',
        api: '/api/v1',
      },
    };
  });
}

