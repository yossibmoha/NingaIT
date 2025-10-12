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
import { swaggerConfig, swaggerUiConfig } from '../config/swagger';

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

  // Rate limiting - TEMPORARILY DISABLED FOR DEBUGGING
  // await app.register(rateLimit, {
  //   max: config.rateLimit.max,
  //   timeWindow: config.rateLimit.timeWindow,
  //   cache: 10000,
  //   allowList: ['127.0.0.1'],
  //   redis: null, // TODO: Connect to Dragonfly for distributed rate limiting
  // });

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

  // Swagger/OpenAPI documentation
  await app.register(swagger, swaggerConfig);

  // Swagger UI (Interactive documentation)
  await app.register(swaggerUi, swaggerUiConfig);
}

