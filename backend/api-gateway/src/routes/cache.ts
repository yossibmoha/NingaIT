/**
 * Cache Management API Routes
 * Provides endpoints for cache management, statistics, and administration
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDragonflyClient, cacheClear, cacheGet, cacheSet, cacheDelete } from '../database/connection';
import { getSessionStats, getUserSessions, deleteUserSessions, deleteSession } from '../services/session.service';
import { getRateLimitStatus, resetRateLimit } from '../middleware/rate-limit';

/**
 * Register cache management routes
 */
export async function cacheRoutes(fastify: FastifyInstance) {
  
  /**
   * GET /api/cache/stats
   * Get cache statistics
   */
  fastify.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      // Only admins can view cache stats
      if (!user || !user.roles?.includes('admin')) {
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
      }

      const client = getDragonflyClient();
      const info = await client.info();
      
      // Parse Redis INFO output
      const stats: Record<string, any> = {};
      const sections = info.split('\r\n\r\n');
      
      sections.forEach(section => {
        const lines = section.split('\r\n');
        if (lines[0].startsWith('#')) {
          const sectionName = lines[0].replace('# ', '');
          stats[sectionName] = {};
          
          lines.slice(1).forEach(line => {
            if (line && line.includes(':')) {
              const [key, value] = line.split(':');
              stats[sectionName][key] = value;
            }
          });
        }
      });

      // Get session statistics
      const sessionStats = await getSessionStats();

      // Get memory usage
      const memoryUsed = stats['Memory']?.used_memory_human || 'N/A';
      const memoryPeak = stats['Memory']?.used_memory_peak_human || 'N/A';
      
      // Get key statistics
      const totalKeys = await client.dbsize();

      return reply.send({
        success: true,
        stats: {
          memory: {
            used: memoryUsed,
            peak: memoryPeak,
          },
          keys: {
            total: totalKeys,
          },
          sessions: sessionStats,
          connected_clients: stats['Clients']?.connected_clients || 0,
          uptime_seconds: stats['Server']?.uptime_in_seconds || 0,
          version: stats['Server']?.redis_version || 'unknown',
        },
      });
    } catch (error: any) {
      fastify.log.error('Cache stats error:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch cache statistics',
        message: error.message 
      });
    }
  });

  /**
   * POST /api/cache/clear
   * Clear cache by pattern
   */
  fastify.post('/clear', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      // Only admins can clear cache
      if (!user || !user.roles?.includes('admin')) {
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
      }

      const { pattern = '*' } = request.body as any;

      // Prevent clearing all keys accidentally
      if (pattern === '*') {
        return reply.code(400).send({ 
          error: 'Invalid pattern',
          message: 'Use a specific pattern to clear cache. Clearing all keys is not allowed via API.'
        });
      }

      await cacheClear(pattern);

      return reply.send({
        success: true,
        message: `Cache cleared for pattern: ${pattern}`,
        pattern,
      });
    } catch (error: any) {
      fastify.log.error('Cache clear error:', error);
      return reply.code(500).send({ 
        error: 'Failed to clear cache',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/cache/keys
   * List cache keys by pattern
   */
  fastify.get('/keys', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      // Only admins can view cache keys
      if (!user || !user.roles?.includes('admin')) {
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
      }

      const { pattern = 'cache:*', limit = 100 } = request.query as any;
      const client = getDragonflyClient();

      const keys = await client.keys(pattern);
      const limitedKeys = keys.slice(0, parseInt(limit));

      // Get TTL for each key
      const keysWithTTL = await Promise.all(
        limitedKeys.map(async (key) => {
          const ttl = await client.ttl(key);
          return { key, ttl };
        })
      );

      return reply.send({
        success: true,
        pattern,
        count: keys.length,
        limit: parseInt(limit),
        keys: keysWithTTL,
      });
    } catch (error: any) {
      fastify.log.error('Cache keys error:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch cache keys',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/cache/get/:key
   * Get cached value by key
   */
  fastify.get('/get/:key', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      // Only admins can view cache values
      if (!user || !user.roles?.includes('admin')) {
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
      }

      const { key } = request.params as { key: string };
      const value = await cacheGet(key);

      if (value === null) {
        return reply.code(404).send({ 
          error: 'Not found',
          message: `Key '${key}' not found in cache` 
        });
      }

      const client = getDragonflyClient();
      const ttl = await client.ttl(key);

      return reply.send({
        success: true,
        key,
        value,
        ttl,
      });
    } catch (error: any) {
      fastify.log.error('Cache get error:', error);
      return reply.code(500).send({ 
        error: 'Failed to get cache value',
        message: error.message 
      });
    }
  });

  /**
   * DELETE /api/cache/delete/:key
   * Delete a cache key
   */
  fastify.delete('/delete/:key', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      // Only admins can delete cache keys
      if (!user || !user.roles?.includes('admin')) {
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
      }

      const { key } = request.params as { key: string };
      await cacheDelete(key);

      return reply.send({
        success: true,
        message: `Key '${key}' deleted from cache`,
        key,
      });
    } catch (error: any) {
      fastify.log.error('Cache delete error:', error);
      return reply.code(500).send({ 
        error: 'Failed to delete cache key',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/cache/sessions
   * Get all active sessions (admin only)
   */
  fastify.get('/sessions', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      // Only admins can view all sessions
      if (!user || !user.roles?.includes('admin')) {
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
      }

      const stats = await getSessionStats();

      return reply.send({
        success: true,
        ...stats,
      });
    } catch (error: any) {
      fastify.log.error('Sessions error:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch sessions',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/cache/sessions/user/:userId
   * Get sessions for a specific user
   */
  fastify.get('/sessions/user/:userId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { userId } = request.params as { userId: string };
      
      // Users can only view their own sessions, admins can view any
      if (!user || (user.id !== userId && !user.roles?.includes('admin'))) {
        return reply.code(403).send({ error: 'Forbidden' });
      }

      const sessions = await getUserSessions(userId);

      return reply.send({
        success: true,
        userId,
        count: sessions.length,
        sessions: sessions.map(s => ({
          sessionId: s.sessionId,
          createdAt: s.createdAt,
          lastActivity: s.lastActivity,
          ipAddress: s.ipAddress,
          userAgent: s.userAgent,
        })),
      });
    } catch (error: any) {
      fastify.log.error('User sessions error:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch user sessions',
        message: error.message 
      });
    }
  });

  /**
   * DELETE /api/cache/sessions/user/:userId
   * Delete all sessions for a user
   */
  fastify.delete('/sessions/user/:userId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { userId } = request.params as { userId: string };
      
      // Users can delete their own sessions, admins can delete any
      if (!user || (user.id !== userId && !user.roles?.includes('admin'))) {
        return reply.code(403).send({ error: 'Forbidden' });
      }

      const count = await deleteUserSessions(userId);

      return reply.send({
        success: true,
        message: `Deleted ${count} session(s) for user ${userId}`,
        userId,
        deletedCount: count,
      });
    } catch (error: any) {
      fastify.log.error('Delete user sessions error:', error);
      return reply.code(500).send({ 
        error: 'Failed to delete user sessions',
        message: error.message 
      });
    }
  });

  /**
   * DELETE /api/cache/sessions/:sessionId
   * Delete a specific session
   */
  fastify.delete('/sessions/:sessionId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { sessionId } = request.params as { sessionId: string };
      
      // Only admins or session owners can delete sessions
      // TODO: Verify session ownership
      if (!user) {
        return reply.code(403).send({ error: 'Forbidden' });
      }

      await deleteSession(sessionId);

      return reply.send({
        success: true,
        message: `Session ${sessionId} deleted`,
        sessionId,
      });
    } catch (error: any) {
      fastify.log.error('Delete session error:', error);
      return reply.code(500).send({ 
        error: 'Failed to delete session',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/cache/ratelimit/:identifier
   * Get rate limit status for an identifier
   */
  fastify.get('/ratelimit/:identifier', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      // Only admins can view rate limits
      if (!user || !user.roles?.includes('admin')) {
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
      }

      const { identifier } = request.params as { identifier: string };
      const status = await getRateLimitStatus(identifier);

      return reply.send({
        success: true,
        identifier,
        ...status,
      });
    } catch (error: any) {
      fastify.log.error('Rate limit status error:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch rate limit status',
        message: error.message 
      });
    }
  });

  /**
   * DELETE /api/cache/ratelimit/:identifier
   * Reset rate limit for an identifier
   */
  fastify.delete('/ratelimit/:identifier', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      // Only admins can reset rate limits
      if (!user || !user.roles?.includes('admin')) {
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
      }

      const { identifier } = request.params as { identifier: string };
      await resetRateLimit(identifier);

      return reply.send({
        success: true,
        message: `Rate limit reset for ${identifier}`,
        identifier,
      });
    } catch (error: any) {
      fastify.log.error('Rate limit reset error:', error);
      return reply.code(500).send({ 
        error: 'Failed to reset rate limit',
        message: error.message 
      });
    }
  });
}

