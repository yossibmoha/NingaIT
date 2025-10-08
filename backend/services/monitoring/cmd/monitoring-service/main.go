package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/yossibmoha/NingaIT/backend/services/monitoring/internal/api"
	"github.com/yossibmoha/NingaIT/backend/services/monitoring/internal/config"
	"github.com/yossibmoha/NingaIT/backend/services/monitoring/internal/storage"
	log "github.com/sirupsen/logrus"
)

const (
	Version = "0.1.0"
	AppName = "NinjaIT Monitoring Service"
)

func main() {
	// Parse command line flags
	configFile := flag.String("config", "config.yaml", "Path to configuration file")
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
	}).Info("Starting Monitoring Service")

	// Load configuration
	cfg, err := config.Load(*configFile)
	if err != nil {
		log.WithError(err).Fatal("Failed to load configuration")
	}

	log.WithFields(log.Fields{
		"port":         cfg.Server.Port,
		"influxdb_url": cfg.InfluxDB.URL,
		"bucket":       cfg.InfluxDB.Bucket,
	}).Info("Configuration loaded")

	// Create context for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialize InfluxDB storage
	influxStorage, err := storage.NewInfluxDBStorage(cfg)
	if err != nil {
		log.WithError(err).Fatal("Failed to initialize InfluxDB storage")
	}
	defer influxStorage.Close()

	log.Info("InfluxDB storage initialized")

	// Initialize API server
	apiServer := api.NewServer(cfg, influxStorage)

	// Start API server in goroutine
	go func() {
		log.WithField("port", cfg.Server.Port).Info("Starting API server")
		if err := apiServer.Start(); err != nil {
			log.WithError(err).Fatal("API server failed")
		}
	}()

	// Wait for interrupt signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)
	<-sigChan

	log.Info("Shutdown signal received, stopping service...")

	// Cancel context
	cancel()

	// Graceful shutdown of API server
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := apiServer.Shutdown(shutdownCtx); err != nil {
		log.WithError(err).Error("API server shutdown error")
	}

	log.Info("Monitoring service stopped")
}

