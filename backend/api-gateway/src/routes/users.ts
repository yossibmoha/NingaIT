/**
 * User management routes
 */

import { FastifyInstance } from 'fastify';

export default async function usersRoutes(app: FastifyInstance) {
  // Get all users (admin only)
  app.get('/', {
    schema: {
      tags: ['users'],
      description: 'Get all users in organization',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          role: { type: 'string', enum: ['admin', 'tech', 'user'] },
        },
      },
    },
  }, async (request, reply) => {
    reply.code(501).send({
      error: 'Not implemented yet',
      message: 'User list endpoint will be implemented',
    });
  });

  // Get user by ID
  app.get('/:id', {
    schema: {
      tags: ['users'],
      description: 'Get user by ID',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    reply.code(501).send({
      error: 'Not implemented yet',
      message: 'Get user endpoint will be implemented',
    });
  });

  // Update user
  app.patch('/:id', {
    schema: {
      tags: ['users'],
      description: 'Update user information',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    reply.code(501).send({
      error: 'Not implemented yet',
      message: 'Update user endpoint will be implemented',
    });
  });

  // Delete user
  app.delete('/:id', {
    schema: {
      tags: ['users'],
      description: 'Delete user (soft delete)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    reply.code(501).send({
      error: 'Not implemented yet',
      message: 'Delete user endpoint will be implemented',
    });
  });
}

