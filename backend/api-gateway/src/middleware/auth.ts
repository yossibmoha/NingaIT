/**
 * Authentication Middleware
 * Protects routes and checks permissions
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { isTokenBlacklisted, hasRole } from '../services/auth.service';

/**
 * Authenticate user - verifies JWT token
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verify JWT (handled by @fastify/jwt plugin)
    await request.jwtVerify();
    
    // Check if token is blacklisted
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (token && await isTokenBlacklisted(token)) {
      return reply.code(401).send({
        error: 'Token has been revoked',
      });
    }
  } catch (err) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Authorize user - checks role permissions
 */
export function authorize(requiredRole: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    
    if (!user) {
      return reply.code(401).send({
        error: 'Unauthorized',
      });
    }
    
    if (!hasRole(user.role, requiredRole)) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: `Requires ${requiredRole} role or higher`,
      });
    }
  };
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    // Continue without authentication
  }
}

