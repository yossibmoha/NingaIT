/**
 * WebSocket Hook for Real-time Updates
 * Manages WebSocket connection and subscriptions
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { message as antMessage } from 'antd';

interface WebSocketMessage {
  type: string;
  deviceId?: string;
  topic?: string;
  data?: any;
  timestamp?: string;
  message?: string;
}

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/ws`,
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No access token found');
        return;
      }

      // Create WebSocket connection
      const wsUrl = `${url}?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);

          // Handle different message types
          if (message.type === 'alert') {
            antMessage.warning(message.data?.message || 'New alert received');
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          console.error('Max reconnect attempts reached');
          antMessage.error('Lost connection to server');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [url, maxReconnectAttempts, reconnectInterval, onConnect, onDisconnect, onError, onMessage]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  /**
   * Send message to server
   */
  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  /**
   * Subscribe to device updates
   */
  const subscribeToDevice = useCallback((deviceId: string) => {
    send({
      type: 'subscribe',
      deviceId,
    });
  }, [send]);

  /**
   * Unsubscribe from device updates
   */
  const unsubscribeFromDevice = useCallback((deviceId: string) => {
    send({
      type: 'unsubscribe',
      deviceId,
    });
  }, [send]);

  /**
   * Subscribe to topic
   */
  const subscribeToTopic = useCallback((topic: string) => {
    send({
      type: 'subscribe',
      topic,
    });
  }, [send]);

  /**
   * Unsubscribe from topic
   */
  const unsubscribeFromTopic = useCallback((topic: string) => {
    send({
      type: 'unsubscribe',
      topic,
    });
  }, [send]);

  /**
   * Send ping
   */
  const ping = useCallback(() => {
    send({ type: 'ping' });
  }, [send]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Ping interval for keep-alive
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      ping();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, ping]);

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    send,
    subscribeToDevice,
    unsubscribeFromDevice,
    subscribeToTopic,
    unsubscribeFromTopic,
    ping,
  };
}

