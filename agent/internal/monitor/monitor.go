package monitor

import (
	"fmt"
	"runtime"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
	"github.com/yossibmoha/NinjaIT/agent/internal/api"
	"github.com/yossibmoha/NinjaIT/agent/internal/config"
	"github.com/yossibmoha/NinjaIT/agent/pkg/models"
	log "github.com/sirupsen/logrus"
)

// SystemMonitor collects system metrics
type SystemMonitor struct {
	config    *config.Config
	apiClient *api.Client
}

// NewSystemMonitor creates a new system monitor
func NewSystemMonitor(cfg *config.Config, client *api.Client) *SystemMonitor {
	return &SystemMonitor{
		config:    cfg,
		apiClient: client,
	}
}

// CollectAndSend collects system metrics and sends them to the server
func (m *SystemMonitor) CollectAndSend() error {
	log.Debug("Collecting system metrics")

	metrics := &models.SystemMetrics{
		Timestamp: time.Now(),
		DeviceID:  m.config.Agent.DeviceID,
		Hostname:  m.config.Agent.Hostname,
	}

	// Collect CPU metrics
	if m.config.Agent.EnableCPU {
		if cpuMetrics, err := m.collectCPU(); err != nil {
			log.WithError(err).Warn("Failed to collect CPU metrics")
		} else {
			metrics.CPU = cpuMetrics
		}
	}

	// Collect memory metrics
	if m.config.Agent.EnableMemory {
		if memMetrics, err := m.collectMemory(); err != nil {
			log.WithError(err).Warn("Failed to collect memory metrics")
		} else {
			metrics.Memory = memMetrics
		}
	}

	// Collect disk metrics
	if m.config.Agent.EnableDisk {
		if diskMetrics, err := m.collectDisk(); err != nil {
			log.WithError(err).Warn("Failed to collect disk metrics")
		} else {
			metrics.Disks = diskMetrics
		}
	}

	// Collect network metrics
	if m.config.Agent.EnableNetwork {
		if netMetrics, err := m.collectNetwork(); err != nil {
			log.WithError(err).Warn("Failed to collect network metrics")
		} else {
			metrics.Network = netMetrics
		}
	}

	// Collect system info
	if sysInfo, err := m.collectSystemInfo(); err != nil {
		log.WithError(err).Warn("Failed to collect system info")
	} else {
		metrics.System = sysInfo
	}

	// Send metrics to server
	if err := m.apiClient.SendMetrics(metrics); err != nil {
		return fmt.Errorf("failed to send metrics: %w", err)
	}

	log.WithFields(log.Fields{
		"cpu_usage":    fmt.Sprintf("%.2f%%", metrics.CPU.UsagePercent),
		"memory_usage": fmt.Sprintf("%.2f%%", metrics.Memory.UsedPercent),
		"disk_count":   len(metrics.Disks),
	}).Debug("Metrics sent successfully")

	return nil
}

// collectCPU collects CPU metrics
func (m *SystemMonitor) collectCPU() (*models.CPUMetrics, error) {
	// Get CPU usage percentage
	percentages, err := cpu.Percent(time.Second, false)
	if err != nil {
		return nil, err
	}

	// Get CPU core count
	cores, err := cpu.Counts(true)
	if err != nil {
		cores = runtime.NumCPU()
	}

	var usage float64
	if len(percentages) > 0 {
		usage = percentages[0]
	}

	// Get per-core usage
	perCoreUsage, _ := cpu.Percent(time.Second, true)

	return &models.CPUMetrics{
		UsagePercent: usage,
		Cores:        cores,
		PerCore:      perCoreUsage,
	}, nil
}

// collectMemory collects memory metrics
func (m *SystemMonitor) collectMemory() (*models.MemoryMetrics, error) {
	vmStat, err := mem.VirtualMemory()
	if err != nil {
		return nil, err
	}

	swapStat, err := mem.SwapMemory()
	if err != nil {
		return nil, err
	}

	return &models.MemoryMetrics{
		Total:       vmStat.Total,
		Available:   vmStat.Available,
		Used:        vmStat.Used,
		UsedPercent: vmStat.UsedPercent,
		Free:        vmStat.Free,
		SwapTotal:   swapStat.Total,
		SwapUsed:    swapStat.Used,
		SwapFree:    swapStat.Free,
	}, nil
}

// collectDisk collects disk metrics
func (m *SystemMonitor) collectDisk() ([]models.DiskMetrics, error) {
	partitions, err := disk.Partitions(false)
	if err != nil {
		return nil, err
	}

	var disks []models.DiskMetrics
	for _, partition := range partitions {
		usage, err := disk.Usage(partition.Mountpoint)
		if err != nil {
			log.WithError(err).WithField("mountpoint", partition.Mountpoint).Warn("Failed to get disk usage")
			continue
		}

		disks = append(disks, models.DiskMetrics{
			Device:      partition.Device,
			Mountpoint:  partition.Mountpoint,
			FsType:      partition.Fstype,
			Total:       usage.Total,
			Used:        usage.Used,
			Free:        usage.Free,
			UsedPercent: usage.UsedPercent,
		})
	}

	return disks, nil
}

// collectNetwork collects network metrics
func (m *SystemMonitor) collectNetwork() (*models.NetworkMetrics, error) {
	counters, err := net.IOCounters(false)
	if err != nil {
		return nil, err
	}

	if len(counters) == 0 {
		return &models.NetworkMetrics{}, nil
	}

	counter := counters[0]

	return &models.NetworkMetrics{
		BytesSent:   counter.BytesSent,
		BytesRecv:   counter.BytesRecv,
		PacketsSent: counter.PacketsSent,
		PacketsRecv: counter.PacketsRecv,
		ErrorsIn:    counter.Errin,
		ErrorsOut:   counter.Errout,
		DropsIn:     counter.Dropin,
		DropsOut:    counter.Dropout,
	}, nil
}

// collectSystemInfo collects system information
func (m *SystemMonitor) collectSystemInfo() (*models.SystemInfo, error) {
	info, err := host.Info()
	if err != nil {
		return nil, err
	}

	bootTime := time.Unix(int64(info.BootTime), 0)
	uptime := time.Since(bootTime)

	return &models.SystemInfo{
		OS:              info.OS,
		Platform:        info.Platform,
		PlatformVersion: info.PlatformVersion,
		KernelVersion:   info.KernelVersion,
		KernelArch:      info.KernelArch,
		Hostname:        info.Hostname,
		Uptime:          int64(uptime.Seconds()),
		BootTime:        bootTime,
		NumProcs:        runtime.NumCPU(),
	}, nil
}

