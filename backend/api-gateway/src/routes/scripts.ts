/**
 * Scripts API Routes
 * Endpoints for script management and execution
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Zod schemas
const scriptIdParam = z.object({
  id: z.string().uuid(),
});

const executionIdParam = z.object({
  id: z.string(),
});

const scriptParameterSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'select']),
  description: z.string().optional(),
  required: z.boolean(),
  defaultValue: z.any().optional(),
  options: z.array(z.string()).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
});

const createScriptBody = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  scriptType: z.enum(['powershell', 'bash', 'python', 'javascript', 'batch']),
  content: z.string().min(1),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  parameters: z.array(scriptParameterSchema).optional(),
  isPublic: z.boolean().default(false),
});

const updateScriptBody = createScriptBody.partial();

const executeScriptBody = z.object({
  deviceIds: z.array(z.string().uuid()).min(1),
  parameters: z.record(z.any()).optional(),
  timeout: z.number().int().positive().optional(),
  runAs: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
});

export async function scriptsRoutes(fastify: FastifyInstance) {
  // Authentication hook
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // ==================== SCRIPTS ====================

  // GET /api/v1/scripts - List all scripts
  fastify.get('/', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      querystring: z.object({
        page: z.preprocess(Number, z.number().int().positive().default(1)).optional(),
        limit: z.preprocess(Number, z.number().int().positive().max(100).default(20)).optional(),
        search: z.string().optional(),
        category: z.string().optional(),
        scriptType: z.string().optional(),
        isPublic: z.preprocess((val) => val === 'true', z.boolean()).optional(),
      }),
      response: {
        200: z.object({
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          data: z.array(z.object({
            id: z.string().uuid(),
            name: z.string(),
            description: z.string().optional(),
            scriptType: z.string(),
            category: z.string().optional(),
            tags: z.array(z.string()).optional(),
            isPublic: z.boolean(),
            version: z.string(),
            createdAt: z.string().datetime(),
            updatedAt: z.string().datetime(),
          })),
        }),
      },
      tags: ['Scripts'],
      summary: 'List all scripts',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { page, limit, search, category, scriptType, isPublic } = request.query as any;

      fastify.log.info(`Fetching scripts: page=${page}, limit=${limit}, search=${search}`);

      // Mock data
      const mockScripts = [
        {
          id: 'script-1',
          name: 'System Health Check',
          description: 'Comprehensive system health check script',
          scriptType: 'powershell',
          category: 'diagnostics',
          tags: ['health', 'diagnostics'],
          isPublic: true,
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'script-2',
          name: 'Update Windows',
          description: 'Install Windows updates',
          scriptType: 'powershell',
          category: 'updates',
          tags: ['windows', 'updates'],
          isPublic: true,
          version: '1.2.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return { total: mockScripts.length, page, limit, data: mockScripts };
    },
  });

  // GET /api/v1/scripts/:id - Get script details
  fastify.get('/:id', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      params: scriptIdParam,
      response: {
        200: z.object({
          id: z.string().uuid(),
          name: z.string(),
          description: z.string().optional(),
          scriptType: z.string(),
          content: z.string(),
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
          parameters: z.array(scriptParameterSchema).optional(),
          isPublic: z.boolean(),
          version: z.string(),
          createdBy: z.string(),
          createdAt: z.string().datetime(),
          updatedAt: z.string().datetime(),
        }),
        404: z.object({ message: z.string() }),
      },
      tags: ['Scripts'],
      summary: 'Get script details',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;

      if (id === 'script-1') {
        return {
          id: 'script-1',
          name: 'System Health Check',
          description: 'Comprehensive system health check script',
          scriptType: 'powershell',
          content: '# System Health Check\nGet-ComputerInfo | Select-Object CsName, OsName, OsVersion',
          category: 'diagnostics',
          tags: ['health', 'diagnostics'],
          parameters: [
            {
              name: 'verbose',
              type: 'boolean',
              description: 'Enable verbose output',
              required: false,
              defaultValue: false,
            },
          ],
          isPublic: true,
          version: '1.0.0',
          createdBy: 'admin@example.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      return reply.status(404).send({ message: 'Script not found' });
    },
  });

  // POST /api/v1/scripts - Create script
  fastify.post('/', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      body: createScriptBody,
      response: {
        201: z.object({
          message: z.string(),
          scriptId: z.string().uuid(),
        }),
      },
      tags: ['Scripts'],
      summary: 'Create a new script',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const scriptData = request.body;

      fastify.log.info('Creating script:', scriptData);

      return reply.status(201).send({
        message: 'Script created successfully',
        scriptId: 'new-script-123',
      });
    },
  });

  // PUT /api/v1/scripts/:id - Update script
  fastify.put('/:id', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      params: scriptIdParam,
      body: updateScriptBody,
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      tags: ['Scripts'],
      summary: 'Update script',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;
      const updateData = request.body;

      fastify.log.info(`Updating script ${id}:`, updateData);

      return { message: 'Script updated successfully' };
    },
  });

  // DELETE /api/v1/scripts/:id - Delete script
  fastify.delete('/:id', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      params: scriptIdParam,
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      tags: ['Scripts'],
      summary: 'Delete script',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;

      fastify.log.info(`Deleting script: ${id}`);

      return { message: 'Script deleted successfully' };
    },
  });

  // POST /api/v1/scripts/:id/execute - Execute script
  fastify.post('/:id/execute', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      params: scriptIdParam,
      body: executeScriptBody,
      response: {
        202: z.object({
          message: z.string(),
          executionIds: z.array(z.string()),
        }),
        404: z.object({ message: z.string() }),
      },
      tags: ['Scripts'],
      summary: 'Execute script on device(s)',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;
      const { deviceIds, parameters, timeout, runAs, priority } = request.body as any;

      fastify.log.info(`Executing script ${id} on ${deviceIds.length} device(s)`);

      // Mock execution IDs
      const executionIds = deviceIds.map(
        (deviceId: string) => `exec-${Date.now()}-${deviceId.substr(0, 8)}`
      );

      return reply.status(202).send({
        message: `Script execution initiated on ${deviceIds.length} device(s)`,
        executionIds,
      });
    },
  });

  // ==================== EXECUTIONS ====================

  // GET /api/v1/scripts/executions - List executions
  fastify.get('/executions', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      querystring: z.object({
        page: z.preprocess(Number, z.number().int().positive().default(1)).optional(),
        limit: z.preprocess(Number, z.number().int().positive().max(100).default(20)).optional(),
        scriptId: z.string().uuid().optional(),
        deviceId: z.string().uuid().optional(),
        status: z.string().optional(),
      }),
      response: {
        200: z.object({
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          data: z.array(z.object({
            id: z.string(),
            scriptId: z.string().uuid(),
            scriptName: z.string().optional(),
            deviceId: z.string().uuid(),
            deviceName: z.string().optional(),
            status: z.string(),
            executedBy: z.string(),
            startedAt: z.string().datetime().optional(),
            completedAt: z.string().datetime().optional(),
            duration: z.number().optional(),
          })),
        }),
      },
      tags: ['Scripts'],
      summary: 'List script executions',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { page, limit, scriptId, deviceId, status } = request.query as any;

      fastify.log.info(`Fetching executions: script=${scriptId}, device=${deviceId}, status=${status}`);

      // Mock data
      const mockExecutions = [
        {
          id: 'exec-1',
          scriptId: 'script-1',
          scriptName: 'System Health Check',
          deviceId: 'dev-001',
          deviceName: 'Server-Prod-001',
          status: 'completed',
          executedBy: 'admin@example.com',
          startedAt: new Date(Date.now() - 300000).toISOString(),
          completedAt: new Date(Date.now() - 295000).toISOString(),
          duration: 5000,
        },
        {
          id: 'exec-2',
          scriptId: 'script-2',
          scriptName: 'Update Windows',
          deviceId: 'dev-002',
          deviceName: 'Workstation-002',
          status: 'running',
          executedBy: 'admin@example.com',
          startedAt: new Date(Date.now() - 60000).toISOString(),
        },
      ];

      return { total: mockExecutions.length, page, limit, data: mockExecutions };
    },
  });

  // GET /api/v1/scripts/executions/:id - Get execution details
  fastify.get('/executions/:id', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      params: executionIdParam,
      response: {
        200: z.object({
          id: z.string(),
          scriptId: z.string().uuid(),
          scriptName: z.string().optional(),
          deviceId: z.string().uuid(),
          deviceName: z.string().optional(),
          executedBy: z.string(),
          parameters: z.record(z.any()).optional(),
          status: z.string(),
          output: z.string().optional(),
          errorOutput: z.string().optional(),
          exitCode: z.number().optional(),
          startedAt: z.string().datetime().optional(),
          completedAt: z.string().datetime().optional(),
          duration: z.number().optional(),
        }),
        404: z.object({ message: z.string() }),
      },
      tags: ['Scripts'],
      summary: 'Get execution details',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;

      if (id === 'exec-1') {
        return {
          id: 'exec-1',
          scriptId: 'script-1',
          scriptName: 'System Health Check',
          deviceId: 'dev-001',
          deviceName: 'Server-Prod-001',
          executedBy: 'admin@example.com',
          parameters: { verbose: true },
          status: 'completed',
          output: 'CsName: SERVER-01\nOsName: Windows Server 2019\nOsVersion: 10.0.17763',
          exitCode: 0,
          startedAt: new Date(Date.now() - 300000).toISOString(),
          completedAt: new Date(Date.now() - 295000).toISOString(),
          duration: 5000,
        };
      }

      return reply.status(404).send({ message: 'Execution not found' });
    },
  });

  // POST /api/v1/scripts/executions/:id/cancel - Cancel execution
  fastify.post('/executions/:id/cancel', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      params: executionIdParam,
      response: {
        200: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      tags: ['Scripts'],
      summary: 'Cancel script execution',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;

      fastify.log.info(`Cancelling execution: ${id}`);

      return { message: 'Execution cancelled successfully' };
    },
  });

  // POST /api/v1/scripts/executions/:id/retry - Retry failed execution
  fastify.post('/executions/:id/retry', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      params: executionIdParam,
      response: {
        202: z.object({
          message: z.string(),
          executionId: z.string(),
        }),
        404: z.object({ message: z.string() }),
      },
      tags: ['Scripts'],
      summary: 'Retry failed execution',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;

      fastify.log.info(`Retrying execution: ${id}`);

      return reply.status(202).send({
        message: 'Execution retry initiated',
        executionId: `exec-retry-${Date.now()}`,
      });
    },
  });

  // GET /api/v1/scripts/categories - Get script categories
  fastify.get('/categories', {
    schema: {
      headers: z.object({
        Authorization: z.string(),
      }),
      response: {
        200: z.array(z.object({
          name: z.string(),
          count: z.number(),
        })),
      },
      tags: ['Scripts'],
      summary: 'Get script categories',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      return [
        { name: 'diagnostics', count: 5 },
        { name: 'updates', count: 3 },
        { name: 'maintenance', count: 4 },
        { name: 'security', count: 6 },
      ];
    },
  });
}

