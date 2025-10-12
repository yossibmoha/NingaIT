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
  getUserByEmail,
  updatePassword,
  hashPassword,
  verifyPassword,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  storePasswordResetToken,
  verifyPasswordResetToken,
  revokePasswordResetToken,
  blacklistToken,
  isTokenBlacklisted,
  hasRole,
  generateTokenPayload,
  getTokenExpiration,
  RegisterSchema,
  LoginSchema,
} = AuthService;

// Note: generateTokenPayload and getTokenExpiration are now exported from AuthService above

