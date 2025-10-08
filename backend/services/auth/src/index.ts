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
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'ninjait',
  password: process.env.POSTGRES_PASSWORD || 'changeme',
  database: process.env.POSTGRES_DB || 'ninjait_dev',
});

// Redis connection for token blacklist
const redis = new Redis({
  host: process.env.DRAGONFLY_HOST || 'localhost',
  port: parseInt(process.env.DRAGONFLY_PORT || '6379'),
});

// Validation schemas
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  organizationName: z.string().min(2),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Types
interface User {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: string;
  passwordHash: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
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
    const orgResult = await client.query<Organization>(
      `INSERT INTO organizations (name, slug, plan, status)
       VALUES ($1, $2, 'trial', 'active')
       RETURNING id, name, slug`,
      [data.organizationName, slug]
    );
    
    const organization = orgResult.rows[0];
    
    // Hash password
    const passwordHash = await hashPassword(data.password);
    
    // Create user (first user is admin)
    const userResult = await client.query<User>(
      `INSERT INTO users (organization_id, email, password_hash, full_name, role, email_verified_at)
       VALUES ($1, $2, $3, $4, 'admin', CURRENT_TIMESTAMP)
       RETURNING id, organization_id, email, full_name, role`,
      [organization.id, data.email, passwordHash, data.fullName]
    );
    
    const user = userResult.rows[0];
    
    // Log audit trail
    await client.query(
      `INSERT INTO audit_logs (organization_id, user_id, action, resource_type, resource_id)
       VALUES ($1, $2, 'user_registered', 'user', $3)`,
      [organization.id, user.id, user.id]
    );
    
    await client.query('COMMIT');
    
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
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
  const result = await pool.query<User>(
    `SELECT u.id, u.organization_id, u.email, u.full_name, u.role, u.password_hash
     FROM users u
     WHERE u.email = $1 AND u.deleted_at IS NULL AND u.status = 'active'`,
    [data.email]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }
  
  const user = result.rows[0];
  
  // Verify password
  const isValid = await verifyPassword(data.password, user.passwordHash);
  
  if (!isValid) {
    throw new Error('Invalid email or password');
  }
  
  // Update last login
  await pool.query(
    `UPDATE users 
     SET last_login_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [user.id]
  );
  
  // Log audit trail
  await pool.query(
    `INSERT INTO audit_logs (organization_id, user_id, action)
     VALUES ($1, $2, 'user_login')`,
    [user.organizationId, user.id]
  );
  
  return {
    id: user.id,
    organizationId: user.organizationId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const result = await pool.query<User>(
    `SELECT u.id, u.organization_id, u.email, u.full_name, u.role,
            o.name as organization_name, o.slug as organization_slug
     FROM users u
     JOIN organizations o ON u.organization_id = o.id
     WHERE u.id = $1 AND u.deleted_at IS NULL`,
    [userId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  const user = result.rows[0];
  
  return {
    id: user.id,
    organizationId: user.organizationId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    organization: {
      name: user.organizationName,
      slug: user.organizationSlug,
    },
  };
}

/**
 * Store refresh token
 */
export async function storeRefreshToken(userId: string, token: string, expiresIn: number) {
  const expiresAt = new Date(Date.now() + expiresIn);
  
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(token: string) {
  const result = await pool.query(
    `SELECT user_id, expires_at
     FROM refresh_tokens
     WHERE token = $1 AND revoked_at IS NULL`,
    [token]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Invalid refresh token');
  }
  
  const tokenData = result.rows[0];
  
  if (new Date(tokenData.expires_at) < new Date()) {
    throw new Error('Refresh token expired');
  }
  
  return tokenData.user_id;
}

/**
 * Revoke refresh token
 */
export async function revokeRefreshToken(token: string) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP
     WHERE token = $1`,
    [token]
  );
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
 * Verify user has required role
 */
export function hasRole(userRole: string, requiredRole: string): boolean {
  const roles = ['admin', 'tech', 'user'];
  const userRoleIndex = roles.indexOf(userRole);
  const requiredRoleIndex = roles.indexOf(requiredRole);
  
  // Admin has access to everything, tech has access to tech and user, user only to user
  return userRoleIndex <= requiredRoleIndex;
}

// Export validation schemas
export { RegisterSchema, LoginSchema };

console.log('✅ Authentication Service Module Loaded');

