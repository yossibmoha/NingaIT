/**
 * WebSocket Server for Real-time Updates
 * Handles live metrics, alerts, and device status updates
 */

import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';

interface Client {
  id: string;
  ws: WebSocket;
  userId: string;
  organizationId: string;
  subscribedDevices: Set<string>;
  subscribedTopics: Set<string>;
}

interface Message {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'message';
  topic?: string;
  deviceId?: string;
  data?: any;
}

export class WebSocketServer {
  private clients: Map<string, Client> = new Map();
  private deviceSubscriptions: Map<string, Set<string>> = new Map();
  private topicSubscriptions: Map<string, Set<string>> = new Map();

  constructor(private app: FastifyInstance) {}

  /**
   * Initialize WebSocket server
   */
  public async initialize() {
    // WebSocket route for real-time updates
    this.app.get('/ws', { websocket: true }, (connection, request) => {
      const { socket } = connection;
      const clientId = this.generateClientId();

      // Parse auth token from query or headers
      const token = request.query.token as string || request.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        socket.close(4001, 'Unauthorized: No token provided');
        return;
      }

      // TODO: Verify JWT token and extract user info
      // For now, use mock data
      const client: Client = {
        id: clientId,
        ws: socket,
        userId: 'user-123',
        organizationId: 'org-123',
        subscribedDevices: new Set(),
        subscribedTopics: new Set(),
      };

      this.clients.set(clientId, client);
      this.app.log.info(`WebSocket client connected: ${clientId}`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connected',
        clientId,
        message: 'Connected to NinjaIT WebSocket server',
      });

      // Handle incoming messages
      socket.on('message', (data: Buffer) => {
        this.handleMessage(clientId, data);
      });

      // Handle disconnect
      socket.on('close', () => {
        this.handleDisconnect(clientId);
      });

      // Handle errors
      socket.on('error', (error) => {
        this.app.log.error(`WebSocket error for client ${clientId}:`, error);
      });

      // Ping/pong for keep-alive
      const pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);

      socket.on('pong', () => {
        this.app.log.debug(`Pong received from client ${clientId}`);
      });
    });

    this.app.log.info('WebSocket server initialized');
  }

  /**
   * Handle incoming message from client
   */
  private handleMessage(clientId: string, data: Buffer) {
    try {
      const message: Message = JSON.parse(data.toString());
      const client = this.clients.get(clientId);

      if (!client) return;

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(clientId, message);
          break;

        case 'unsubscribe':
          this.handleUnsubscribe(clientId, message);
          break;

        case 'ping':
          this.sendToClient(clientId, { type: 'pong' });
          break;

        default:
          this.app.log.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      this.app.log.error('Error parsing WebSocket message:', error);
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Invalid message format',
      });
    }
  }

  /**
   * Handle subscription to device or topic
   */
  private handleSubscribe(clientId: string, message: Message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (message.deviceId) {
      // Subscribe to specific device
      client.subscribedDevices.add(message.deviceId);

      if (!this.deviceSubscriptions.has(message.deviceId)) {
        this.deviceSubscriptions.set(message.deviceId, new Set());
      }
      this.deviceSubscriptions.get(message.deviceId)!.add(clientId);

      this.sendToClient(clientId, {
        type: 'subscribed',
        deviceId: message.deviceId,
        message: `Subscribed to device ${message.deviceId}`,
      });

      this.app.log.info(`Client ${clientId} subscribed to device ${message.deviceId}`);
    }

    if (message.topic) {
      // Subscribe to topic (alerts, devices, etc.)
      client.subscribedTopics.add(message.topic);

      if (!this.topicSubscriptions.has(message.topic)) {
        this.topicSubscriptions.set(message.topic, new Set());
      }
      this.topicSubscriptions.get(message.topic)!.add(clientId);

      this.sendToClient(clientId, {
        type: 'subscribed',
        topic: message.topic,
        message: `Subscribed to topic ${message.topic}`,
      });

      this.app.log.info(`Client ${clientId} subscribed to topic ${message.topic}`);
    }
  }

  /**
   * Handle unsubscription
   */
  private handleUnsubscribe(clientId: string, message: Message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (message.deviceId) {
      client.subscribedDevices.delete(message.deviceId);
      this.deviceSubscriptions.get(message.deviceId)?.delete(clientId);

      this.sendToClient(clientId, {
        type: 'unsubscribed',
        deviceId: message.deviceId,
      });
    }

    if (message.topic) {
      client.subscribedTopics.delete(message.topic);
      this.topicSubscriptions.get(message.topic)?.delete(clientId);

      this.sendToClient(clientId, {
        type: 'unsubscribed',
        topic: message.topic,
      });
    }
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from all subscriptions
    client.subscribedDevices.forEach((deviceId) => {
      this.deviceSubscriptions.get(deviceId)?.delete(clientId);
    });

    client.subscribedTopics.forEach((topic) => {
      this.topicSubscriptions.get(topic)?.delete(clientId);
    });

    this.clients.delete(clientId);
    this.app.log.info(`WebSocket client disconnected: ${clientId}`);
  }

  /**
   * Broadcast metrics update to subscribed clients
   */
  public broadcastMetrics(deviceId: string, metrics: any) {
    const subscribers = this.deviceSubscriptions.get(deviceId);
    if (!subscribers) return;

    const message = {
      type: 'metrics',
      deviceId,
      data: metrics,
      timestamp: new Date().toISOString(),
    };

    subscribers.forEach((clientId) => {
      this.sendToClient(clientId, message);
    });

    this.app.log.debug(`Broadcast metrics for device ${deviceId} to ${subscribers.size} clients`);
  }

  /**
   * Broadcast alert to subscribed clients
   */
  public broadcastAlert(alert: any) {
    // Send to device subscribers
    if (alert.deviceId) {
      const deviceSubscribers = this.deviceSubscriptions.get(alert.deviceId);
      deviceSubscribers?.forEach((clientId) => {
        this.sendToClient(clientId, {
          type: 'alert',
          data: alert,
          timestamp: new Date().toISOString(),
        });
      });
    }

    // Send to alerts topic subscribers
    const topicSubscribers = this.topicSubscriptions.get('alerts');
    topicSubscribers?.forEach((clientId) => {
      this.sendToClient(clientId, {
        type: 'alert',
        data: alert,
        timestamp: new Date().toISOString(),
      });
    });

    this.app.log.info(`Broadcast alert: ${alert.message}`);
  }

  /**
   * Broadcast device status change
   */
  public broadcastDeviceStatus(deviceId: string, status: 'online' | 'offline' | 'warning') {
    const subscribers = this.deviceSubscriptions.get(deviceId);
    if (!subscribers) return;

    const message = {
      type: 'device_status',
      deviceId,
      status,
      timestamp: new Date().toISOString(),
    };

    subscribers.forEach((clientId) => {
      this.sendToClient(clientId, message);
    });

    // Also send to devices topic
    const topicSubscribers = this.topicSubscriptions.get('devices');
    topicSubscribers?.forEach((clientId) => {
      this.sendToClient(clientId, message);
    });

    this.app.log.info(`Broadcast device status change: ${deviceId} -> ${status}`);
  }

  /**
   * Send message to specific client
   */
  private sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      client.ws.send(JSON.stringify(message));
    } catch (error) {
      this.app.log.error(`Error sending message to client ${clientId}:`, error);
    }
  }

  /**
   * Broadcast to all connected clients
   */
  public broadcast(message: any) {
    this.clients.forEach((client, clientId) => {
      this.sendToClient(clientId, message);
    });
  }

  /**
   * Broadcast to topic subscribers
   */
  public broadcastToTopic(topic: string, message: any) {
    const subscribers = this.topicSubscriptions.get(topic);
    if (!subscribers) return;

    subscribers.forEach((clientId) => {
      this.sendToClient(clientId, message);
    });

    this.app.log.debug(`Broadcast to topic ${topic}: ${subscribers.size} clients`);
  }

  /**
   * Get connection stats
   */
  public getStats() {
    return {
      totalClients: this.clients.size,
      deviceSubscriptions: this.deviceSubscriptions.size,
      topicSubscriptions: this.topicSubscriptions.size,
      clients: Array.from(this.clients.values()).map((client) => ({
        id: client.id,
        userId: client.userId,
        organizationId: client.organizationId,
        subscribedDevices: Array.from(client.subscribedDevices),
        subscribedTopics: Array.from(client.subscribedTopics),
      })),
    };
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

