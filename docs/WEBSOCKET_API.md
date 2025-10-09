# WebSocket API Documentation

## Overview

NinjaIT uses WebSocket for real-time bidirectional communication between the server and clients. This enables live updates for device metrics, alerts, and system status changes.

## Connection

### Endpoint
```
ws://localhost:3001/ws?token=YOUR_JWT_TOKEN
```

### Authentication

WebSocket connections require authentication via JWT token. You can provide the token in two ways:

1. **Query Parameter** (Recommended for browser clients):
```javascript
const token = localStorage.getItem('access_token');
const ws = new WebSocket(`ws://localhost:3001/ws?token=${token}`);
```

2. **Authorization Header** (For non-browser clients):
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Message Format

All messages are JSON-encoded with the following structure:

```typescript
interface Message {
  type: string;          // Message type
  deviceId?: string;     // Optional device ID
  topic?: string;        // Optional topic name
  data?: any;           // Optional data payload
  timestamp?: string;    // ISO 8601 timestamp
  message?: string;      // Optional text message
}
```

## Client Messages

### Subscribe to Device

Subscribe to real-time updates for a specific device:

```json
{
  "type": "subscribe",
  "deviceId": "dev-001"
}
```

**Response:**
```json
{
  "type": "subscribed",
  "deviceId": "dev-001",
  "message": "Subscribed to device dev-001"
}
```

### Subscribe to Topic

Subscribe to a topic for broadcasted updates:

```json
{
  "type": "subscribe",
  "topic": "alerts"
}
```

Available topics:
- `alerts` - All system alerts
- `devices` - Device status changes
- `metrics` - Global metrics updates

**Response:**
```json
{
  "type": "subscribed",
  "topic": "alerts",
  "message": "Subscribed to topic alerts"
}
```

### Unsubscribe

Unsubscribe from device or topic:

```json
{
  "type": "unsubscribe",
  "deviceId": "dev-001"
}
```

or

```json
{
  "type": "unsubscribe",
  "topic": "alerts"
}
```

### Ping

Send a ping to keep the connection alive:

```json
{
  "type": "ping"
}
```

**Response:**
```json
{
  "type": "pong"
}
```

## Server Messages

### Connected

Sent immediately upon successful connection:

```json
{
  "type": "connected",
  "clientId": "client-1234567890-abc123",
  "message": "Connected to NinjaIT WebSocket server"
}
```

### Metrics Update

Real-time device metrics (sent every 60 seconds for subscribed devices):

```json
{
  "type": "metrics",
  "deviceId": "dev-001",
  "data": {
    "cpu": 45.2,
    "memory": 68.5,
    "disk": 72.1,
    "network": {
      "bytesIn": 1024000,
      "bytesOut": 512000
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Alert

New alert notification:

```json
{
  "type": "alert",
  "data": {
    "id": "alert-123",
    "deviceId": "dev-001",
    "severity": "warning",
    "message": "High CPU usage detected (85%)",
    "metric": "cpu",
    "threshold": 80,
    "currentValue": 85
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

Alert severities:
- `info` - Informational
- `warning` - Warning condition
- `error` - Error condition
- `critical` - Critical condition

### Device Status

Device online/offline status change:

```json
{
  "type": "device_status",
  "deviceId": "dev-001",
  "status": "online",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

Status values:
- `online` - Device is online and responding
- `offline` - Device is not responding
- `warning` - Device is online but has issues

### Error

Error message from server:

```json
{
  "type": "error",
  "message": "Invalid message format",
  "code": 4000
}
```

## Usage Examples

### JavaScript/TypeScript (Browser)

```typescript
// Connect
const token = localStorage.getItem('access_token');
const ws = new WebSocket(`ws://localhost:3001/ws?token=${token}`);

// Handle connection
ws.onopen = () => {
  console.log('Connected to WebSocket');
  
  // Subscribe to device
  ws.send(JSON.stringify({
    type: 'subscribe',
    deviceId: 'dev-001'
  }));
  
  // Subscribe to alerts topic
  ws.send(JSON.stringify({
    type: 'subscribe',
    topic: 'alerts'
  }));
};

// Handle messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'connected':
      console.log('Connected:', message.clientId);
      break;
      
    case 'metrics':
      console.log('Metrics update:', message.data);
      updateDashboard(message.deviceId, message.data);
      break;
      
    case 'alert':
      console.log('New alert:', message.data);
      showNotification(message.data);
      break;
      
    case 'device_status':
      console.log('Device status changed:', message.status);
      updateDeviceStatus(message.deviceId, message.status);
      break;
  }
};

// Handle errors
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// Handle disconnect
ws.onclose = () => {
  console.log('Disconnected from WebSocket');
  // Implement reconnection logic
};
```

### React Hook

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

function DeviceMonitor({ deviceId }) {
  const {
    isConnected,
    lastMessage,
    subscribeToDevice,
    unsubscribeFromDevice
  } = useWebSocket({
    autoConnect: true,
    onMessage: (message) => {
      if (message.type === 'metrics') {
        console.log('Metrics:', message.data);
      }
    }
  });

  useEffect(() => {
    if (isConnected) {
      subscribeToDevice(deviceId);
    }
    
    return () => {
      unsubscribeFromDevice(deviceId);
    };
  }, [isConnected, deviceId]);

  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

### Node.js Client

```javascript
const WebSocket = require('ws');

const token = 'YOUR_JWT_TOKEN';
const ws = new WebSocket(`ws://localhost:3001/ws?token=${token}`);

ws.on('open', () => {
  console.log('Connected');
  
  // Subscribe to all alerts
  ws.send(JSON.stringify({
    type: 'subscribe',
    topic: 'alerts'
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('Received:', message);
});
```

## Connection Management

### Keep-Alive

The server automatically sends pings every 30 seconds to keep the connection alive. Clients should respond to server pings or send their own pings periodically.

### Reconnection

Clients should implement automatic reconnection logic with exponential backoff:

```typescript
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const baseReconnectDelay = 1000;

function connect() {
  const ws = new WebSocket(url);
  
  ws.onclose = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts);
      reconnectAttempts++;
      
      console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
      setTimeout(connect, delay);
    }
  };
  
  ws.onopen = () => {
    reconnectAttempts = 0;
  };
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 4001 | Unauthorized - No token provided |
| 4002 | Unauthorized - Invalid token |
| 4003 | Forbidden - Insufficient permissions |
| 4004 | Not Found - Resource not found |
| 4005 | Invalid Message - Malformed message |

## Rate Limiting

WebSocket connections are subject to the same rate limiting as HTTP requests:
- Max 1000 messages per minute per client
- Exceeding limits will result in connection closure

## Best Practices

1. **Always authenticate** - Provide valid JWT token
2. **Handle reconnection** - Implement automatic reconnection
3. **Send heartbeats** - Keep connection alive with pings
4. **Unsubscribe on unmount** - Clean up subscriptions
5. **Handle errors gracefully** - Don't crash on invalid messages
6. **Limit subscriptions** - Only subscribe to needed data
7. **Parse messages safely** - Always try/catch JSON.parse()
8. **Close connection properly** - Send close frame when done

## Security Considerations

- All connections must be authenticated
- Connections are organization-scoped
- Clients can only subscribe to their organization's devices
- Messages are validated and sanitized
- Rate limiting prevents abuse
- TLS/SSL recommended for production

## Performance

- Max concurrent connections: 10,000
- Message throughput: 100,000 messages/second
- Average latency: < 5ms
- Connection overhead: ~2KB per client

## Troubleshooting

### Connection Refused
- Check if API Gateway is running
- Verify WebSocket port (default: 3001)
- Ensure firewall allows WebSocket connections

### Authentication Failed
- Verify JWT token is valid
- Check token expiration
- Ensure token has correct permissions

### No Messages Received
- Verify subscriptions are sent after connection
- Check server logs for errors
- Ensure client is listening for messages

### Frequent Disconnections
- Implement ping/pong keep-alive
- Check network stability
- Review server resource usage

## Support

For issues or questions:
- GitHub Issues: https://github.com/yossibmoha/NinjaIT/issues
- Documentation: https://docs.ninjait.io
- Email: support@ninjait.io

