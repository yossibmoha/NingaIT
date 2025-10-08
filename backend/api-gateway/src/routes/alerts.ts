/**
 * Alert API Routes
 * Endpoints for managing alerts, rules, and notification channels
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Zod schemas for request validation
const alertIdParam = z.object({
  id: z.string().uuid(),
});

const createRuleBody = z.object({
  name: z.string().min(3).max(255),
  deviceId: z.string().uuid().optional(),
  metric: z.enum(['cpu', 'memory', 'disk', 'network', 'uptime']),
  condition: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
  threshold: z.number().min(0).max(100),
  duration: z.number().int().min(0).optional(),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  enabled: z.boolean().default(true),
  notificationChannels: z.array(z.string().uuid()),
  cooldown: z.number().int().min(0).optional(),
});

const updateRuleBody = createRuleBody.partial();

const createChannelBody = z.object({
  type: z.enum(['email', 'slack', 'webhook', 'sms', 'push']),
  name: z.string().min(3).max(255),
  config: z.record(z.any()),
  enabled: z.boolean().default(true),
});

const updateChannelBody = createChannelBody.partial();

const resolveAlertBody = z.object({
  notes: z.string().optional(),
});

export async function alertRoutes(fastify: FastifyInstance) {
  // Authentication hook for all alert routes
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // ==================== ALERTS ====================

  // GET /api/v1/alerts - List all alerts
  fastify.get('/', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      querystring: z.object({
        page: z.preprocess(Number, z.number().int().positive().default(1)).optional(),
        limit: z.preprocess(Number, z.number().int().positive().max(100).default(20)).optional(),
        severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
        deviceId: z.string().uuid().optional(),
        isResolved: z.preprocess((val) => val === 'true', z.boolean()).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      }),
      response: {
        200: z.object({
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          data: z.array(z.object({
            id: z.string().uuid(),
            ruleId: z.string().uuid(),
            deviceId: z.string().uuid(),
            metric: z.string(),
            severity: z.string(),
            message: z.string(),
            currentValue: z.number(),
            threshold: z.number(),
            triggeredAt: z.string().datetime(),
            resolvedAt: z.string().datetime().optional(),
            isResolved: z.boolean(),
          })),
        }),
      },
      tags: ['Alerts'],
      summary: 'List all alerts',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { page, limit, severity, deviceId, isResolved, startDate, endDate } = request.query as any;
      
      fastify.log.info(`Fetching alerts: page=${page}, limit=${limit}, severity=${severity}, deviceId=${deviceId}, resolved=${isResolved}`);

      // Placeholder for fetching alerts from DB
      const mockAlerts = [
        {
          id: 'alert-1',
          ruleId: 'rule-1',
          deviceId: 'dev-001',
          metric: 'cpu',
          severity: 'critical',
          message: 'CPU usage above 90%',
          currentValue: 92.5,
          threshold: 90,
          triggeredAt: new Date().toISOString(),
          isResolved: false,
        },
        {
          id: 'alert-2',
          ruleId: 'rule-2',
          deviceId: 'dev-002',
          metric: 'memory',
          severity: 'warning',
          message: 'Memory usage above 80%',
          currentValue: 85.2,
          threshold: 80,
          triggeredAt: new Date(Date.now() - 3600000).toISOString(),
          resolvedAt: new Date(Date.now() - 1800000).toISOString(),
          isResolved: true,
        },
      ];

      return { total: mockAlerts.length, page, limit, data: mockAlerts };
    },
  });

  // GET /api/v1/alerts/:id - Get alert details
  fastify.get('/:id', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      params: alertIdParam,
      response: {
        200: z.object({
          id: z.string().uuid(),
          ruleId: z.string().uuid(),
          deviceId: z.string().uuid(),
          metric: z.string(),
          severity: z.string(),
          message: z.string(),
          currentValue: z.number(),
          threshold: z.number(),
          condition: z.string(),
          triggeredAt: z.string().datetime(),
          resolvedAt: z.string().datetime().optional(),
          isResolved: z.boolean(),
          resolvedBy: z.string().uuid().optional(),
          notes: z.string().optional(),
        }),
        404: z.object({ message: z.string() }),
      },
      tags: ['Alerts'],
      summary: 'Get alert details',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;

      if (id === 'alert-1') {
        return {
          id: 'alert-1',
          ruleId: 'rule-1',
          deviceId: 'dev-001',
          metric: 'cpu',
          severity: 'critical',
          message: 'CPU usage above 90%',
          currentValue: 92.5,
          threshold: 90,
          condition: 'greater than',
          triggeredAt: new Date().toISOString(),
          isResolved: false,
        };
      }

      return reply.status(404).send({ message: 'Alert not found' });
    },
  });

  // POST /api/v1/alerts/:id/resolve - Resolve an alert
  fastify.post('/:id/resolve', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      params: alertIdParam,
      body: resolveAlertBody,
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      tags: ['Alerts'],
      summary: 'Resolve an alert',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;
      const { notes } = request.body as any;

      fastify.log.info(`Resolving alert ${id} with notes: ${notes}`);

      // Placeholder for updating alert in DB
      if (id === 'alert-1') {
        return { message: 'Alert resolved successfully' };
      }

      return reply.status(404).send({ message: 'Alert not found' });
    },
  });

  // DELETE /api/v1/alerts/:id - Delete an alert
  fastify.delete('/:id', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      params: alertIdParam,
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      tags: ['Alerts'],
      summary: 'Delete an alert',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;

      fastify.log.info(`Deleting alert: ${id}`);

      return { message: 'Alert deleted successfully' };
    },
  });

  // ==================== ALERT RULES ====================

  // GET /api/v1/alerts/rules - List all alert rules
  fastify.get('/rules', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      response: {
        200: z.array(z.object({
          id: z.string().uuid(),
          name: z.string(),
          deviceId: z.string().uuid().optional(),
          metric: z.string(),
          condition: z.string(),
          threshold: z.number(),
          severity: z.string(),
          enabled: z.boolean(),
        })),
      },
      tags: ['Alerts'],
      summary: 'List all alert rules',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      // Placeholder for fetching rules from DB
      return [
        {
          id: 'rule-1',
          name: 'High CPU Usage',
          metric: 'cpu',
          condition: 'gt',
          threshold: 90,
          severity: 'critical',
          enabled: true,
        },
        {
          id: 'rule-2',
          name: 'High Memory Usage',
          deviceId: 'dev-002',
          metric: 'memory',
          condition: 'gt',
          threshold: 80,
          severity: 'warning',
          enabled: true,
        },
      ];
    },
  });

  // POST /api/v1/alerts/rules - Create alert rule
  fastify.post('/rules', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      body: createRuleBody,
      response: {
        201: z.object({
          message: z.string(),
          ruleId: z.string().uuid(),
        }),
      },
      tags: ['Alerts'],
      summary: 'Create a new alert rule',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const ruleData = request.body;

      fastify.log.info('Creating alert rule:', ruleData);

      return reply.status(201).send({
        message: 'Alert rule created successfully',
        ruleId: 'new-rule-123',
      });
    },
  });

  // PUT /api/v1/alerts/rules/:id - Update alert rule
  fastify.put('/rules/:id', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      params: alertIdParam,
      body: updateRuleBody,
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      tags: ['Alerts'],
      summary: 'Update alert rule',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;
      const updateData = request.body;

      fastify.log.info(`Updating alert rule ${id}:`, updateData);

      return { message: 'Alert rule updated successfully' };
    },
  });

  // DELETE /api/v1/alerts/rules/:id - Delete alert rule
  fastify.delete('/rules/:id', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      params: alertIdParam,
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      tags: ['Alerts'],
      summary: 'Delete alert rule',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;

      fastify.log.info(`Deleting alert rule: ${id}`);

      return { message: 'Alert rule deleted successfully' };
    },
  });

  // ==================== NOTIFICATION CHANNELS ====================

  // GET /api/v1/alerts/channels - List notification channels
  fastify.get('/channels', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      response: {
        200: z.array(z.object({
          id: z.string().uuid(),
          type: z.string(),
          name: z.string(),
          enabled: z.boolean(),
        })),
      },
      tags: ['Alerts'],
      summary: 'List notification channels',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      // Placeholder for fetching channels from DB
      return [
        { id: 'channel-1', type: 'email', name: 'Admin Email', enabled: true },
        { id: 'channel-2', type: 'slack', name: 'DevOps Slack', enabled: true },
      ];
    },
  });

  // POST /api/v1/alerts/channels - Create notification channel
  fastify.post('/channels', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      body: createChannelBody,
      response: {
        201: z.object({
          message: z.string(),
          channelId: z.string().uuid(),
        }),
      },
      tags: ['Alerts'],
      summary: 'Create notification channel',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const channelData = request.body;

      fastify.log.info('Creating notification channel:', channelData);

      return reply.status(201).send({
        message: 'Notification channel created successfully',
        channelId: 'new-channel-123',
      });
    },
  });

  // POST /api/v1/alerts/channels/:id/test - Test notification channel
  fastify.post('/channels/:id/test', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      params: alertIdParam,
      response: {
        200: z.object({ message: z.string(), success: z.boolean() }),
      },
      tags: ['Alerts'],
      summary: 'Test notification channel',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;

      fastify.log.info(`Testing notification channel: ${id}`);

      return { message: 'Test notification sent successfully', success: true };
    },
  });
}

