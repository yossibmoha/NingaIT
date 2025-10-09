/**
 * Database Connection Manager
 * Manages connections to PostgreSQL, InfluxDB, Dragonfly, ClickHouse, and MongoDB
 */

import { Pool, PoolClient } from 'pg';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import Redis from 'ioredis';
import { createClient, ClickHouseClient } from '@clickhouse/client';
import amqp, { Connection, Channel } from 'amqplib';
import { config } from '../config';

// PostgreSQL connection pool
let pgPool: Pool | null = null;

// InfluxDB client
let influxClient: InfluxDB | null = null;

// Dragonfly (Redis-compatible) client
let dragonflyClient: Redis | null = null;

// ClickHouse client
let clickhouseClient: ClickHouseClient | null = null;

// RabbitMQ connection and channel
let rabbitmqConnection: Connection | null = null;
let rabbitmqChannel: Channel | null = null;

/**
 * Initialize PostgreSQL connection
 */
export async function initializePostgreSQL(): Promise<Pool> {
  if (pgPool) {
    return pgPool;
  }

  pgPool = new Pool({
    connectionString: config.database.postgresUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test connection
  try {
    const client = await pgPool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }

  // Handle pool errors
  pgPool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err);
  });

  return pgPool;
}

/**
 * Get PostgreSQL pool
 */
export function getPostgreSQLPool(): Pool {
  if (!pgPool) {
    throw new Error('PostgreSQL pool not initialized. Call initializePostgreSQL() first.');
  }
  return pgPool;
}

/**
 * Execute PostgreSQL query with connection from pool
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getPostgreSQLPool();
  const result = await pool.query(text, params);
  return result.rows;
}

/**
 * Execute PostgreSQL transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPostgreSQLPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Initialize InfluxDB connection
 */
export function initializeInfluxDB(): InfluxDB {
  if (influxClient) {
    return influxClient;
  }

  influxClient = new InfluxDB({
    url: config.database.influxdbUrl,
    token: config.database.influxdbToken,
  });

  console.log('✅ InfluxDB client initialized');
  return influxClient;
}

/**
 * Get InfluxDB client
 */
export function getInfluxDBClient(): InfluxDB {
  if (!influxClient) {
    throw new Error('InfluxDB client not initialized. Call initializeInfluxDB() first.');
  }
  return influxClient;
}

/**
 * Write metrics to InfluxDB
 */
export async function writeMetrics(
  measurement: string,
  tags: Record<string, string>,
  fields: Record<string, number | string | boolean>,
  timestamp?: Date
): Promise<void> {
  const client = getInfluxDBClient();
  const writeApi = client.getWriteApi(
    config.database.influxdbOrg,
    config.database.influxdbBucket
  );

  const point = new Point(measurement)
    .timestamp(timestamp || new Date());

  // Add tags
  Object.entries(tags).forEach(([key, value]) => {
    point.tag(key, value);
  });

  // Add fields
  Object.entries(fields).forEach(([key, value]) => {
    if (typeof value === 'number') {
      point.floatField(key, value);
    } else if (typeof value === 'boolean') {
      point.booleanField(key, value);
    } else {
      point.stringField(key, value);
    }
  });

  writeApi.writePoint(point);
  await writeApi.close();
}

/**
 * Query metrics from InfluxDB
 */
export async function queryMetrics(
  fluxQuery: string
): Promise<any[]> {
  const client = getInfluxDBClient();
  const queryApi = client.getQueryApi(config.database.influxdbOrg);

  const results: any[] = [];
  
  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row: string[], tableMeta: any) {
        const o = tableMeta.toObject(row);
        results.push(o);
      },
      error(error: Error) {
        console.error('InfluxDB query error:', error);
        reject(error);
      },
      complete() {
        resolve(results);
      },
    });
  });
}

/**
 * Initialize Dragonfly (Redis-compatible) connection
 */
export function initializeDragonfly(): Redis {
  if (dragonflyClient) {
    return dragonflyClient;
  }

  dragonflyClient = new Redis(config.database.dragonflyUrl, {
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError: (err) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
  });

  dragonflyClient.on('connect', () => {
    console.log('✅ Dragonfly connected successfully');
  });

  dragonflyClient.on('error', (err) => {
    console.error('❌ Dragonfly connection error:', err);
  });

  return dragonflyClient;
}

/**
 * Get Dragonfly client
 */
export function getDragonflyClient(): Redis {
  if (!dragonflyClient) {
    throw new Error('Dragonfly client not initialized. Call initializeDragonfly() first.');
  }
  return dragonflyClient;
}

/**
 * Cache data in Dragonfly
 */
export async function cacheSet(
  key: string,
  value: any,
  expirationSeconds?: number
): Promise<void> {
  const client = getDragonflyClient();
  const serialized = JSON.stringify(value);

  if (expirationSeconds) {
    await client.setex(key, expirationSeconds, serialized);
  } else {
    await client.set(key, serialized);
  }
}

/**
 * Get cached data from Dragonfly
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  const client = getDragonflyClient();
  const value = await client.get(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Cache parse error:', error);
    return null;
  }
}

/**
 * Delete cached data from Dragonfly
 */
export async function cacheDelete(key: string): Promise<void> {
  const client = getDragonflyClient();
  await client.del(key);
}

/**
 * Clear cache by pattern
 */
export async function cacheClear(pattern: string): Promise<void> {
  const client = getDragonflyClient();
  const keys = await client.keys(pattern);
  
  if (keys.length > 0) {
    await client.del(...keys);
  }
}

/**
 * Initialize ClickHouse connection
 */
export function initializeClickHouse(): ClickHouseClient {
  if (clickhouseClient) {
    return clickhouseClient;
  }

  clickhouseClient = createClient({
    url: config.database.clickhouseUrl || 'http://localhost:8123',
    username: config.database.clickhouseUser || 'default',
    password: config.database.clickhousePassword || '',
    database: config.database.clickhouseDatabase || 'ninjait',
    clickhouse_settings: {
      async_insert: 1,
      wait_for_async_insert: 0,
    },
  });

  console.log('✅ ClickHouse client initialized');
  return clickhouseClient;
}

/**
 * Get ClickHouse client
 */
export function getClickHouseClient(): ClickHouseClient {
  if (!clickhouseClient) {
    throw new Error('ClickHouse client not initialized. Call initializeClickHouse() first.');
  }
  return clickhouseClient;
}

/**
 * Execute ClickHouse query
 */
export async function executeClickHouseQuery<T = any>(query: string): Promise<T[]> {
  const client = getClickHouseClient();
  const resultSet = await client.query({ query });
  const data = await resultSet.json();
  return data.data as T[];
}

/**
 * Insert data into ClickHouse
 */
export async function insertClickHouseData(
  table: string,
  data: Record<string, any>[]
): Promise<void> {
  const client = getClickHouseClient();
  await client.insert({
    table,
    values: data,
    format: 'JSONEachRow',
  });
}

/**
 * Initialize RabbitMQ connection
 */
export async function initializeRabbitMQ(): Promise<Channel> {
  if (rabbitmqChannel) {
    return rabbitmqChannel;
  }

  try {
    // Connect to RabbitMQ
    rabbitmqConnection = await amqp.connect(
      config.database.rabbitmqUrl || 'amqp://localhost:5672'
    );

    console.log('✅ RabbitMQ connected successfully');

    // Create channel
    rabbitmqChannel = await rabbitmqConnection.createChannel();
    
    // Set prefetch to 1 for fair dispatch
    await rabbitmqChannel.prefetch(1);

    // Handle connection errors
    rabbitmqConnection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });

    rabbitmqConnection.on('close', () => {
      console.log('RabbitMQ connection closed');
      rabbitmqConnection = null;
      rabbitmqChannel = null;
    });

    return rabbitmqChannel;
  } catch (error) {
    console.error('❌ RabbitMQ connection failed:', error);
    throw error;
  }
}

/**
 * Get RabbitMQ channel
 */
export function getRabbitMQChannel(): Channel {
  if (!rabbitmqChannel) {
    throw new Error('RabbitMQ channel not initialized. Call initializeRabbitMQ() first.');
  }
  return rabbitmqChannel;
}

/**
 * Publish message to RabbitMQ queue
 */
export async function publishMessage(
  queue: string,
  message: any,
  options?: any
): Promise<boolean> {
  const channel = getRabbitMQChannel();
  
  // Ensure queue exists
  await channel.assertQueue(queue, { durable: true });
  
  // Publish message
  return channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(message)),
    { persistent: true, ...options }
  );
}

/**
 * Consume messages from RabbitMQ queue
 */
export async function consumeMessages(
  queue: string,
  handler: (message: any) => Promise<void>,
  options?: any
): Promise<void> {
  const channel = getRabbitMQChannel();
  
  // Ensure queue exists
  await channel.assertQueue(queue, { durable: true });
  
  // Consume messages
  await channel.consume(
    queue,
    async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          channel.ack(msg);
        } catch (error) {
          console.error('Message handler error:', error);
          // Reject and requeue on error
          channel.nack(msg, false, true);
        }
      }
    },
    options
  );
}

/**
 * Initialize all database connections
 */
export async function initializeDatabases(): Promise<void> {
  console.log('🔌 Initializing database connections...');

  try {
    // Initialize PostgreSQL
    await initializePostgreSQL();

    // Initialize InfluxDB
    initializeInfluxDB();

    // Initialize Dragonfly
    initializeDragonfly();

    // Initialize ClickHouse (optional - don't fail if not available)
    try {
      initializeClickHouse();
    } catch (error) {
      console.warn('⚠️  ClickHouse initialization skipped:', error);
    }

    // Initialize RabbitMQ (optional - don't fail if not available)
    try {
      await initializeRabbitMQ();
    } catch (error) {
      console.warn('⚠️  RabbitMQ initialization skipped:', error);
    }

    console.log('✅ All database connections initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Close all database connections
 */
export async function closeDatabases(): Promise<void> {
  console.log('🔌 Closing database connections...');

  if (pgPool) {
    await pgPool.end();
    pgPool = null;
    console.log('✅ PostgreSQL connection closed');
  }

  if (influxClient) {
    // InfluxDB client doesn't need explicit closing
    influxClient = null;
    console.log('✅ InfluxDB client closed');
  }

  if (dragonflyClient) {
    dragonflyClient.disconnect();
    dragonflyClient = null;
    console.log('✅ Dragonfly connection closed');
  }

  if (clickhouseClient) {
    await clickhouseClient.close();
    clickhouseClient = null;
    console.log('✅ ClickHouse connection closed');
  }

  if (rabbitmqChannel) {
    await rabbitmqChannel.close();
    rabbitmqChannel = null;
    console.log('✅ RabbitMQ channel closed');
  }

  if (rabbitmqConnection) {
    await rabbitmqConnection.close();
    rabbitmqConnection = null;
    console.log('✅ RabbitMQ connection closed');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await closeDatabases();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabases();
  process.exit(0);
});

