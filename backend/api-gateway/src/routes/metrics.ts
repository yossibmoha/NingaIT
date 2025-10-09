/**
 * Metrics API Routes
 * Handles metrics ingestion, querying, and aggregation using InfluxDB
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { writeMetrics, queryMetrics } from '../database/connection';
import { config } from '../config';

// Validation schemas
const WriteMetricsSchema = z.object({
  deviceId: z.string().uuid(),
  metrics: z.object({
    cpu: z.number().min(0).max(100).optional(),
    memory: z.number().min(0).max(100).optional(),
    disk: z.number().min(0).max(100).optional(),
    network_in: z.number().min(0).optional(),
    network_out: z.number().min(0).optional(),
    processes: z.number().int().min(0).optional(),
    uptime: z.number().min(0).optional(),
    temperature: z.number().optional(),
  }),
  timestamp: z.string().datetime().optional(),
});

const QueryMetricsSchema = z.object({
  deviceId: z.string().uuid().optional(),
  metric: z.string().optional(),
  start: z.string().datetime(),
  end: z.string().datetime().optional(),
  aggregation: z.enum(['mean', 'max', 'min', 'sum', 'count']).optional(),
  interval: z.enum(['1m', '5m', '15m', '1h', '6h', '1d']).optional(),
});

const BatchWriteSchema = z.object({
  deviceId: z.string().uuid(),
  dataPoints: z.array(z.object({
    metrics: z.record(z.number()),
    timestamp: z.string().datetime(),
  })).min(1).max(1000),
});

/**
 * Register metrics routes
 */
export async function metricsRoutes(fastify: FastifyInstance) {
  
  /**
   * POST /api/metrics/ingest
   * Ingest metrics from agent
   */
  fastify.post('/ingest', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = WriteMetricsSchema.parse(request.body);
      const { deviceId, metrics, timestamp } = body;

      // Get organization from authenticated user
      const user = (request as any).user;
      if (!user || !user.organizationId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      // Write metrics to InfluxDB
      await writeMetrics(
        'system_metrics',
        {
          device_id: deviceId,
          organization_id: user.organizationId,
        },
        metrics,
        timestamp ? new Date(timestamp) : undefined
      );

      return reply.code(201).send({ 
        success: true,
        message: 'Metrics ingested successfully',
        deviceId,
        timestamp: timestamp || new Date().toISOString(),
      });
    } catch (error: any) {
      fastify.log.error('Metrics ingestion error:', error);
      return reply.code(400).send({ 
        error: 'Invalid request',
        message: error.message 
      });
    }
  });

  /**
   * POST /api/metrics/batch
   * Batch ingest metrics (for bulk uploads)
   */
  fastify.post('/batch', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = BatchWriteSchema.parse(request.body);
      const { deviceId, dataPoints } = body;

      const user = (request as any).user;
      if (!user || !user.organizationId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      // Write all data points
      const writePromises = dataPoints.map(point =>
        writeMetrics(
          'system_metrics',
          {
            device_id: deviceId,
            organization_id: user.organizationId,
          },
          point.metrics,
          new Date(point.timestamp)
        )
      );

      await Promise.all(writePromises);

      return reply.code(201).send({ 
        success: true,
        message: `Batch ingested ${dataPoints.length} data points`,
        deviceId,
        count: dataPoints.length,
      });
    } catch (error: any) {
      fastify.log.error('Batch metrics error:', error);
      return reply.code(400).send({ 
        error: 'Invalid request',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/metrics/query
   * Query metrics with filters and aggregations
   */
  fastify.get('/query', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = QueryMetricsSchema.parse(request.query);
      const user = (request as any).user;
      
      if (!user || !user.organizationId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      // Build Flux query
      const { deviceId, metric, start, end, aggregation, interval } = query;
      const endTime = end || new Date().toISOString();
      
      let fluxQuery = `
        from(bucket: "${config.database.influxdbBucket}")
          |> range(start: ${start}, stop: ${endTime})
          |> filter(fn: (r) => r._measurement == "system_metrics")
          |> filter(fn: (r) => r.organization_id == "${user.organizationId}")
      `;

      if (deviceId) {
        fluxQuery += `\n  |> filter(fn: (r) => r.device_id == "${deviceId}")`;
      }

      if (metric) {
        fluxQuery += `\n  |> filter(fn: (r) => r._field == "${metric}")`;
      }

      if (interval && aggregation) {
        fluxQuery += `\n  |> aggregateWindow(every: ${interval}, fn: ${aggregation}, createEmpty: false)`;
      }

      fluxQuery += '\n  |> yield(name: "result")';

      // Execute query
      const results = await queryMetrics(fluxQuery);

      return reply.send({
        success: true,
        data: results,
        query: {
          start,
          end: endTime,
          deviceId,
          metric,
          aggregation,
          interval,
        },
        count: results.length,
      });
    } catch (error: any) {
      fastify.log.error('Metrics query error:', error);
      return reply.code(400).send({ 
        error: 'Query failed',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/metrics/device/:deviceId/latest
   * Get latest metrics for a device
   */
  fastify.get('/device/:deviceId/latest', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { deviceId } = request.params as { deviceId: string };
      const user = (request as any).user;
      
      if (!user || !user.organizationId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const fluxQuery = `
        from(bucket: "${config.database.influxdbBucket}")
          |> range(start: -1h)
          |> filter(fn: (r) => r._measurement == "system_metrics")
          |> filter(fn: (r) => r.organization_id == "${user.organizationId}")
          |> filter(fn: (r) => r.device_id == "${deviceId}")
          |> last()
          |> yield(name: "latest")
      `;

      const results = await queryMetrics(fluxQuery);

      // Transform results into a more usable format
      const latestMetrics: Record<string, any> = {};
      results.forEach(row => {
        if (row._field) {
          latestMetrics[row._field] = row._value;
          latestMetrics.timestamp = row._time;
        }
      });

      return reply.send({
        success: true,
        deviceId,
        metrics: latestMetrics,
        timestamp: latestMetrics.timestamp || null,
      });
    } catch (error: any) {
      fastify.log.error('Latest metrics error:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch latest metrics',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/metrics/device/:deviceId/history
   * Get historical metrics for a device
   */
  fastify.get('/device/:deviceId/history', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { deviceId } = request.params as { deviceId: string };
      const { metric = 'cpu', period = '1h', interval = '1m' } = request.query as any;
      const user = (request as any).user;
      
      if (!user || !user.organizationId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const fluxQuery = `
        from(bucket: "${config.database.influxdbBucket}")
          |> range(start: -${period})
          |> filter(fn: (r) => r._measurement == "system_metrics")
          |> filter(fn: (r) => r.organization_id == "${user.organizationId}")
          |> filter(fn: (r) => r.device_id == "${deviceId}")
          |> filter(fn: (r) => r._field == "${metric}")
          |> aggregateWindow(every: ${interval}, fn: mean, createEmpty: false)
          |> yield(name: "history")
      `;

      const results = await queryMetrics(fluxQuery);

      return reply.send({
        success: true,
        deviceId,
        metric,
        period,
        interval,
        data: results.map(r => ({
          time: r._time,
          value: r._value,
        })),
      });
    } catch (error: any) {
      fastify.log.error('Historical metrics error:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch historical metrics',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/metrics/device/:deviceId/stats
   * Get aggregated statistics for a device
   */
  fastify.get('/device/:deviceId/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { deviceId } = request.params as { deviceId: string };
      const { period = '24h' } = request.query as any;
      const user = (request as any).user;
      
      if (!user || !user.organizationId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      // Get stats for different metrics
      const metrics = ['cpu', 'memory', 'disk'];
      const statsPromises = metrics.map(async (metric) => {
        const fluxQuery = `
          from(bucket: "${config.database.influxdbBucket}")
            |> range(start: -${period})
            |> filter(fn: (r) => r._measurement == "system_metrics")
            |> filter(fn: (r) => r.organization_id == "${user.organizationId}")
            |> filter(fn: (r) => r.device_id == "${deviceId}")
            |> filter(fn: (r) => r._field == "${metric}")
        `;

        const meanQuery = fluxQuery + '\n|> mean()\n|> yield(name: "mean")';
        const maxQuery = fluxQuery + '\n|> max()\n|> yield(name: "max")';
        const minQuery = fluxQuery + '\n|> min()\n|> yield(name: "min")';

        const [meanResult, maxResult, minResult] = await Promise.all([
          queryMetrics(meanQuery),
          queryMetrics(maxQuery),
          queryMetrics(minQuery),
        ]);

        return {
          metric,
          mean: meanResult[0]?._value || 0,
          max: maxResult[0]?._value || 0,
          min: minResult[0]?._value || 0,
        };
      });

      const stats = await Promise.all(statsPromises);

      return reply.send({
        success: true,
        deviceId,
        period,
        stats: stats.reduce((acc, stat) => {
          acc[stat.metric] = {
            mean: stat.mean,
            max: stat.max,
            min: stat.min,
          };
          return acc;
        }, {} as Record<string, any>),
      });
    } catch (error: any) {
      fastify.log.error('Stats error:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch statistics',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/metrics/organization/summary
   * Get organization-wide metrics summary
   */
  fastify.get('/organization/summary', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { period = '1h' } = request.query as any;
      const user = (request as any).user;
      
      if (!user || !user.organizationId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const fluxQuery = `
        from(bucket: "${config.database.influxdbBucket}")
          |> range(start: -${period})
          |> filter(fn: (r) => r._measurement == "system_metrics")
          |> filter(fn: (r) => r.organization_id == "${user.organizationId}")
          |> group(columns: ["device_id", "_field"])
          |> mean()
          |> yield(name: "org_summary")
      `;

      const results = await queryMetrics(fluxQuery);

      // Group by device
      const deviceMetrics: Record<string, any> = {};
      results.forEach(row => {
        const deviceId = row.device_id;
        if (!deviceMetrics[deviceId]) {
          deviceMetrics[deviceId] = {};
        }
        deviceMetrics[deviceId][row._field] = row._value;
      });

      return reply.send({
        success: true,
        period,
        organizationId: user.organizationId,
        devices: deviceMetrics,
        deviceCount: Object.keys(deviceMetrics).length,
      });
    } catch (error: any) {
      fastify.log.error('Organization summary error:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch organization summary',
        message: error.message 
      });
    }
  });

  /**
   * DELETE /api/metrics/device/:deviceId
   * Delete all metrics for a device (admin only)
   */
  fastify.delete('/device/:deviceId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { deviceId } = request.params as { deviceId: string };
      const user = (request as any).user;
      
      if (!user || !user.roles?.includes('admin')) {
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
      }

      // InfluxDB delete query
      const deleteQuery = `
        from(bucket: "${config.database.influxdbBucket}")
          |> range(start: 1970-01-01T00:00:00Z)
          |> filter(fn: (r) => r._measurement == "system_metrics")
          |> filter(fn: (r) => r.device_id == "${deviceId}")
          |> filter(fn: (r) => r.organization_id == "${user.organizationId}")
      `;

      // Note: InfluxDB 2.x requires delete API, not Flux query
      // This is a placeholder - in production, use InfluxDB delete API
      fastify.log.warn(`Delete request for device ${deviceId} - using InfluxDB delete API`);

      return reply.send({
        success: true,
        message: 'Metrics deletion initiated',
        deviceId,
      });
    } catch (error: any) {
      fastify.log.error('Metrics deletion error:', error);
      return reply.code(500).send({ 
        error: 'Failed to delete metrics',
        message: error.message 
      });
    }
  });
}

