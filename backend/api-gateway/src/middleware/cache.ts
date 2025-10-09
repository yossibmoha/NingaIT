/**
 * Cache Middleware
 * Provides HTTP caching using Dragonfly (Redis-compatible)
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { cacheGet, cacheSet } from '../database/connection';
import crypto from 'crypto';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 300 = 5 minutes)
  keyPrefix?: string;
  varyBy?: string[]; // Headers or query params to include in cache key
  skipCache?: (request: FastifyRequest) => boolean;
}

/**
 * Generate cache key from request
 */
function generateCacheKey(
  request: FastifyRequest,
  options: CacheOptions
): string {
  const { keyPrefix = 'cache', varyBy = [] } = options;
  
  const parts = [
    keyPrefix,
    request.method,
    request.url,
  ];

  // Add vary-by parameters
  varyBy.forEach(key => {
    if (request.query && (request.query as any)[key]) {
      parts.push(`${key}:${(request.query as any)[key]}`);
    }
    if (request.headers && request.headers[key]) {
      parts.push(`${key}:${request.headers[key]}`);
    }
  });

  // Add user context if authenticated
  if ((request as any).user) {
    parts.push(`user:${(request as any).user.id}`);
  }

  // Create hash for cache key
  const keyString = parts.join('|');
  return crypto.createHash('md5').update(keyString).digest('hex');
}

/**
 * Cache middleware factory
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const { ttl = 300, skipCache } = options;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip cache for non-GET requests
    if (request.method !== 'GET') {
      return;
    }

    // Skip cache if custom condition
    if (skipCache && skipCache(request)) {
      return;
    }

    const cacheKey = generateCacheKey(request, options);

    try {
      // Try to get from cache
      const cached = await cacheGet<any>(cacheKey);

      if (cached) {
        reply.header('X-Cache', 'HIT');
        reply.header('X-Cache-Key', cacheKey);
        reply.send(cached);
        return reply;
      }

      reply.header('X-Cache', 'MISS');
      reply.header('X-Cache-Key', cacheKey);

      // Intercept the response to cache it
      const originalSend = reply.send.bind(reply);
      reply.send = function (payload: any) {
        // Only cache successful responses
        if (reply.statusCode === 200) {
          cacheSet(cacheKey, payload, ttl).catch(err => {
            request.log.error('Cache set error:', err);
          });
        }
        return originalSend(payload);
      };
    } catch (error) {
      request.log.error('Cache middleware error:', error);
      // Continue without cache on error
    }
  };
}

/**
 * Cache invalidation helper
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const { cacheClear } = await import('../database/connection');
  await cacheClear(pattern);
}

