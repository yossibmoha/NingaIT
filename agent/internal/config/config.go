package config

import (
	"fmt"
	"os"
	"runtime"

	"github.com/joho/godotenv"
	"gopkg.in/yaml.v3"
)

// Config holds the agent configuration
type Config struct {
	Server ServerConfig `yaml:"server"`
	Agent  AgentConfig  `yaml:"agent"`
	Security SecurityConfig `yaml:"security"`
}

// ServerConfig holds server connection details
type ServerConfig struct {
	URL       string `yaml:"url"`
	APIKey    string `yaml:"api_key"`
	WSEnabled bool   `yaml:"ws_enabled"`
}

// AgentConfig holds agent-specific settings
type AgentConfig struct {
	DeviceID          string `yaml:"device_id"`
	Hostname          string `yaml:"hostname"`
	CheckInterval     int    `yaml:"check_interval"`     // seconds
	HeartbeatInterval int    `yaml:"heartbeat_interval"` // seconds
	EnableCPU         bool   `yaml:"enable_cpu"`
	EnableMemory      bool   `yaml:"enable_memory"`
	EnableDisk        bool   `yaml:"enable_disk"`
	EnableNetwork     bool   `yaml:"enable_network"`
	EnableProcesses   bool   `yaml:"enable_processes"`
}

// SecurityConfig holds security settings
type SecurityConfig struct {
	EnableTLS       bool   `yaml:"enable_tls"`
	TLSCert         string `yaml:"tls_cert"`
	TLSKey          string `yaml:"tls_key"`
	VerifySSL       bool   `yaml:"verify_ssl"`
	EncryptMetrics  bool   `yaml:"encrypt_metrics"`
}

// Load loads configuration from file or environment variables
func Load(configFile string) (*Config, error) {
	// Try to load .env file
	_ = godotenv.Load()

	cfg := &Config{
		Server: ServerConfig{
			URL:       getEnv("NINJAIT_SERVER_URL", "http://localhost:3001"),
			APIKey:    getEnv("NINJAIT_API_KEY", ""),
			WSEnabled: getEnvBool("NINJAIT_WS_ENABLED", true),
		},
		Agent: AgentConfig{
			DeviceID:          getEnv("NINJAIT_DEVICE_ID", generateDeviceID()),
			Hostname:          getEnv("NINJAIT_HOSTNAME", getHostname()),
			CheckInterval:     getEnvInt("NINJAIT_CHECK_INTERVAL", 60),
			HeartbeatInterval: getEnvInt("NINJAIT_HEARTBEAT_INTERVAL", 30),
			EnableCPU:         getEnvBool("NINJAIT_ENABLE_CPU", true),
			EnableMemory:      getEnvBool("NINJAIT_ENABLE_MEMORY", true),
			EnableDisk:        getEnvBool("NINJAIT_ENABLE_DISK", true),
			EnableNetwork:     getEnvBool("NINJAIT_ENABLE_NETWORK", true),
			EnableProcesses:   getEnvBool("NINJAIT_ENABLE_PROCESSES", false),
		},
		Security: SecurityConfig{
			EnableTLS:      getEnvBool("NINJAIT_ENABLE_TLS", false),
			TLSCert:        getEnv("NINJAIT_TLS_CERT", ""),
			TLSKey:         getEnv("NINJAIT_TLS_KEY", ""),
			VerifySSL:      getEnvBool("NINJAIT_VERIFY_SSL", true),
			EncryptMetrics: getEnvBool("NINJAIT_ENCRYPT_METRICS", false),
		},
	}

	// Try to load from YAML file if it exists
	if _, err := os.Stat(configFile); err == nil {
		data, err := os.ReadFile(configFile)
		if err != nil {
			return nil, fmt.Errorf("failed to read config file: %w", err)
		}

		if err := yaml.Unmarshal(data, cfg); err != nil {
			return nil, fmt.Errorf("failed to parse config file: %w", err)
		}
	}

	// Validate configuration
	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	return cfg, nil
}

// Validate checks if the configuration is valid
func (c *Config) Validate() error {
	if c.Server.URL == "" {
		return fmt.Errorf("server URL is required")
	}
	if c.Agent.DeviceID == "" {
		return fmt.Errorf("device ID is required")
	}
	if c.Agent.CheckInterval < 10 {
		return fmt.Errorf("check interval must be at least 10 seconds")
	}
	if c.Agent.HeartbeatInterval < 10 {
		return fmt.Errorf("heartbeat interval must be at least 10 seconds")
	}
	return nil
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		var result int
		if _, err := fmt.Sscanf(value, "%d", &result); err == nil {
			return result
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		return value == "true" || value == "1" || value == "yes"
	}
	return defaultValue
}

func getHostname() string {
	hostname, err := os.Hostname()
	if err != nil {
		return "unknown"
	}
	return hostname
}

func generateDeviceID() string {
	hostname := getHostname()
	osType := runtime.GOOS
	return fmt.Sprintf("%s-%s", hostname, osType)
}

