/**
 * Plugin registration for Fastify
 */

import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import websocket from '@fastify/websocket';
import multipart from '@fastify/multipart';
import { config } from '../config';

export async function setupPlugins(app: FastifyInstance) {
  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: false, // Disable for development
  });

  // CORS
  await app.register(cors, {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    cache: 10000,
    allowList: ['127.0.0.1'],
    redis: null, // TODO: Connect to Dragonfly for distributed rate limiting
  });

  // JWT
  await app.register(jwt, {
    secret: config.jwt.secret,
    sign: {
      expiresIn: config.jwt.expiresIn,
    },
  });

  // WebSocket support
  await app.register(websocket);

  // Multipart/form-data support
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Swagger documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'NinjaIT API',
        description: 'Next-generation IT management platform API',
        version: '0.1.0',
        contact: {
          name: 'NinjaIT Team',
          email: 'api@ninjait.io',
        },
      },
      servers: [
        {
          url: `http://localhost:${config.server.port}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'users', description: 'User management' },
        { name: 'devices', description: 'Device management' },
        { name: 'monitoring', description: 'Monitoring and metrics' },
        { name: 'alerts', description: 'Alert management' },
        { name: 'organizations', description: 'Organization management' },
      ],
    },
  });

  // Swagger UI
  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
}

