# NinjaIT Agent

Cross-platform agent software for endpoint monitoring and management.

## Tech Stack

- **Language**: Go 1.21+
- **Platforms**: Windows, macOS, Linux
- **Build**: Go build with cross-compilation

## Features

- Device monitoring (CPU, RAM, disk, network)
- Remote command execution
- Secure communication with backend
- Auto-update mechanism
- Lightweight (<50MB RAM)

## Building

### Prerequisites

- Go 1.21 or later
- Make (optional)

### Build for all platforms

```bash
# Build for current platform
go build -o bin/ninjait-agent ./cmd/agent

# Build for all platforms
make build-all

# Or manually:
GOOS=windows GOARCH=amd64 go build -o bin/ninjait-agent-windows-amd64.exe ./cmd/agent
GOOS=darwin GOARCH=amd64 go build -o bin/ninjait-agent-darwin-amd64 ./cmd/agent
GOOS=darwin GOARCH=arm64 go build -o bin/ninjait-agent-darwin-arm64 ./cmd/agent
GOOS=linux GOARCH=amd64 go build -o bin/ninjait-agent-linux-amd64 ./cmd/agent
```

## Installation

### Windows

```powershell
# Download and run installer
.\ninjait-agent-setup.msi

# Or manual installation
.\ninjait-agent.exe install
.\ninjait-agent.exe start
```

### macOS

```bash
# Install via package
sudo installer -pkg ninjait-agent.pkg -target /

# Or manual installation
sudo ./ninjait-agent install
sudo ./ninjait-agent start
```

### Linux

```bash
# Debian/Ubuntu
sudo dpkg -i ninjait-agent.deb
sudo systemctl start ninjait-agent

# RedHat/CentOS
sudo rpm -i ninjait-agent.rpm
sudo systemctl start ninjait-agent

# Or manual installation
sudo ./ninjait-agent install
sudo systemctl start ninjait-agent
```

## Configuration

Edit `/etc/ninjait/agent.conf` (Linux/Mac) or `C:\ProgramData\NinjaIT\agent.conf` (Windows):

```yaml
server_url: https://api.ninjait.io
api_key: your-api-key-here
device_id: auto-generated
heartbeat_interval: 30
metrics_interval: 60
log_level: info
```

## Development

```bash
# Install dependencies
go mod download

# Run locally
go run ./cmd/agent

# Run tests
go test -v ./...

# Run with race detection
go test -race ./...

# Generate coverage report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

## Project Structure

```
agent/
├── cmd/
│   └── agent/         # Main entry point
├── internal/
│   ├── config/        # Configuration
│   ├── monitor/       # Monitoring modules
│   ├── executor/      # Command executor
│   ├── updater/       # Auto-updater
│   └── api/           # API client
├── pkg/               # Public libraries
│   ├── logger/        # Logging
│   └── utils/         # Utilities
├── build/             # Build scripts
├── go.mod
└── go.sum
```

## Uninstallation

### Windows

```powershell
.\ninjait-agent.exe stop
.\ninjait-agent.exe uninstall
```

### macOS/Linux

```bash
sudo systemctl stop ninjait-agent
sudo ./ninjait-agent uninstall
```

## Logs

- **Windows**: `C:\ProgramData\NinjaIT\logs\agent.log`
- **macOS**: `/var/log/ninjait/agent.log`
- **Linux**: `/var/log/ninjait/agent.log`

## Troubleshooting

### Agent not connecting

1. Check network connectivity
2. Verify API endpoint in configuration
3. Check firewall rules (port 443 outbound)
4. Review agent logs

### High CPU usage

1. Check metrics_interval in configuration
2. Review monitoring modules enabled
3. Update to latest version

## Security

- All communication is encrypted (TLS 1.3)
- API keys are stored securely
- Agent runs with minimal privileges
- Auto-update with signature verification

