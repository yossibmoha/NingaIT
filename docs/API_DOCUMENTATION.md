# NinjaIT API Documentation

**Version**: 0.3.0  
**Base URL**: `http://localhost:8000` (Development)  
**Production URL**: `https://api.ninjait.io`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Response Format](#response-format)
5. [API Endpoints](#api-endpoints)
6. [Database Architecture](#database-architecture)
7. [WebSocket Support](#websocket-support)
8. [Error Handling](#error-handling)
9. [Examples](#examples)

---

## Overview

NinjaIT provides a comprehensive RESTful API for managing IT infrastructure, monitoring devices, collecting metrics, and automating IT operations.

### Key Features

- **🔐 JWT Authentication** - Secure token-based authentication
- **🚀 High Performance** - Built on Fastify for maximum speed
- **📊 Real-time Metrics** - InfluxDB time-series database
- **💾 Smart Caching** - Dragonfly (Redis-compatible) for ultra-fast responses
- **📈 Analytics** - ClickHouse for powerful analytics queries
- **🔔 Async Processing** - RabbitMQ for reliable message queuing
- **🛡️ Rate Limiting** - Distributed rate limiting to prevent abuse
- **📝 Auto-documentation** - Swagger/OpenAPI and Redoc

### Documentation URLs

| Type | URL | Description |
|------|-----|-------------|
| **Swagger UI** | `/docs` | Interactive API documentation |
| **Redoc** | `/api-docs/redoc` | Alternative documentation UI |
| **OpenAPI Spec** | `/docs/json` | Raw OpenAPI 3.0 specification |
| **Postman Collection** | `/api-docs/postman` | Import into Postman |
| **Changelog** | `/api-docs/changelog` | API version history |

---

## Authentication

### JWT Token-Based Authentication

All API endpoints (except `/api/v1/auth/*`) require a valid JWT token.

#### Obtaining a Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "fullName": "John Doe",
      "roles": ["admin"]
    }
  }
}
```

#### Using the Token

Include the token in the `Authorization` header:

```http
GET /api/v1/devices
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Token Refresh

Access tokens expire after 15 minutes. Use the refresh token to get a new one:

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Rate Limiting

API requests are rate-limited to ensure fair usage and system stability.

### Rate Limit Tiers

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| **Standard API** | 100 requests | 1 minute |
| **Auth Endpoints** | 10 requests | 5 minutes |
| **Heavy Operations** | 10 requests | 1 minute |
| **Metrics Ingestion** | 1000 requests | 1 minute |

### Rate Limit Headers

Every response includes rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1633027200000
```

### Rate Limit Exceeded

When you exceed the rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 60 seconds.",
  "limit": 100,
  "window": "60s"
}
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "metadata": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Invalid email format",
  "details": {
    "field": "email",
    "rule": "email"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request succeeded |
| `201` | Created | Resource created successfully |
| `204` | No Content | Request succeeded with no content |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | User login |
| `POST` | `/api/v1/auth/logout` | User logout |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset |
| `POST` | `/api/v1/auth/reset-password` | Reset password |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/users` | List all users |
| `GET` | `/api/v1/users/:id` | Get user by ID |
| `PUT` | `/api/v1/users/:id` | Update user |
| `DELETE` | `/api/v1/users/:id` | Delete user |
| `GET` | `/api/v1/users/me` | Get current user |
| `PUT` | `/api/v1/users/me` | Update current user |

### Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/devices` | List all devices |
| `POST` | `/api/v1/devices` | Add new device |
| `GET` | `/api/v1/devices/:id` | Get device details |
| `PUT` | `/api/v1/devices/:id` | Update device |
| `DELETE` | `/api/v1/devices/:id` | Delete device |
| `GET` | `/api/v1/devices/:id/metrics` | Get device metrics |
| `GET` | `/api/v1/devices/:id/alerts` | Get device alerts |

### Metrics (InfluxDB)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/metrics/ingest` | Ingest single metric |
| `POST` | `/api/v1/metrics/batch` | Batch ingest metrics |
| `GET` | `/api/v1/metrics/query` | Query metrics with filters |
| `GET` | `/api/v1/metrics/device/:id/latest` | Get latest metrics |
| `GET` | `/api/v1/metrics/device/:id/history` | Get historical data |
| `GET` | `/api/v1/metrics/device/:id/stats` | Get statistics |
| `GET` | `/api/v1/metrics/organization/summary` | Org-wide summary |
| `DELETE` | `/api/v1/metrics/device/:id` | Delete device metrics |

### Cache & Sessions (Dragonfly)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/cache/stats` | Get cache statistics |
| `POST` | `/api/v1/cache/clear` | Clear cache by pattern |
| `GET` | `/api/v1/cache/keys` | List cache keys |
| `GET` | `/api/v1/cache/get/:key` | Get cached value |
| `DELETE` | `/api/v1/cache/delete/:key` | Delete cache key |
| `GET` | `/api/v1/cache/sessions` | List all sessions (admin) |
| `GET` | `/api/v1/cache/sessions/user/:userId` | User sessions |
| `DELETE` | `/api/v1/cache/sessions/user/:userId` | Delete user sessions |
| `DELETE` | `/api/v1/cache/sessions/:sessionId` | Delete session |
| `GET` | `/api/v1/cache/ratelimit/:identifier` | Rate limit status |
| `DELETE` | `/api/v1/cache/ratelimit/:identifier` | Reset rate limit |

---

## Database Architecture

NinjaIT uses a multi-database architecture for optimal performance:

### PostgreSQL (Relational Data)
- **Purpose**: Core relational data
- **Stores**: Users, organizations, devices, alerts, scripts
- **Features**: ACID transactions, complex joins, RBAC

### InfluxDB (Time-Series)
- **Purpose**: High-performance metrics storage
- **Stores**: CPU, memory, disk, network metrics
- **Features**: Optimized for time-series data, retention policies

### Dragonfly (Cache & Sessions)
- **Purpose**: Ultra-fast caching layer
- **Stores**: HTTP cache, sessions, rate limits
- **Features**: Redis-compatible, microsecond latency

### ClickHouse (Analytics)
- **Purpose**: Fast analytical queries
- **Stores**: Historical aggregations, reports
- **Features**: Columnar storage, parallel processing

### RabbitMQ (Message Queue)
- **Purpose**: Async task processing
- **Handles**: Alerts, notifications, batch jobs
- **Features**: Reliable delivery, message persistence

---

## WebSocket Support

Real-time updates via WebSocket connections.

### Connect

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
const token = 'your-jwt-token';

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: token
  }));
};
```

### Subscribe to Updates

```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'device-metrics',
  deviceId: 'device-uuid'
}));
```

### Receive Updates

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

---

## Error Handling

### Error Codes

| Code | Error Type | Description |
|------|-----------|-------------|
| `AUTH_001` | Invalid Credentials | Wrong email/password |
| `AUTH_002` | Token Expired | JWT token expired |
| `AUTH_003` | Insufficient Permissions | RBAC permission denied |
| `VAL_001` | Validation Error | Invalid input data |
| `RES_001` | Resource Not Found | Requested resource doesn't exist |
| `RATE_001` | Rate Limit Exceeded | Too many requests |
| `SYS_001` | System Error | Internal server error |

---

## Examples

### Example 1: Ingest Metrics

```bash
curl -X POST http://localhost:8000/api/v1/metrics/ingest \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "550e8400-e29b-41d4-a716-446655440000",
    "metrics": {
      "cpu": 45.5,
      "memory": 62.3,
      "disk": 75.8,
      "network_in": 1024.5,
      "network_out": 512.3
    }
  }'
```

### Example 2: Query Metrics

```bash
curl -X GET "http://localhost:8000/api/v1/metrics/query?deviceId=550e8400&metric=cpu&start=2025-10-09T00:00:00Z&interval=1m&aggregation=mean" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 3: Get Device List

```bash
curl -X GET "http://localhost:8000/api/v1/devices?page=1&limit=20&status=online" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 4: Clear Cache

```bash
curl -X POST http://localhost:8000/api/v1/cache/clear \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "metrics:device:*"
  }'
```

---

## SDK & Client Libraries

### JavaScript/TypeScript

```bash
npm install @ninjait/client
```

```typescript
import { NinjaITClient } from '@ninjait/client';

const client = new NinjaITClient({
  apiUrl: 'http://localhost:8000',
  apiKey: 'your-api-key'
});

// Get devices
const devices = await client.devices.list();

// Ingest metrics
await client.metrics.ingest(deviceId, {
  cpu: 45.5,
  memory: 62.3
});
```

### Python

```bash
pip install ninjait-client
```

```python
from ninjait import Client

client = Client(
    api_url='http://localhost:8000',
    api_key='your-api-key'
)

# Get devices
devices = client.devices.list()

# Ingest metrics
client.metrics.ingest(device_id, {
    'cpu': 45.5,
    'memory': 62.3
})
```

---

## Support & Resources

- **GitHub**: [https://github.com/yossibmoha/NinjaIT](https://github.com/yossibmoha/NinjaIT)
- **Documentation**: [https://docs.ninjait.io](https://docs.ninjait.io)
- **Support Email**: support@ninjait.io
- **Community Forum**: [https://community.ninjait.io](https://community.ninjait.io)
- **Status Page**: [https://status.ninjait.io](https://status.ninjait.io)

---

**Last Updated**: October 9, 2025  
**Version**: 0.3.0

