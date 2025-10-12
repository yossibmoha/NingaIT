/**
 * Authentication routes - IMPLEMENTED
 */

import { FastifyInstance } from 'fastify';
import { 
  register, 
  login, 
  getUserById,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  blacklistToken,
  RegisterSchema,
  LoginSchema,
  generateTokenPayload,
  getTokenExpiration
} from '../services/auth.service';
import { authenticate } from '../middleware/auth';

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
            user: { type: 'object' },
            organization: { type: 'object' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Validate request body
      const data = RegisterSchema.parse(request.body);
      
      // Register user
      const result = await register(data);
      
      // Generate tokens
      const tokenPayload = generateTokenPayload(result.user);
      const accessToken = app.jwt.sign(tokenPayload, { expiresIn: '15m' });
      const refreshToken = app.jwt.sign({ sub: result.user.id }, { expiresIn: '7d' });
      
      // Store refresh token
      await storeRefreshToken(result.user.id, refreshToken, 7 * 24 * 60 * 60 * 1000);
      
      reply.code(201).send({
        user: result.user,
        organization: result.organization,
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes in seconds
      });
    } catch (error: any) {
      reply.code(400).send({
        error: 'Registration failed',
        message: error.message,
      });
    }
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
            user: { type: 'object' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'number' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Validate request body
      const data = LoginSchema.parse(request.body);
      
      // Login user
      const user = await login(data);
      
      // Generate tokens
      const tokenPayload = generateTokenPayload(user);
      const accessToken = app.jwt.sign(tokenPayload, { expiresIn: '15m' });
      const refreshToken = app.jwt.sign({ sub: user.id }, { expiresIn: '7d' });
      
      // Store refresh token
      await storeRefreshToken(user.id, refreshToken, 7 * 24 * 60 * 60 * 1000);
      
      reply.send({
        user,
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes in seconds
      });
    } catch (error: any) {
      reply.code(401).send({
        error: 'Login failed',
        message: error.message,
      });
    }
  });

  // Logout endpoint
  app.post('/logout', {
    onRequest: [authenticate],
    schema: {
      tags: ['auth'],
      description: 'Logout user (invalidate tokens)',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' },
        },
      },
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
    try {
      const token = request.headers.authorization?.replace('Bearer ', '') || '';
      const { refreshToken } = request.body as { refreshToken?: string };
      
      // Blacklist access token (expires in 15 minutes)
      await blacklistToken(token, 15 * 60 * 1000);
      
      // Revoke refresh token if provided
      if (refreshToken) {
        await revokeRefreshToken(refreshToken);
      }
      
      reply.send({ message: 'Logged out successfully' });
    } catch (error: any) {
      reply.code(500).send({
        error: 'Logout failed',
        message: error.message,
      });
    }
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
    try {
      const { refreshToken } = request.body as { refreshToken: string };
      
      // Verify refresh token
      const userId = await verifyRefreshToken(refreshToken);
      
      // Get user data
      const user = await getUserById(userId);
      
      // Generate new access token
      const tokenPayload = generateTokenPayload(user);
      const accessToken = app.jwt.sign(tokenPayload, { expiresIn: '15m' });
      
      reply.send({
        accessToken,
        expiresIn: 900, // 15 minutes in seconds
      });
    } catch (error: any) {
      reply.code(401).send({
        error: 'Token refresh failed',
        message: error.message,
      });
    }
  });

  // Get current user
  app.get('/me', {
    onRequest: [authenticate],
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
            organization: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userPayload = request.user as any;
      
      // Get full user data
      const user = await getUserById(userPayload.sub);
      
      reply.send(user);
    } catch (error: any) {
      reply.code(404).send({
        error: 'User not found',
        message: error.message,
      });
    }
  });
}

