package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/yossibmoha/NinjaIT/agent/internal/config"
	"github.com/yossibmoha/NinjaIT/agent/internal/monitor"
	"github.com/yossibmoha/NinjaIT/agent/internal/api"
	log "github.com/sirupsen/logrus"
)

const (
	Version = "0.1.0"
	AppName = "NinjaIT Agent"
)

func main() {
	// Parse command line flags
	configFile := flag.String("config", "/etc/ninjait/agent.yaml", "Path to configuration file")
	verbose := flag.Bool("verbose", false, "Enable verbose logging")
	version := flag.Bool("version", false, "Print version and exit")
	flag.Parse()

	// Print version
	if *version {
		fmt.Printf("%s v%s\n", AppName, Version)
		os.Exit(0)
	}

	// Initialize logger
	log.SetFormatter(&log.JSONFormatter{})
	log.SetOutput(os.Stdout)
	if *verbose {
		log.SetLevel(log.DebugLevel)
	} else {
		log.SetLevel(log.InfoLevel)
	}

	log.WithFields(log.Fields{
		"version": Version,
		"app":     AppName,
	}).Info("Starting NinjaIT Agent")

	// Load configuration
	cfg, err := config.Load(*configFile)
	if err != nil {
		log.WithError(err).Fatal("Failed to load configuration")
	}

	log.WithFields(log.Fields{
		"server_url":     cfg.Server.URL,
		"device_id":      cfg.Agent.DeviceID,
		"hostname":       cfg.Agent.Hostname,
		"check_interval": cfg.Agent.CheckInterval,
	}).Info("Configuration loaded")

	// Create context for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup signal handling for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	// Initialize components
	var wg sync.WaitGroup

	// Initialize API client
	apiClient := api.NewClient(cfg)
	if err := apiClient.Connect(ctx); err != nil {
		log.WithError(err).Fatal("Failed to connect to server")
	}
	defer apiClient.Close()

	log.Info("Connected to NinjaIT server")

	// Initialize system monitor
	sysMonitor := monitor.NewSystemMonitor(cfg, apiClient)

	// Start heartbeat goroutine
	wg.Add(1)
	go func() {
		defer wg.Done()
		runHeartbeat(ctx, apiClient, cfg)
	}()

	// Start monitoring goroutine
	wg.Add(1)
	go func() {
		defer wg.Done()
		runMonitoring(ctx, sysMonitor, cfg)
	}()

	log.Info("Agent is running. Press Ctrl+C to stop.")

	// Wait for shutdown signal
	<-sigChan
	log.Info("Shutdown signal received, stopping agent...")

	// Cancel context to stop all goroutines
	cancel()

	// Wait for all goroutines to finish (with timeout)
	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		log.Info("Agent stopped gracefully")
	case <-time.After(10 * time.Second):
		log.Warn("Forced shutdown after timeout")
	}
}

// runHeartbeat sends periodic heartbeat to server
func runHeartbeat(ctx context.Context, client *api.Client, cfg *config.Config) {
	ticker := time.NewTicker(time.Duration(cfg.Agent.HeartbeatInterval) * time.Second)
	defer ticker.Stop()

	log.Info("Heartbeat started")

	for {
		select {
		case <-ctx.Done():
			log.Info("Heartbeat stopped")
			return
		case <-ticker.C:
			if err := client.SendHeartbeat(); err != nil {
				log.WithError(err).Error("Failed to send heartbeat")
			} else {
				log.Debug("Heartbeat sent successfully")
			}
		}
	}
}

// runMonitoring collects and sends system metrics
func runMonitoring(ctx context.Context, mon *monitor.SystemMonitor, cfg *config.Config) {
	ticker := time.NewTicker(time.Duration(cfg.Agent.CheckInterval) * time.Second)
	defer ticker.Stop()

	log.Info("System monitoring started")

	// Send initial metrics immediately
	if err := mon.CollectAndSend(); err != nil {
		log.WithError(err).Error("Failed to collect initial metrics")
	}

	for {
		select {
		case <-ctx.Done():
			log.Info("System monitoring stopped")
			return
		case <-ticker.C:
			if err := mon.CollectAndSend(); err != nil {
				log.WithError(err).Error("Failed to collect metrics")
			} else {
				log.Debug("Metrics collected and sent successfully")
			}
		}
	}
}

