package storage

import (
	"context"
	"fmt"
	"time"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"github.com/yossibmoha/NinjaIT/backend/services/monitoring/internal/config"
	"github.com/yossibmoha/NinjaIT/backend/services/monitoring/pkg/models"
	log "github.com/sirupsen/logrus"
)

// InfluxDBStorage handles metric storage in InfluxDB
type InfluxDBStorage struct {
	client   influxdb2.Client
	writeAPI api.WriteAPIBlocking
	queryAPI api.QueryAPI
	config   *config.Config
}

// NewInfluxDBStorage creates a new InfluxDB storage instance
func NewInfluxDBStorage(cfg *config.Config) (*InfluxDBStorage, error) {
	// Create InfluxDB client
	client := influxdb2.NewClient(cfg.InfluxDB.URL, cfg.InfluxDB.Token)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	health, err := client.Health(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to InfluxDB: %w", err)
	}

	if health.Status != "pass" {
		return nil, fmt.Errorf("InfluxDB health check failed: %s", health.Status)
	}

	// Get write API
	writeAPI := client.WriteAPIBlocking(cfg.InfluxDB.Org, cfg.InfluxDB.Bucket)

	// Get query API
	queryAPI := client.QueryAPI(cfg.InfluxDB.Org)

	log.WithFields(log.Fields{
		"url":    cfg.InfluxDB.URL,
		"org":    cfg.InfluxDB.Org,
		"bucket": cfg.InfluxDB.Bucket,
	}).Info("Connected to InfluxDB")

	return &InfluxDBStorage{
		client:   client,
		writeAPI: writeAPI,
		queryAPI: queryAPI,
		config:   cfg,
	}, nil
}

// Close closes the InfluxDB connection
func (s *InfluxDBStorage) Close() {
	if s.client != nil {
		s.client.Close()
	}
}

// WriteMetrics writes system metrics to InfluxDB
func (s *InfluxDBStorage) WriteMetrics(ctx context.Context, metrics *models.SystemMetrics) error {
	points := []*influxdb2.Point{}

	// CPU metrics
	if metrics.CPU != nil {
		p := influxdb2.NewPoint(
			"cpu",
			map[string]string{
				"device_id": metrics.DeviceID,
				"hostname":  metrics.Hostname,
			},
			map[string]interface{}{
				"usage_percent": metrics.CPU.UsagePercent,
				"cores":         metrics.CPU.Cores,
			},
			metrics.Timestamp,
		)
		points = append(points, p)
	}

	// Memory metrics
	if metrics.Memory != nil {
		p := influxdb2.NewPoint(
			"memory",
			map[string]string{
				"device_id": metrics.DeviceID,
				"hostname":  metrics.Hostname,
			},
			map[string]interface{}{
				"total":        metrics.Memory.Total,
				"available":    metrics.Memory.Available,
				"used":         metrics.Memory.Used,
				"used_percent": metrics.Memory.UsedPercent,
				"free":         metrics.Memory.Free,
				"swap_total":   metrics.Memory.SwapTotal,
				"swap_used":    metrics.Memory.SwapUsed,
			},
			metrics.Timestamp,
		)
		points = append(points, p)
	}

	// Disk metrics
	for _, disk := range metrics.Disks {
		p := influxdb2.NewPoint(
			"disk",
			map[string]string{
				"device_id":  metrics.DeviceID,
				"hostname":   metrics.Hostname,
				"device":     disk.Device,
				"mountpoint": disk.Mountpoint,
				"fs_type":    disk.FsType,
			},
			map[string]interface{}{
				"total":        disk.Total,
				"used":         disk.Used,
				"free":         disk.Free,
				"used_percent": disk.UsedPercent,
			},
			metrics.Timestamp,
		)
		points = append(points, p)
	}

	// Network metrics
	if metrics.Network != nil {
		p := influxdb2.NewPoint(
			"network",
			map[string]string{
				"device_id": metrics.DeviceID,
				"hostname":  metrics.Hostname,
			},
			map[string]interface{}{
				"bytes_sent":   metrics.Network.BytesSent,
				"bytes_recv":   metrics.Network.BytesRecv,
				"packets_sent": metrics.Network.PacketsSent,
				"packets_recv": metrics.Network.PacketsRecv,
				"errors_in":    metrics.Network.ErrorsIn,
				"errors_out":   metrics.Network.ErrorsOut,
			},
			metrics.Timestamp,
		)
		points = append(points, p)
	}

	// System info
	if metrics.System != nil {
		p := influxdb2.NewPoint(
			"system",
			map[string]string{
				"device_id": metrics.DeviceID,
				"hostname":  metrics.Hostname,
				"os":        metrics.System.OS,
				"platform":  metrics.System.Platform,
			},
			map[string]interface{}{
				"uptime":    metrics.System.Uptime,
				"num_procs": metrics.System.NumProcs,
			},
			metrics.Timestamp,
		)
		points = append(points, p)
	}

	// Write all points
	if err := s.writeAPI.WritePoint(ctx, points...); err != nil {
		return fmt.Errorf("failed to write metrics: %w", err)
	}

	log.WithFields(log.Fields{
		"device_id": metrics.DeviceID,
		"hostname":  metrics.Hostname,
		"points":    len(points),
	}).Debug("Metrics written to InfluxDB")

	return nil
}

// WriteHeartbeat writes a heartbeat event to InfluxDB
func (s *InfluxDBStorage) WriteHeartbeat(ctx context.Context, heartbeat *models.Heartbeat) error {
	p := influxdb2.NewPoint(
		"heartbeat",
		map[string]string{
			"device_id": heartbeat.DeviceID,
			"hostname":  heartbeat.Hostname,
			"status":    heartbeat.Status,
			"version":   heartbeat.Version,
		},
		map[string]interface{}{
			"online": heartbeat.Status == "online",
		},
		heartbeat.Timestamp,
	)

	if err := s.writeAPI.WritePoint(ctx, p); err != nil {
		return fmt.Errorf("failed to write heartbeat: %w", err)
	}

	log.WithFields(log.Fields{
		"device_id": heartbeat.DeviceID,
		"status":    heartbeat.Status,
	}).Debug("Heartbeat written to InfluxDB")

	return nil
}

// QueryLatestMetrics queries the latest metrics for a device
func (s *InfluxDBStorage) QueryLatestMetrics(ctx context.Context, deviceID string, limit int) ([]map[string]interface{}, error) {
	query := fmt.Sprintf(`
		from(bucket: "%s")
		  |> range(start: -1h)
		  |> filter(fn: (r) => r["device_id"] == "%s")
		  |> limit(n: %d)
	`, s.config.InfluxDB.Bucket, deviceID, limit)

	result, err := s.queryAPI.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query metrics: %w", err)
	}
	defer result.Close()

	var metrics []map[string]interface{}
	for result.Next() {
		record := result.Record()
		metrics = append(metrics, record.Values())
	}

	if result.Err() != nil {
		return nil, fmt.Errorf("query error: %w", result.Err())
	}

	return metrics, nil
}

// GetDeviceStatus checks if a device is online based on recent heartbeats
func (s *InfluxDBStorage) GetDeviceStatus(ctx context.Context, deviceID string) (bool, error) {
	query := fmt.Sprintf(`
		from(bucket: "%s")
		  |> range(start: -5m)
		  |> filter(fn: (r) => r["_measurement"] == "heartbeat")
		  |> filter(fn: (r) => r["device_id"] == "%s")
		  |> last()
	`, s.config.InfluxDB.Bucket, deviceID)

	result, err := s.queryAPI.Query(ctx, query)
	if err != nil {
		return false, fmt.Errorf("failed to query device status: %w", err)
	}
	defer result.Close()

	if result.Next() {
		record := result.Record()
		if online, ok := record.Value().(bool); ok {
			return online, nil
		}
	}

	// No recent heartbeat = offline
	return false, nil
}

