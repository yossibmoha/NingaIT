"use strict";
/**
 * NinjaIT Authentication Service
 * Handles user authentication, JWT tokens, and RBAC
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.RegisterSchema = void 0;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.register = register;
exports.login = login;
exports.getUserById = getUserById;
exports.blacklistToken = blacklistToken;
exports.isTokenBlacklisted = isTokenBlacklisted;
exports.hasRole = hasRole;
exports.closeConnections = closeConnections;
const pg_1 = require("pg");
const ioredis_1 = __importDefault(require("ioredis"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
// Database connection
const pool = new pg_1.Pool({
    connectionString: process.env.POSTGRES_URL || 'postgresql://ninjait:changeme@localhost:5432/ninjait_dev',
});
// Redis connection for token blacklist
const redis = new ioredis_1.default(process.env.DRAGONFLY_URL || 'redis://localhost:6379');
// Validation schemas
const RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    organizationName: zod_1.z.string().min(2),
});
exports.RegisterSchema = RegisterSchema;
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.LoginSchema = LoginSchema;
/**
 * Hash password using bcrypt
 */
async function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt_1.default.hash(password, saltRounds);
}
/**
 * Verify password against hash
 */
async function verifyPassword(password, hash) {
    return bcrypt_1.default.compare(password, hash);
}
/**
 * Generate organization slug from name
 */
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
/**
 * Register new user and organization
 */
async function register(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Check if email already exists
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [data.email]);
        if (existingUser.rows.length > 0) {
            throw new Error('Email already registered');
        }
        // Create organization
        const slug = generateSlug(data.organizationName);
        const orgResult = await client.query(`INSERT INTO organizations (name, slug)
       VALUES ($1, $2)
       RETURNING *`, [data.organizationName, slug]);
        const organization = orgResult.rows[0];
        // Hash password
        const passwordHash = await hashPassword(data.password);
        // Create user
        const userResult = await client.query(`INSERT INTO users (organization_id, email, password_hash, first_name, last_name, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING *`, [organization.id, data.email, passwordHash, data.firstName, data.lastName]);
        const user = userResult.rows[0];
        // Create admin role for organization
        const roleResult = await client.query(`INSERT INTO roles (organization_id, name, permissions)
       VALUES ($1, 'admin', '{"all": true}'::jsonb)
       RETURNING id`, [organization.id]);
        // Assign admin role to user
        await client.query(`INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)`, [user.id, roleResult.rows[0].id]);
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
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
/**
 * Login user and return user data
 */
async function login(data) {
    const result = await pool.query(`SELECT *
     FROM users
     WHERE email = $1 AND is_active = TRUE`, [data.email]);
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
    await pool.query(`UPDATE users 
     SET last_login = CURRENT_TIMESTAMP
     WHERE id = $1`, [user.id]);
    // Get user's roles
    const rolesResult = await pool.query(`SELECT r.name 
     FROM roles r
     JOIN user_roles ur ON r.id = ur.role_id
     WHERE ur.user_id = $1`, [user.id]);
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
async function getUserById(userId) {
    const result = await pool.query(`SELECT u.*, o.name as organization_name, o.slug as organization_slug
     FROM users u
     JOIN organizations o ON u.organization_id = o.id
     WHERE u.id = $1 AND u.is_active = TRUE`, [userId]);
    if (result.rows.length === 0) {
        throw new Error('User not found');
    }
    const user = result.rows[0];
    // Get user's roles
    const rolesResult = await pool.query(`SELECT r.name, r.permissions 
     FROM roles r
     JOIN user_roles ur ON r.id = ur.role_id
     WHERE ur.user_id = $1`, [userId]);
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
 * Blacklist access token (for logout)
 */
async function blacklistToken(token, expiresIn) {
    // Store in Redis with expiration
    await redis.setex(`blacklist:${token}`, Math.ceil(expiresIn / 1000), '1');
}
/**
 * Check if token is blacklisted
 */
async function isTokenBlacklisted(token) {
    const result = await redis.get(`blacklist:${token}`);
    return result !== null;
}
/**
 * Verify user has required role
 */
function hasRole(userRoles, requiredRole) {
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
async function closeConnections() {
    await pool.end();
    await redis.quit();
}
console.log('✅ Authentication Service Module Loaded');
//# sourceMappingURL=index.js.map