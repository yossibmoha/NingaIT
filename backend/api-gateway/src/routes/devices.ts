/**
 * Device management routes
 */

import { FastifyInstance } from 'fastify';

export default async function devicesRoutes(app: FastifyInstance) {
  // Get all devices
  app.get('/', {
    schema: {
      tags: ['devices'],
      description: 'Get all devices in organization',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          status: { type: 'string', enum: ['online', 'offline', 'warning', 'critical'] },
          platform: { type: 'string', enum: ['windows', 'macos', 'linux'] },
        },
      },
    },
  }, async (request, reply) => {
    reply.code(501).send({
      error: 'Not implemented yet',
      message: 'Device list endpoint will be implemented',
    });
  });

  // Get device by ID
  app.get('/:id', {
    schema: {
      tags: ['devices'],
      description: 'Get device by ID with current metrics',
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
      message: 'Get device endpoint will be implemented',
    });
  });

  // Get device metrics
  app.get('/:id/metrics', {
    schema: {
      tags: ['devices'],
      description: 'Get device metrics history',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          from: { type: 'string', format: 'date-time' },
          to: { type: 'string', format: 'date-time' },
          interval: { type: 'string', enum: ['1m', '5m', '15m', '1h', '1d'] },
        },
      },
    },
  }, async (request, reply) => {
    reply.code(501).send({
      error: 'Not implemented yet',
      message: 'Device metrics endpoint will be implemented',
    });
  });

  // Update device
  app.patch('/:id', {
    schema: {
      tags: ['devices'],
      description: 'Update device information',
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
      message: 'Update device endpoint will be implemented',
    });
  });

  // Delete device
  app.delete('/:id', {
    schema: {
      tags: ['devices'],
      description: 'Delete device',
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
      message: 'Delete device endpoint will be implemented',
    });
  });
}

