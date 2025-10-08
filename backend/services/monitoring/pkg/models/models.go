package models

import "time"

// SystemMetrics represents collected system metrics
type SystemMetrics struct {
	Timestamp time.Time       `json:"timestamp"`
	DeviceID  string          `json:"device_id"`
	Hostname  string          `json:"hostname"`
	CPU       *CPUMetrics     `json:"cpu,omitempty"`
	Memory    *MemoryMetrics  `json:"memory,omitempty"`
	Disks     []DiskMetrics   `json:"disks,omitempty"`
	Network   *NetworkMetrics `json:"network,omitempty"`
	System    *SystemInfo     `json:"system,omitempty"`
}

// CPUMetrics represents CPU metrics
type CPUMetrics struct {
	UsagePercent float64   `json:"usage_percent"`
	Cores        int       `json:"cores"`
	PerCore      []float64 `json:"per_core,omitempty"`
}

// MemoryMetrics represents memory metrics
type MemoryMetrics struct {
	Total       uint64  `json:"total"`
	Available   uint64  `json:"available"`
	Used        uint64  `json:"used"`
	UsedPercent float64 `json:"used_percent"`
	Free        uint64  `json:"free"`
	SwapTotal   uint64  `json:"swap_total"`
	SwapUsed    uint64  `json:"swap_used"`
	SwapFree    uint64  `json:"swap_free"`
}

// DiskMetrics represents disk metrics
type DiskMetrics struct {
	Device      string  `json:"device"`
	Mountpoint  string  `json:"mountpoint"`
	FsType      string  `json:"fs_type"`
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"used_percent"`
}

// NetworkMetrics represents network metrics
type NetworkMetrics struct {
	BytesSent   uint64 `json:"bytes_sent"`
	BytesRecv   uint64 `json:"bytes_recv"`
	PacketsSent uint64 `json:"packets_sent"`
	PacketsRecv uint64 `json:"packets_recv"`
	ErrorsIn    uint64 `json:"errors_in"`
	ErrorsOut   uint64 `json:"errors_out"`
	DropsIn     uint64 `json:"drops_in"`
	DropsOut    uint64 `json:"drops_out"`
}

// SystemInfo represents system information
type SystemInfo struct {
	OS              string    `json:"os"`
	Platform        string    `json:"platform"`
	PlatformVersion string    `json:"platform_version"`
	KernelVersion   string    `json:"kernel_version"`
	KernelArch      string    `json:"kernel_arch"`
	Hostname        string    `json:"hostname"`
	Uptime          int64     `json:"uptime"`
	BootTime        time.Time `json:"boot_time"`
	NumProcs        int       `json:"num_procs"`
}

// Heartbeat represents a heartbeat message
type Heartbeat struct {
	DeviceID  string    `json:"device_id"`
	Hostname  string    `json:"hostname"`
	Timestamp time.Time `json:"timestamp"`
	Status    string    `json:"status"`
	Version   string    `json:"version"`
}

