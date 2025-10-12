/**
 * Authentication Middleware
 * Verifies JWT tokens and checks blacklist
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { isTokenBlacklisted } from '../services/auth.service';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    sub: string;
    email: string;
    organizationId: string;
    roles: string[];
  };
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Get token from header
    const authorization = request.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }
    
    const token = authorization.replace('Bearer ', '');
    
    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    
    if (isBlacklisted) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Token has been revoked',
      });
    }
    
    // Verify JWT token (Fastify JWT plugin)
    try {
      const decoded = await request.jwtVerify();
      request.user = decoded as any;
    } catch (error) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }
  } catch (error: any) {
    return reply.code(500).send({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

/**
 * Role-based access control middleware
 */
export function requireRole(requiredRole: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    
    if (!user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }
    
    const userRoles = user.roles || [];
    
    // Admin has access to everything
    if (userRoles.includes('admin')) {
      return;
    }
    
    // Check if user has required role
    if (!userRoles.includes(requiredRole)) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: `Role '${requiredRole}' required`,
      });
    }
  };
}

/**
 * Organization access control middleware
 */
export function requireOrganization() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    
    if (!user || !user.organizationId) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Organization required',
      });
    }
  };
}
