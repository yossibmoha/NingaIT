/**
 * Authentication routes
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as AuthService from '../services/auth.service';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  organizationName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default async function authRoutes(app: FastifyInstance) {
  // Register endpoint
  app.post('/register', {
    schema: {
      tags: ['auth'],
      description: 'Register a new user and organization',
      body: {
        type: 'object',
        required: ['email', 'password', 'fullName', 'organizationName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          fullName: { type: 'string', minLength: 2 },
          organizationName: { type: 'string', minLength: 2 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                fullName: { type: 'string' },
              },
            },
            organization: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    // Validate request body
    const data = registerSchema.parse(request.body);

    // TODO: Implement user registration
    // 1. Check if email already exists
    // 2. Hash password
    // 3. Create organization
    // 4. Create user
    // 5. Return user and organization data

    reply.code(501).send({
      error: 'Not implemented yet',
      message: 'User registration will be implemented in the auth service',
    });
  });

  // Login endpoint
  app.post('/login', {
    schema: {
      tags: ['auth'],
      description: 'Login with email and password',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'number' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                fullName: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Validate request body
      const data = loginSchema.parse(request.body);

      // Login user
      const user = await AuthService.login(data);

      // Generate JWT tokens
      const tokenPayload = {
        sub: user.id,
        organizationId: user.organizationId,
        email: user.email,
        role: user.role,
      };

      const accessToken = app.jwt.sign(tokenPayload, { expiresIn: '15m' });
      const refreshToken = app.jwt.sign(tokenPayload, { expiresIn: '7d' });

      // TODO: Store refresh token when refresh_tokens table is added
      // await AuthService.storeRefreshToken(user.id, refreshToken, 7 * 24 * 60 * 60 * 1000);

      reply.send({
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes in seconds
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error: any) {
      app.log.error('Login error:', error);
      reply.code(401).send({
        error: 'Authentication failed',
        message: error.message || 'Invalid credentials',
      });
    }
  });

  // Logout endpoint
  app.post('/logout', {
    schema: {
      tags: ['auth'],
      description: 'Logout user (invalidate tokens)',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    // TODO: Implement logout
    // 1. Verify JWT token
    // 2. Invalidate refresh token
    // 3. Add token to blacklist (Dragonfly)

    reply.send({ message: 'Logged out successfully' });
  });

  // Refresh token endpoint
  app.post('/refresh', {
    schema: {
      tags: ['auth'],
      description: 'Refresh access token using refresh token',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            expiresIn: { type: 'number' },
          },
        },
      },
    },
  }, async (request, reply) => {
    // TODO: Implement token refresh
    // 1. Verify refresh token
    // 2. Check if token is blacklisted
    // 3. Generate new access token
    // 4. Return new token

    reply.code(501).send({
      error: 'Not implemented yet',
      message: 'Token refresh will be implemented',
    });
  });

  // Get current user
  app.get('/me', {
    schema: {
      tags: ['auth'],
      description: 'Get current user information',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            fullName: { type: 'string' },
            role: { type: 'string' },
            organization: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    // TODO: Implement get current user
    // 1. Verify JWT token
    // 2. Get user from database
    // 3. Return user data

    reply.code(501).send({
      error: 'Not implemented yet',
      message: 'Get current user will be implemented',
    });
  });
}

