/**
 * NinjaIT Authentication Service
 * Handles user authentication, JWT tokens, and RBAC
 */
import { z } from 'zod';
declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    organizationName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
}>;
declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
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
export declare function hashPassword(password: string): Promise<string>;
/**
 * Verify password against hash
 */
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
/**
 * Register new user and organization
 */
export declare function register(data: z.infer<typeof RegisterSchema>): Promise<{
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        organizationId: string;
    };
    organization: {
        id: string;
        name: string;
        slug: string;
    };
}>;
/**
 * Login user and return user data
 */
export declare function login(data: z.infer<typeof LoginSchema>): Promise<{
    id: string;
    organizationId: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    roles: any[];
    role: any;
}>;
/**
 * Get user by ID
 */
export declare function getUserById(userId: string): Promise<{
    id: string;
    organizationId: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    roles: any[];
    organization: {
        name: string;
        slug: string;
    };
}>;
/**
 * Blacklist access token (for logout)
 */
export declare function blacklistToken(token: string, expiresIn: number): Promise<void>;
/**
 * Check if token is blacklisted
 */
export declare function isTokenBlacklisted(token: string): Promise<boolean>;
/**
 * Verify user has required role
 */
export declare function hasRole(userRoles: string[], requiredRole: string): boolean;
/**
 * Close connections
 */
export declare function closeConnections(): Promise<void>;
export { RegisterSchema, LoginSchema };
export type { DbUser, DbOrganization };
//# sourceMappingURL=index.d.ts.map