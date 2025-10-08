package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/yossibmoha/NingaIT/agent/internal/config"
	"github.com/yossibmoha/NingaIT/agent/pkg/models"
	log "github.com/sirupsen/logrus"
)

// Client handles communication with the NinjaIT server
type Client struct {
	config     *config.Config
	httpClient *http.Client
	wsConn     *websocket.Conn
	connected  bool
}

// NewClient creates a new API client
func NewClient(cfg *config.Config) *Client {
	return &Client{
		config: cfg,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		connected: false,
	}
}

// Connect establishes connection to the server
func (c *Client) Connect(ctx context.Context) error {
	// Test HTTP connection
	req, err := http.NewRequestWithContext(ctx, "GET", c.config.Server.URL+"/health", nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to connect to server: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("server health check failed: status %d", resp.StatusCode)
	}

	c.connected = true

	// TODO: Optionally connect via WebSocket for real-time communication
	if c.config.Server.WSEnabled {
		go c.connectWebSocket(ctx)
	}

	return nil
}

// Close closes the connection to the server
func (c *Client) Close() error {
	c.connected = false
	if c.wsConn != nil {
		return c.wsConn.Close()
	}
	return nil
}

// SendHeartbeat sends a heartbeat to the server
func (c *Client) SendHeartbeat() error {
	heartbeat := models.Heartbeat{
		DeviceID:  c.config.Agent.DeviceID,
		Hostname:  c.config.Agent.Hostname,
		Timestamp: time.Now(),
		Status:    "online",
		Version:   "0.1.0",
	}

	return c.sendJSON("/api/agent/heartbeat", heartbeat)
}

// SendMetrics sends system metrics to the server
func (c *Client) SendMetrics(metrics *models.SystemMetrics) error {
	return c.sendJSON("/api/agent/metrics", metrics)
}

// sendJSON sends a JSON payload to the server
func (c *Client) sendJSON(endpoint string, payload interface{}) error {
	if !c.connected {
		return fmt.Errorf("not connected to server")
	}

	// Marshal payload to JSON
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	// Create request
	url := c.config.Server.URL + endpoint
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(data))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	if c.config.Server.APIKey != "" {
		req.Header.Set("X-API-Key", c.config.Server.APIKey)
	}

	// Send request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Check response
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("server returned status %d", resp.StatusCode)
	}

	return nil
}

// connectWebSocket establishes WebSocket connection for real-time communication
func (c *Client) connectWebSocket(ctx context.Context) {
	wsURL := c.config.Server.URL
	// Convert http:// to ws:// and https:// to wss://
	if len(wsURL) > 7 && wsURL[:7] == "http://" {
		wsURL = "ws://" + wsURL[7:]
	} else if len(wsURL) > 8 && wsURL[:8] == "https://" {
		wsURL = "wss://" + wsURL[8:]
	}
	wsURL += "/ws/agent"

	header := http.Header{}
	if c.config.Server.APIKey != "" {
		header.Set("X-API-Key", c.config.Server.APIKey)
	}

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, header)
	if err != nil {
		log.WithError(err).Warn("Failed to connect WebSocket")
		return
	}

	c.wsConn = conn
	log.Info("WebSocket connected")

	// Listen for messages
	go c.listenWebSocket(ctx)
}

// listenWebSocket listens for messages from the server
func (c *Client) listenWebSocket(ctx context.Context) {
	defer func() {
		if c.wsConn != nil {
			c.wsConn.Close()
			c.wsConn = nil
		}
	}()

	for {
		select {
		case <-ctx.Done():
			return
		default:
			_, message, err := c.wsConn.ReadMessage()
			if err != nil {
				log.WithError(err).Warn("WebSocket read error")
				return
			}

			// TODO: Handle incoming commands from server
			log.WithField("message", string(message)).Debug("Received WebSocket message")
		}
	}
}

