# Database Strategy - NinjaIT

## Overview

NinjaIT uses a polyglot persistence strategy, selecting the best database for each use case to optimize performance, scalability, and cost.

## Database Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  PostgreSQL  │      │  Dragonfly   │      │  InfluxDB    │
│  (Primary)   │      │  (Cache)     │      │  (Metrics)   │
└──────────────┘      └──────────────┘      └──────────────┘
        │                     │                     │
        │                     ▼                     │
        │             ┌──────────────┐              │
        │             │  ClickHouse  │              │
        │             │ (Analytics)  │              │
        │             └──────────────┘              │
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                      ┌──────────────┐
                      │   MongoDB    │
                      │   (Logs)     │
                      └──────────────┘
```

---

## 1. PostgreSQL - Primary Relational Database

### Purpose
Transactional data requiring ACID compliance and complex relationships.

### Use Cases
- User accounts and authentication
- Organizations and tenants
- Device inventory
- Tickets and PSA data
- Contracts and billing
- Configuration data
- Asset management

### Schema Examples

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Devices table
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    status VARCHAR(50) NOT NULL,
    os_type VARCHAR(50),
    os_version VARCHAR(100),
    ip_address INET,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Performance Optimization
- B-tree indexes on frequently queried columns
- Partial indexes for filtered queries
- JSONB columns for flexible schema
- Connection pooling (pgBouncer)
- Query optimization with EXPLAIN ANALYZE

---

## 2. Dragonfly - High-Performance Caching

### Purpose
Ultra-fast in-memory data store for caching and real-time data.

### Why Dragonfly Over Redis?

| Feature | Dragonfly | Redis |
|---------|-----------|-------|
| **Throughput** | 25x faster | Baseline |
| **Latency** | Sub-millisecond | ~1ms |
| **Memory Efficiency** | 30% less RAM | Baseline |
| **Architecture** | Multi-threaded | Single-threaded |
| **Scaling** | Vertical (no cluster needed) | Horizontal (cluster required) |
| **API** | 100% Redis-compatible | Native |

### Use Cases

#### Session Management
```javascript
// Store user session
await dragonfly.setex(`session:${sessionId}`, 86400, JSON.stringify({
  userId: user.id,
  role: user.role,
  permissions: user.permissions
}));

// Retrieve session
const session = JSON.parse(await dragonfly.get(`session:${sessionId}`));
```

#### API Response Caching
```javascript
// Cache API response for 5 minutes
const cacheKey = `api:devices:${orgId}`;
const cached = await dragonfly.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const devices = await db.devices.findMany({ where: { orgId } });
await dragonfly.setex(cacheKey, 300, JSON.stringify(devices));
return devices;
```

#### Rate Limiting
```javascript
// Rate limit API calls (100 requests per 15 minutes)
const key = `ratelimit:${userId}:${endpoint}`;
const current = await dragonfly.incr(key);

if (current === 1) {
  await dragonfly.expire(key, 900); // 15 minutes
}

if (current > 100) {
  throw new Error('Rate limit exceeded');
}
```

#### Real-Time Leaderboards
```javascript
// Update device uptime leaderboard
await dragonfly.zadd('uptime:leaderboard', deviceUptime, deviceId);

// Get top 10 devices
const topDevices = await dragonfly.zrevrange('uptime:leaderboard', 0, 9, 'WITHSCORES');
```

#### Job Queues (BullMQ)
```javascript
// BullMQ uses Dragonfly for job queues
const queue = new Queue('patch-deployment', {
  connection: dragonflyConfig
});

await queue.add('deploy-patch', {
  deviceId: 'device-123',
  patchId: 'patch-456'
});
```

### Performance Tuning
```yaml
# Dragonfly configuration
maxmemory: 4gb
maxmemory-policy: allkeys-lru
# Multi-threaded by default
# No clustering needed
```

---

## 3. ClickHouse - Analytics & Statistics

### Purpose
Blazing-fast analytical queries on massive datasets.

### Why ClickHouse?

| Feature | ClickHouse | PostgreSQL | MongoDB |
|---------|------------|------------|---------|
| **Query Speed** | 100-1000x faster | Baseline | Slow for analytics |
| **Compression** | 10x compression | 2x | 3x |
| **Scalability** | Billions of rows | Millions | Millions |
| **Analytics** | Optimized | Poor | Poor |

### Use Cases

#### 1. Device Metrics Aggregation
```sql
-- Table for hourly device metrics
CREATE TABLE device_metrics_hourly (
    device_id UUID,
    timestamp DateTime,
    cpu_avg Float32,
    cpu_max Float32,
    memory_avg Float32,
    memory_max Float32,
    disk_usage Float32,
    network_in UInt64,
    network_out UInt64
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (device_id, timestamp);

-- Query: Average CPU usage per device over last 30 days
SELECT 
    device_id,
    avg(cpu_avg) as avg_cpu,
    max(cpu_max) as peak_cpu
FROM device_metrics_hourly
WHERE timestamp >= now() - INTERVAL 30 DAY
GROUP BY device_id
ORDER BY peak_cpu DESC;
```

#### 2. Ticket Statistics
```sql
-- Ticket resolution analytics
CREATE TABLE ticket_events (
    ticket_id UUID,
    event_type String,
    timestamp DateTime,
    duration_seconds UInt32,
    sla_breached UInt8,
    organization_id UUID,
    technician_id UUID
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (organization_id, timestamp);

-- Query: Average resolution time by technician
SELECT 
    technician_id,
    countIf(event_type = 'closed') as tickets_closed,
    avgIf(duration_seconds, event_type = 'closed') / 3600 as avg_hours,
    sumIf(1, sla_breached = 1) as sla_breaches
FROM ticket_events
WHERE timestamp >= now() - INTERVAL 7 DAY
GROUP BY technician_id
ORDER BY tickets_closed DESC;
```

#### 3. API Usage Statistics
```sql
-- API call tracking
CREATE TABLE api_calls (
    timestamp DateTime,
    organization_id UUID,
    endpoint String,
    method String,
    status_code UInt16,
    response_time_ms UInt32,
    user_id UUID
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (organization_id, timestamp);

-- Query: API usage per customer for billing
SELECT 
    organization_id,
    count() as total_calls,
    avg(response_time_ms) as avg_response_time,
    countIf(status_code >= 500) as error_count
FROM api_calls
WHERE timestamp >= toStartOfMonth(now())
GROUP BY organization_id;
```

#### 4. Billing Calculations
```sql
-- Usage-based billing events
CREATE TABLE billing_events (
    organization_id UUID,
    event_date Date,
    device_count UInt32,
    api_calls UInt64,
    storage_gb Float32,
    backup_gb Float32,
    cost_usd Float32
) ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (organization_id, event_date);

-- Query: Monthly invoice calculation
SELECT 
    organization_id,
    sum(device_count) * 5 as device_cost,
    sum(api_calls) * 0.001 as api_cost,
    sum(storage_gb) * 0.10 as storage_cost,
    sum(cost_usd) as total_cost
FROM billing_events
WHERE event_date >= toStartOfMonth(now())
GROUP BY organization_id;
```

#### 5. Real-Time Dashboards
```sql
-- Materialized view for real-time metrics
CREATE MATERIALIZED VIEW device_status_realtime
ENGINE = AggregatingMergeTree()
PARTITION BY toDate(timestamp)
ORDER BY (organization_id, status)
AS SELECT
    organization_id,
    status,
    countState() as device_count,
    maxState(timestamp) as last_update
FROM device_heartbeats
GROUP BY organization_id, status;

-- Query: Current device status counts
SELECT 
    organization_id,
    status,
    countMerge(device_count) as total_devices
FROM device_status_realtime
GROUP BY organization_id, status;
```

### Performance Optimization

```sql
-- Use appropriate table engines
-- MergeTree: Standard analytics
-- ReplicatedMergeTree: High availability
-- SummingMergeTree: Pre-aggregated metrics
-- AggregatingMergeTree: Complex aggregations

-- Partitioning strategy
PARTITION BY toYYYYMM(timestamp)  -- Monthly partitions
-- OR
PARTITION BY toDate(timestamp)     -- Daily partitions (high volume)

-- Primary key optimization
ORDER BY (organization_id, device_id, timestamp)

-- Use FINAL sparingly (impacts performance)
-- Prefer aggregating queries instead
```

---

## 4. InfluxDB - Time-Series Metrics

### Purpose
Store and query time-series data from devices.

### Use Cases

#### Real-Time Device Metrics
```javascript
// Write metrics to InfluxDB
const writeApi = influxDB.getWriteApi(org, bucket);

const point = new Point('device_metrics')
  .tag('device_id', deviceId)
  .tag('organization_id', orgId)
  .floatField('cpu', 75.2)
  .floatField('memory', 8192)
  .floatField('disk_used', 450000)
  .timestamp(new Date());

writeApi.writePoint(point);
await writeApi.close();

// Query metrics
const queryApi = influxDB.getQueryApi(org);
const query = `
  from(bucket: "metrics")
    |> range(start: -1h)
    |> filter(fn: (r) => r._measurement == "device_metrics")
    |> filter(fn: (r) => r.device_id == "${deviceId}")
    |> aggregateWindow(every: 5m, fn: mean)
`;

const data = await queryApi.collectRows(query);
```

### Data Retention
```javascript
// Retention policies
// Real-time: 7 days (full resolution)
// Historical: 90 days (5-minute aggregation)
// Archive: 2 years (1-hour aggregation)
```

---

## 5. MongoDB - Document Store

### Purpose
Flexible schema for logs and unstructured data.

### Use Cases

#### Application Logs
```javascript
// Store application logs
await db.collection('logs').insertOne({
  timestamp: new Date(),
  level: 'error',
  service: 'monitoring-service',
  message: 'Failed to collect metrics',
  deviceId: 'device-123',
  error: {
    code: 'CONNECTION_TIMEOUT',
    details: '...'
  }
});

// Query logs
const errorLogs = await db.collection('logs')
  .find({
    level: 'error',
    timestamp: { $gte: new Date(Date.now() - 3600000) }
  })
  .sort({ timestamp: -1 })
  .limit(100)
  .toArray();
```

#### Audit Trails
```javascript
// Store audit events
await db.collection('audit_log').insertOne({
  timestamp: new Date(),
  userId: user.id,
  action: 'device.delete',
  resourceId: deviceId,
  details: {
    deviceName: device.name,
    reason: 'Decommissioned'
  },
  ipAddress: req.ip
});
```

---

## Data Flow Example

### Scenario: Device Monitoring

```
1. Agent sends metrics every 30 seconds
   └─> InfluxDB (real-time metrics)
   └─> Dragonfly (cache latest values)

2. Every hour, aggregate to ClickHouse
   └─> ClickHouse (hourly aggregates for analytics)

3. When user views dashboard
   └─> Check Dragonfly cache (latest values)
   └─> Query ClickHouse (historical trends)
   └─> PostgreSQL (device metadata)

4. Generate weekly report
   └─> ClickHouse (aggregate analytics)
   └─> Cache result in Dragonfly (24 hours)
```

---

## Best Practices

### 1. Choose the Right Database
- **Transactional data** → PostgreSQL
- **Caching** → Dragonfly
- **Time-series metrics** → InfluxDB
- **Analytics** → ClickHouse
- **Logs** → MongoDB

### 2. Data Lifecycle
- **Hot data** (0-7 days) → Full resolution in InfluxDB + Dragonfly
- **Warm data** (7-90 days) → Aggregated in ClickHouse
- **Cold data** (90+ days) → Archived in S3 + ClickHouse (compressed)

### 3. Performance Tips
- Cache frequently accessed data in Dragonfly
- Use ClickHouse for all analytical queries
- Partition ClickHouse tables by month
- Index PostgreSQL carefully (avoid over-indexing)
- Use connection pooling for all databases

### 4. Monitoring
- Track query performance in each database
- Monitor Dragonfly hit rate (target >95%)
- Alert on slow queries
- Track database size and growth

---

## Migration Strategy

### Moving Data to ClickHouse

```javascript
// ETL job: PostgreSQL → ClickHouse (hourly)
const devices = await pg.query(`
  SELECT device_id, AVG(cpu) as cpu_avg, MAX(cpu) as cpu_max
  FROM device_metrics
  WHERE timestamp >= NOW() - INTERVAL '1 hour'
  GROUP BY device_id
`);

for (const device of devices) {
  await clickhouse.insert('device_metrics_hourly', {
    device_id: device.device_id,
    timestamp: new Date(),
    cpu_avg: device.cpu_avg,
    cpu_max: device.cpu_max
  });
}
```

---

## Summary

| Database | Best For | Performance | Cost |
|----------|----------|-------------|------|
| PostgreSQL | Transactional | Good | Medium |
| Dragonfly | Caching | Excellent | Low |
| ClickHouse | Analytics | Excellent | Low |
| InfluxDB | Time-series | Good | Medium |
| MongoDB | Logs | Good | Medium |

**Result**: Best-in-class performance for each use case while optimizing costs.

