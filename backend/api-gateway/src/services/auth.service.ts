/**
 * Authentication Service Integration
 * Integrates auth service with API Gateway
 */

import { Pool } from 'pg';
import Redis from 'ioredis';
import { config } from '../config';
import * as AuthService from '../../../services/auth/src/index';

// Re-export auth service functions
export const {
  register,
  login,
  getUserById,
  hashPassword,
  verifyPassword,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  blacklistToken,
  isTokenBlacklisted,
  hasRole,
  RegisterSchema,
  LoginSchema,
} = AuthService;

// JWT Token generation
export function generateTokenPayload(user: any) {
  return {
    sub: user.id,
    organizationId: user.organizationId,
    email: user.email,
    role: user.role,
  };
}

// Generate token expiration times
export function getTokenExpiration() {
  return {
    accessToken: '15m',  // 15 minutes
    refreshToken: '7d',  // 7 days
  };
}

