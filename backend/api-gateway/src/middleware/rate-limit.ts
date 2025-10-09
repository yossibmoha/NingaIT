/**
 * Rate Limiting Middleware
 * Uses Dragonfly (Redis) for distributed rate limiting
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { getDragonflyClient } from '../database/connection';

export interface RateLimitOptions {
  max: number; // Maximum requests
  window: number; // Time window in seconds
  keyPrefix?: string;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (request: FastifyRequest) => string;
  handler?: (request: FastifyRequest, reply: FastifyReply) => void;
}

/**
 * Default key generator based on IP or user ID
 */
function defaultKeyGenerator(request: FastifyRequest): string {
  // Use user ID if authenticated
  if ((request as any).user) {
    return `user:${(request as any).user.id}`;
  }
  
  // Otherwise use IP address
  const ip = request.headers['x-forwarded-for'] || 
              request.headers['x-real-ip'] || 
              request.ip;
  return `ip:${ip}`;
}

/**
 * Rate limiting middleware factory
 */
export function rateLimitMiddleware(options: RateLimitOptions) {
  const {
    max,
    window,
    keyPrefix = 'ratelimit',
    skipFailedRequests = false,
    skipSuccessfulRequests = false,
    keyGenerator = defaultKeyGenerator,
    handler,
  } = options;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const client = getDragonflyClient();
    const identifier = keyGenerator(request);
    const key = `${keyPrefix}:${identifier}`;

    try {
      // Get current count
      const current = await client.get(key);
      const count = current ? parseInt(current, 10) : 0;

      // Check if limit exceeded
      if (count >= max) {
        reply.header('X-RateLimit-Limit', max);
        reply.header('X-RateLimit-Remaining', 0);
        reply.header('X-RateLimit-Reset', Date.now() + (window * 1000));
        reply.header('Retry-After', window);

        if (handler) {
          return handler(request, reply);
        }

        return reply.code(429).send({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${window} seconds.`,
          limit: max,
          window: `${window}s`,
        });
      }

      // Increment counter
      const multi = client.multi();
      multi.incr(key);
      
      // Set expiry only if this is the first request in the window
      if (count === 0) {
        multi.expire(key, window);
      }
      
      await multi.exec();

      // Set rate limit headers
      reply.header('X-RateLimit-Limit', max);
      reply.header('X-RateLimit-Remaining', Math.max(0, max - count - 1));
      reply.header('X-RateLimit-Reset', Date.now() + (window * 1000));

      // Hook to decrement on failed/successful requests
      if (skipFailedRequests || skipSuccessfulRequests) {
        reply.addHook('onSend', async (req, rep) => {
          const shouldSkip = 
            (skipFailedRequests && rep.statusCode >= 400) ||
            (skipSuccessfulRequests && rep.statusCode < 400);

          if (shouldSkip) {
            await client.decr(key);
          }
        });
      }
    } catch (error) {
      request.log.error('Rate limit error:', error);
      // On error, allow the request to proceed
    }
  };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  // Very strict - for sensitive operations
  strict: {
    max: 5,
    window: 60, // 5 requests per minute
  },
  
  // Standard - for normal API usage
  standard: {
    max: 100,
    window: 60, // 100 requests per minute
  },
  
  // Generous - for internal or trusted users
  generous: {
    max: 1000,
    window: 60, // 1000 requests per minute
  },

  // Auth - for authentication endpoints
  auth: {
    max: 10,
    window: 300, // 10 requests per 5 minutes
  },

  // Heavy - for resource-intensive operations
  heavy: {
    max: 10,
    window: 60, // 10 requests per minute
  },
};

/**
 * Reset rate limit for a specific key
 */
export async function resetRateLimit(identifier: string, keyPrefix = 'ratelimit'): Promise<void> {
  const client = getDragonflyClient();
  const key = `${keyPrefix}:${identifier}`;
  await client.del(key);
}

/**
 * Get current rate limit status
 */
export async function getRateLimitStatus(
  identifier: string,
  keyPrefix = 'ratelimit'
): Promise<{ count: number; ttl: number }> {
  const client = getDragonflyClient();
  const key = `${keyPrefix}:${identifier}`;
  
  const [count, ttl] = await Promise.all([
    client.get(key),
    client.ttl(key),
  ]);

  return {
    count: count ? parseInt(count, 10) : 0,
    ttl: ttl || 0,
  };
}

