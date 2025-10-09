/**
 * Configuration management
 * Loads and validates environment variables
 */

import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

// Load .env file
loadEnv();

// Configuration schema with validation
const configSchema = z.object({
  app: z.object({
    name: z.string().default('NinjaIT'),
    version: z.string().default('0.1.0'),
    env: z.enum(['development', 'staging', 'production']).default('development'),
  }),
  server: z.object({
    port: z.number().int().min(1).max(65535).default(8000),
    host: z.string().default('0.0.0.0'),
  }),
  jwt: z.object({
    secret: z.string().min(32),
    expiresIn: z.string().default('15m'),
    refreshSecret: z.string().min(32),
    refreshExpiresIn: z.string().default('7d'),
  }),
  database: z.object({
    postgresUrl: z.string(),
    influxdbUrl: z.string(),
    influxdbToken: z.string(),
    influxdbOrg: z.string(),
    influxdbBucket: z.string(),
    dragonflyUrl: z.string(),
    clickhouseUrl: z.string().optional(),
    clickhouseUser: z.string().optional(),
    clickhousePassword: z.string().optional(),
    clickhouseDatabase: z.string().optional(),
    mongodbUrl: z.string().optional(),
    rabbitmqUrl: z.string().optional(),
  }),
  rateLimit: z.object({
    max: z.number().int().default(100),
    timeWindow: z.number().int().default(60000), // 1 minute
  }),
  cors: z.object({
    origin: z.string().default('http://localhost:3000'),
    credentials: z.boolean().default(true),
  }),
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    pretty: z.boolean().default(true),
  }),
});

// Parse and validate configuration
export const config = configSchema.parse({
  app: {
    name: process.env.APP_NAME || 'NinjaIT',
    version: process.env.APP_VERSION || '0.1.0',
    env: process.env.NODE_ENV || 'development',
  },
  server: {
    port: parseInt(process.env.API_PORT || '8000', 10),
    host: process.env.API_HOST || '0.0.0.0',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-key-in-production-min-32-chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'change-this-refresh-secret-in-production-min-32',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  database: {
    postgresUrl: process.env.POSTGRES_URL || 'postgresql://ninjait:changeme@localhost:5432/ninjait_dev',
    influxdbUrl: process.env.INFLUXDB_URL || 'http://localhost:8086',
    influxdbToken: process.env.INFLUXDB_TOKEN || 'dev-token-change-in-production',
    influxdbOrg: process.env.INFLUXDB_ORG || 'ninjait',
    influxdbBucket: process.env.INFLUXDB_BUCKET || 'metrics',
    dragonflyUrl: process.env.DRAGONFLY_URL || 'redis://localhost:6379',
    clickhouseUrl: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
    clickhouseUser: process.env.CLICKHOUSE_USER || 'default',
    clickhousePassword: process.env.CLICKHOUSE_PASSWORD || '',
    clickhouseDatabase: process.env.CLICKHOUSE_DATABASE || 'ninjait',
    mongodbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017/ninjait',
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
    pretty: process.env.NODE_ENV !== 'production',
  },
});

export type Config = z.infer<typeof configSchema>;

