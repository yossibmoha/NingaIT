/**
 * NinjaIT Authentication Service
 * Handles user authentication, JWT tokens, and RBAC
 */

import { Pool } from 'pg';
import Redis from 'ioredis';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://ninjait:changeme@localhost:5432/ninjait_dev',
});

// Redis connection for token blacklist
const redis = new Redis(process.env.DRAGONFLY_URL || 'redis://localhost:6379');

// Validation schemas
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  organizationName: z.string().min(2),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Types matching database schema
interface DbUser {
  id: string;
  organization_id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface DbOrganization {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate organization slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Register new user and organization
 */
export async function register(data: z.infer<typeof RegisterSchema>) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if email already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [data.email]
    );
    
    if (existingUser.rows.length > 0) {
      throw new Error('Email already registered');
    }
    
    // Create organization
    const slug = generateSlug(data.organizationName);
    const orgResult = await client.query<DbOrganization>(
      `INSERT INTO organizations (name, slug)
       VALUES ($1, $2)
       RETURNING *`,
      [data.organizationName, slug]
    );
    
    const organization = orgResult.rows[0];
    
    // Hash password
    const passwordHash = await hashPassword(data.password);
    
    // Create user
    const userResult = await client.query<DbUser>(
      `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING *`,
      [organization.id, data.email, passwordHash, data.firstName, data.lastName]
    );
    
    const user = userResult.rows[0];
    
    // Create admin role for organization
    const roleResult = await client.query(
      `INSERT INTO roles (organization_id, name, permissions)
       VALUES ($1, 'admin', '{"all": true}'::jsonb)
       RETURNING id`,
      [organization.id]
    );
    
    // Assign admin role to user
    await client.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)`,
      [user.id, roleResult.rows[0].id]
    );
    
    await client.query('COMMIT');
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organizationId: user.organization_id,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Login user and return user data
 */
export async function login(data: z.infer<typeof LoginSchema>) {
  const result = await pool.query<DbUser>(
    `SELECT *
     FROM users
     WHERE email = $1 AND is_active = TRUE`,
    [data.email]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }
  
  const user = result.rows[0];
  
  // Verify password
  const isValid = await verifyPassword(data.password, user.password_hash);
  
  if (!isValid) {
    throw new Error('Invalid email or password');
  }
  
  // Update last login
  await pool.query(
    `UPDATE users 
     SET last_login = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [user.id]
  );
  
  // Get user's roles
  const rolesResult = await pool.query(
    `SELECT r.name 
     FROM roles r
     JOIN user_roles ur ON r.id = ur.role_id
     WHERE ur.user_id = $1`,
    [user.id]
  );
  
  const roles = rolesResult.rows.map(r => r.name);
  
  return {
    id: user.id,
    organizationId: user.organization_id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: `${user.first_name} ${user.last_name}`,
    roles: roles,
    role: roles[0] || 'user', // Primary role for backward compatibility
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const result = await pool.query<DbUser & { organization_name: string; organization_slug: string }>(
    `SELECT u.*, o.name as organization_name, o.slug as organization_slug
     FROM users u
     JOIN organizations o ON u.organization_id = o.id
     WHERE u.id = $1 AND u.is_active = TRUE`,
    [userId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  const user = result.rows[0];
  
  // Get user's roles
  const rolesResult = await pool.query(
    `SELECT r.name, r.permissions 
     FROM roles r
     JOIN user_roles ur ON r.id = ur.role_id
     WHERE ur.user_id = $1`,
    [userId]
  );
  
  return {
    id: user.id,
    organizationId: user.organization_id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: `${user.first_name} ${user.last_name}`,
    roles: rolesResult.rows.map(r => r.name),
    organization: {
      name: user.organization_name,
      slug: user.organization_slug,
    },
  };
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const result = await pool.query<DbUser>(
    `SELECT * FROM users WHERE email = $1 AND is_active = TRUE`,
    [email]
  );
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  const user = result.rows[0];
  
  return {
    id: user.id,
    organizationId: user.organization_id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: `${user.first_name} ${user.last_name}`,
  };
}

/**
 * Update user password
 */
export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  
  await pool.query(
    `UPDATE users 
     SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [passwordHash, userId]
  );
}

/**
 * Store refresh token in Redis
 */
export async function storeRefreshToken(userId: string, refreshToken: string, expiresIn: number) {
  // Store refresh token with user ID mapping (expires in 7 days by default)
  await redis.setex(`refresh:${refreshToken}`, Math.ceil(expiresIn / 1000), userId);
}

/**
 * Store password reset token in Redis
 */
export async function storePasswordResetToken(userId: string, resetToken: string, expiresIn: number = 3600) {
  // Store reset token with user ID mapping (expires in 1 hour by default)
  await redis.setex(`reset:${resetToken}`, expiresIn, userId);
}

/**
 * Verify refresh token and return user ID
 */
export async function verifyRefreshToken(refreshToken: string): Promise<string> {
  const userId = await redis.get(`refresh:${refreshToken}`);
  
  if (!userId) {
    throw new Error('Invalid or expired refresh token');
  }
  
  return userId;
}

/**
 * Revoke refresh token
 */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await redis.del(`refresh:${refreshToken}`);
}

/**
 * Verify password reset token and return user ID
 */
export async function verifyPasswordResetToken(resetToken: string): Promise<string> {
  const userId = await redis.get(`reset:${resetToken}`);
  
  if (!userId) {
    throw new Error('Invalid or expired reset token');
  }
  
  return userId;
}

/**
 * Revoke password reset token
 */
export async function revokePasswordResetToken(resetToken: string): Promise<void> {
  await redis.del(`reset:${resetToken}`);
}

/**
 * Blacklist access token (for logout)
 */
export async function blacklistToken(token: string, expiresIn: number) {
  // Store in Redis with expiration
  await redis.setex(`blacklist:${token}`, Math.ceil(expiresIn / 1000), '1');
}

/**
 * Check if token is blacklisted
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const result = await redis.get(`blacklist:${token}`);
  return result !== null;
}

/**
 * Generate JWT token payload
 */
export function generateTokenPayload(user: any) {
  return {
    sub: user.id,
    email: user.email,
    organizationId: user.organizationId,
    roles: user.roles || [user.role || 'user'],
  };
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpiration(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 900; // Default 15 minutes
  }
  
  const [, value, unit] = match;
  const num = parseInt(value, 10);
  
  switch (unit) {
    case 's': return num;
    case 'm': return num * 60;
    case 'h': return num * 60 * 60;
    case 'd': return num * 24 * 60 * 60;
    default: return 900;
  }
}

/**
 * Verify user has required role
 */
export function hasRole(userRoles: string[], requiredRole: string): boolean {
  // Admin has access to everything
  if (userRoles.includes('admin')) {
    return true;
  }
  
  // Check if user has the required role
  return userRoles.includes(requiredRole);
}

/**
 * Close connections
 */
export async function closeConnections() {
  await pool.end();
  await redis.quit();
}

// Export validation schemas
export { RegisterSchema, LoginSchema };

// Export types
export type { DbUser, DbOrganization };

console.log('✅ Authentication Service Module Loaded');
