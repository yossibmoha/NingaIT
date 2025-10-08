package api

import (
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/yossibmoha/NingaIT/backend/services/monitoring/internal/config"
	"github.com/yossibmoha/NingaIT/backend/services/monitoring/internal/storage"
	"github.com/yossibmoha/NingaIT/backend/services/monitoring/pkg/models"
	log "github.com/sirupsen/logrus"
)

// Server represents the API server
type Server struct {
	app     *fiber.App
	config  *config.Config
	storage *storage.InfluxDBStorage
}

// NewServer creates a new API server
func NewServer(cfg *config.Config, storage *storage.InfluxDBStorage) *Server {
	app := fiber.New(fiber.Config{
		ReadTimeout:  time.Duration(cfg.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.Server.WriteTimeout) * time.Second,
		BodyLimit:    cfg.Server.MaxRequestSize,
		ErrorHandler: customErrorHandler,
	})

	server := &Server{
		app:     app,
		config:  cfg,
		storage: storage,
	}

	// Setup middleware
	server.setupMiddleware()

	// Setup routes
	server.setupRoutes()

	return server
}

// setupMiddleware configures middleware
func (s *Server) setupMiddleware() {
	// Recover from panics
	s.app.Use(recover.New())

	// Logger
	s.app.Use(logger.New(logger.Config{
		Format: "${time} | ${status} | ${latency} | ${method} ${path}\n",
	}))

	// CORS
	if s.config.Server.EnableCORS {
		s.app.Use(cors.New(cors.Config{
			AllowOrigins: "*",
			AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
			AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-API-Key",
		}))
	}

	// Compression
	s.app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))

	// Rate limiting
	s.app.Use(limiter.New(limiter.Config{
		Max:        s.config.Security.RateLimit,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Rate limit exceeded",
			})
		},
	}))

	// API Key authentication
	if s.config.Security.APIKey != "" {
		s.app.Use(func(c *fiber.Ctx) error {
			// Skip auth for health check
			if c.Path() == "/health" {
				return c.Next()
			}

			apiKey := c.Get("X-API-Key")
			if apiKey != s.config.Security.APIKey {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error": "Invalid API key",
				})
			}
			return c.Next()
		})
	}
}

// setupRoutes configures routes
func (s *Server) setupRoutes() {
	// Health check
	s.app.Get("/health", s.handleHealth)

	// API routes
	api := s.app.Group("/api/v1")
	
	// Metrics endpoints
	api.Post("/metrics", s.handleMetrics)
	api.Post("/heartbeat", s.handleHeartbeat)
	api.Get("/devices/:deviceId/metrics", s.handleGetMetrics)
	api.Get("/devices/:deviceId/status", s.handleGetStatus)
	
	// Stats endpoints
	api.Get("/stats/devices", s.handleGetDeviceStats)
}

// handleHealth handles health check requests
func (s *Server) handleHealth(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status":  "healthy",
		"service": "monitoring",
		"version": "0.1.0",
	})
}

// handleMetrics handles metrics submission
func (s *Server) handleMetrics(c *fiber.Ctx) error {
	var metrics models.SystemMetrics
	if err := c.BodyParser(&metrics); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Set timestamp if not provided
	if metrics.Timestamp.IsZero() {
		metrics.Timestamp = time.Now()
	}

	// Write to InfluxDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := s.storage.WriteMetrics(ctx, &metrics); err != nil {
		log.WithError(err).Error("Failed to write metrics")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to store metrics",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Metrics stored successfully",
	})
}

// handleHeartbeat handles heartbeat requests
func (s *Server) handleHeartbeat(c *fiber.Ctx) error {
	var heartbeat models.Heartbeat
	if err := c.BodyParser(&heartbeat); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Set timestamp if not provided
	if heartbeat.Timestamp.IsZero() {
		heartbeat.Timestamp = time.Now()
	}

	// Write to InfluxDB
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := s.storage.WriteHeartbeat(ctx, &heartbeat); err != nil {
		log.WithError(err).Error("Failed to write heartbeat")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to store heartbeat",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Heartbeat recorded",
	})
}

// handleGetMetrics retrieves metrics for a device
func (s *Server) handleGetMetrics(c *fiber.Ctx) error {
	deviceID := c.Params("deviceId")
	limit := c.QueryInt("limit", 100)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	metrics, err := s.storage.QueryLatestMetrics(ctx, deviceID, limit)
	if err != nil {
		log.WithError(err).Error("Failed to query metrics")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve metrics",
		})
	}

	return c.JSON(fiber.Map{
		"device_id": deviceID,
		"count":     len(metrics),
		"metrics":   metrics,
	})
}

// handleGetStatus retrieves device status
func (s *Server) handleGetStatus(c *fiber.Ctx) error {
	deviceID := c.Params("deviceId")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	online, err := s.storage.GetDeviceStatus(ctx, deviceID)
	if err != nil {
		log.WithError(err).Error("Failed to get device status")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve status",
		})
	}

	status := "offline"
	if online {
		status = "online"
	}

	return c.JSON(fiber.Map{
		"device_id": deviceID,
		"status":    status,
		"online":    online,
	})
}

// handleGetDeviceStats retrieves device statistics
func (s *Server) handleGetDeviceStats(c *fiber.Ctx) error {
	// TODO: Implement device statistics aggregation
	return c.JSON(fiber.Map{
		"total_devices":   0,
		"online_devices":  0,
		"offline_devices": 0,
	})
}

// Start starts the API server
func (s *Server) Start() error {
	addr := fmt.Sprintf(":%d", s.config.Server.Port)
	log.WithField("address", addr).Info("API server listening")
	return s.app.Listen(addr)
}

// Shutdown gracefully shuts down the server
func (s *Server) Shutdown(ctx context.Context) error {
	return s.app.ShutdownWithContext(ctx)
}

// customErrorHandler handles errors
func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}

	return c.Status(code).JSON(fiber.Map{
		"error":   err.Error(),
		"code":    code,
		"path":    c.Path(),
		"method":  c.Method(),
	})
}

