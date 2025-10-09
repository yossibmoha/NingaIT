/**
 * Session Management Service
 * Uses Dragonfly for fast, distributed session storage
 */

import { getDragonflyClient } from '../database/connection';
import crypto from 'crypto';

export interface SessionData {
  userId: string;
  organizationId: string;
  email: string;
  roles: string[];
  createdAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: any;
}

export interface SessionOptions {
  ttl?: number; // Session TTL in seconds (default: 24 hours)
  extendOnActivity?: boolean; // Extend TTL on each activity
}

const DEFAULT_SESSION_TTL = 24 * 60 * 60; // 24 hours
const SESSION_PREFIX = 'session';
const USER_SESSIONS_PREFIX = 'user_sessions';

/**
 * Generate a secure session ID
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session
 */
export async function createSession(
  data: Omit<SessionData, 'createdAt' | 'lastActivity'>,
  options: SessionOptions = {}
): Promise<string> {
  const client = getDragonflyClient();
  const sessionId = generateSessionId();
  const ttl = options.ttl || DEFAULT_SESSION_TTL;

  const sessionData: SessionData = {
    ...data,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };

  // Store session
  const key = `${SESSION_PREFIX}:${sessionId}`;
  await client.setex(key, ttl, JSON.stringify(sessionData));

  // Track session for user
  const userSessionsKey = `${USER_SESSIONS_PREFIX}:${data.userId}`;
  await client.sadd(userSessionsKey, sessionId);
  await client.expire(userSessionsKey, ttl);

  return sessionId;
}

/**
 * Get session data
 */
export async function getSession(
  sessionId: string,
  options: SessionOptions = {}
): Promise<SessionData | null> {
  const client = getDragonflyClient();
  const key = `${SESSION_PREFIX}:${sessionId}`;

  const data = await client.get(key);
  if (!data) {
    return null;
  }

  const sessionData: SessionData = JSON.parse(data);

  // Extend session TTL on activity
  if (options.extendOnActivity !== false) {
    sessionData.lastActivity = Date.now();
    const ttl = options.ttl || DEFAULT_SESSION_TTL;
    await client.setex(key, ttl, JSON.stringify(sessionData));
  }

  return sessionData;
}

/**
 * Update session data
 */
export async function updateSession(
  sessionId: string,
  updates: Partial<SessionData>,
  options: SessionOptions = {}
): Promise<void> {
  const client = getDragonflyClient();
  const key = `${SESSION_PREFIX}:${sessionId}`;

  const existing = await getSession(sessionId, { extendOnActivity: false });
  if (!existing) {
    throw new Error('Session not found');
  }

  const updatedData: SessionData = {
    ...existing,
    ...updates,
    lastActivity: Date.now(),
  };

  const ttl = options.ttl || DEFAULT_SESSION_TTL;
  await client.setex(key, ttl, JSON.stringify(updatedData));
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const client = getDragonflyClient();
  
  // Get session to find user ID
  const sessionData = await getSession(sessionId, { extendOnActivity: false });
  
  // Delete session
  const key = `${SESSION_PREFIX}:${sessionId}`;
  await client.del(key);

  // Remove from user sessions
  if (sessionData) {
    const userSessionsKey = `${USER_SESSIONS_PREFIX}:${sessionData.userId}`;
    await client.srem(userSessionsKey, sessionId);
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<Array<SessionData & { sessionId: string }>> {
  const client = getDragonflyClient();
  const userSessionsKey = `${USER_SESSIONS_PREFIX}:${userId}`;

  const sessionIds = await client.smembers(userSessionsKey);
  
  const sessions = await Promise.all(
    sessionIds.map(async (sessionId) => {
      const data = await getSession(sessionId, { extendOnActivity: false });
      return data ? { ...data, sessionId } : null;
    })
  );

  return sessions.filter((s): s is SessionData & { sessionId: string } => s !== null);
}

/**
 * Delete all sessions for a user
 */
export async function deleteUserSessions(userId: string): Promise<number> {
  const sessions = await getUserSessions(userId);
  
  await Promise.all(
    sessions.map(session => deleteSession(session.sessionId))
  );

  return sessions.length;
}

/**
 * Check if session exists
 */
export async function sessionExists(sessionId: string): Promise<boolean> {
  const client = getDragonflyClient();
  const key = `${SESSION_PREFIX}:${sessionId}`;
  const exists = await client.exists(key);
  return exists === 1;
}

/**
 * Get session TTL (time to live in seconds)
 */
export async function getSessionTTL(sessionId: string): Promise<number> {
  const client = getDragonflyClient();
  const key = `${SESSION_PREFIX}:${sessionId}`;
  return await client.ttl(key);
}

/**
 * Extend session TTL
 */
export async function extendSession(
  sessionId: string,
  additionalSeconds: number
): Promise<void> {
  const client = getDragonflyClient();
  const key = `${SESSION_PREFIX}:${sessionId}`;
  
  const currentTTL = await client.ttl(key);
  if (currentTTL > 0) {
    await client.expire(key, currentTTL + additionalSeconds);
  }
}

/**
 * Get active session count for a user
 */
export async function getUserSessionCount(userId: string): Promise<number> {
  const client = getDragonflyClient();
  const userSessionsKey = `${USER_SESSIONS_PREFIX}:${userId}`;
  return await client.scard(userSessionsKey);
}

/**
 * Cleanup expired sessions for a user
 */
export async function cleanupUserSessions(userId: string): Promise<number> {
  const sessions = await getUserSessions(userId);
  const client = getDragonflyClient();
  let cleaned = 0;

  for (const session of sessions) {
    const key = `${SESSION_PREFIX}:${session.sessionId}`;
    const exists = await client.exists(key);
    
    if (exists === 0) {
      // Session expired, remove from user sessions
      const userSessionsKey = `${USER_SESSIONS_PREFIX}:${userId}`;
      await client.srem(userSessionsKey, session.sessionId);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get session statistics
 */
export async function getSessionStats(): Promise<{
  totalSessions: number;
  activeSessions: number;
}> {
  const client = getDragonflyClient();
  
  // Get all session keys
  const keys = await client.keys(`${SESSION_PREFIX}:*`);
  const totalSessions = keys.length;

  // Count active sessions (TTL > 5 minutes)
  let activeSessions = 0;
  for (const key of keys) {
    const ttl = await client.ttl(key);
    if (ttl > 300) { // More than 5 minutes
      activeSessions++;
    }
  }

  return {
    totalSessions,
    activeSessions,
  };
}

