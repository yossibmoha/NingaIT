package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"gopkg.in/yaml.v3"
)

// Config holds the monitoring service configuration
type Config struct {
	Server   ServerConfig   `yaml:"server"`
	InfluxDB InfluxDBConfig `yaml:"influxdb"`
	Security SecurityConfig `yaml:"security"`
}

// ServerConfig holds server settings
type ServerConfig struct {
	Port            int    `yaml:"port"`
	ReadTimeout     int    `yaml:"read_timeout"`
	WriteTimeout    int    `yaml:"write_timeout"`
	MaxRequestSize  int    `yaml:"max_request_size"`
	EnableCORS      bool   `yaml:"enable_cors"`
	TrustedProxies  []string `yaml:"trusted_proxies"`
}

// InfluxDBConfig holds InfluxDB connection settings
type InfluxDBConfig struct {
	URL             string `yaml:"url"`
	Token           string `yaml:"token"`
	Org             string `yaml:"org"`
	Bucket          string `yaml:"bucket"`
	RetentionDays   int    `yaml:"retention_days"`
	BatchSize       int    `yaml:"batch_size"`
	FlushInterval   int    `yaml:"flush_interval"` // seconds
}

// SecurityConfig holds security settings
type SecurityConfig struct {
	APIKey       string `yaml:"api_key"`
	EnableTLS    bool   `yaml:"enable_tls"`
	TLSCert      string `yaml:"tls_cert"`
	TLSKey       string `yaml:"tls_key"`
	RateLimit    int    `yaml:"rate_limit"` // requests per minute
}

// Load loads configuration from file or environment variables
func Load(configFile string) (*Config, error) {
	// Try to load .env file
	_ = godotenv.Load()

	cfg := &Config{
		Server: ServerConfig{
			Port:            getEnvInt("MONITORING_PORT", 3002),
			ReadTimeout:     getEnvInt("MONITORING_READ_TIMEOUT", 30),
			WriteTimeout:    getEnvInt("MONITORING_WRITE_TIMEOUT", 30),
			MaxRequestSize:  getEnvInt("MONITORING_MAX_REQUEST_SIZE", 10*1024*1024), // 10MB
			EnableCORS:      getEnvBool("MONITORING_ENABLE_CORS", true),
			TrustedProxies:  []string{},
		},
		InfluxDB: InfluxDBConfig{
			URL:           getEnv("INFLUXDB_URL", "http://localhost:8086"),
			Token:         getEnv("INFLUXDB_TOKEN", ""),
			Org:           getEnv("INFLUXDB_ORG", "ninjait"),
			Bucket:        getEnv("INFLUXDB_BUCKET", "metrics"),
			RetentionDays: getEnvInt("INFLUXDB_RETENTION_DAYS", 90),
			BatchSize:     getEnvInt("INFLUXDB_BATCH_SIZE", 100),
			FlushInterval: getEnvInt("INFLUXDB_FLUSH_INTERVAL", 10),
		},
		Security: SecurityConfig{
			APIKey:    getEnv("MONITORING_API_KEY", ""),
			EnableTLS: getEnvBool("MONITORING_ENABLE_TLS", false),
			TLSCert:   getEnv("MONITORING_TLS_CERT", ""),
			TLSKey:    getEnv("MONITORING_TLS_KEY", ""),
			RateLimit: getEnvInt("MONITORING_RATE_LIMIT", 1000),
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
	if c.Server.Port < 1 || c.Server.Port > 65535 {
		return fmt.Errorf("invalid server port: %d", c.Server.Port)
	}
	if c.InfluxDB.URL == "" {
		return fmt.Errorf("InfluxDB URL is required")
	}
	if c.InfluxDB.Token == "" {
		return fmt.Errorf("InfluxDB token is required")
	}
	if c.InfluxDB.Org == "" {
		return fmt.Errorf("InfluxDB organization is required")
	}
	if c.InfluxDB.Bucket == "" {
		return fmt.Errorf("InfluxDB bucket is required")
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

