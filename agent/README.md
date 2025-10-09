# NinjaIT Agent

Cross-platform lightweight monitoring agent for NinjaIT platform. Collects system metrics and sends them to the NinjaIT server.

## 🚀 Features

- ✅ **Cross-Platform**: Windows, Linux, macOS
- ✅ **Lightweight**: Minimal resource usage (~10MB RAM)
- ✅ **Real-time Monitoring**: CPU, Memory, Disk, Network
- ✅ **Secure Communication**: TLS/SSL support
- ✅ **Heartbeat**: Automatic connection health monitoring
- ✅ **WebSocket Support**: Real-time bidirectional communication
- ✅ **Auto-Reconnect**: Resilient connection handling
- ✅ **Configurable**: YAML or environment variables

## 📦 Installation

### From Source

```bash
# Clone repository
git clone https://github.com/yossibmoha/NinjaIT.git
cd NinjaIT/agent

# Download dependencies
go mod download

# Build
make build

# Install (Linux/macOS)
sudo make install
```

### Pre-built Binaries

Download from [Releases](https://github.com/yossibmoha/NinjaIT/releases)

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:

```env
NINJAIT_SERVER_URL=https://your-server.com
NINJAIT_API_KEY=your-api-key
NINJAIT_CHECK_INTERVAL=60
NINJAIT_HEARTBEAT_INTERVAL=30
```

### YAML Configuration

Create `/etc/ninjait/agent.yaml`:

```yaml
server:
  url: https://your-server.com
  api_key: your-api-key
  ws_enabled: true

agent:
  check_interval: 60
  heartbeat_interval: 30
  enable_cpu: true
  enable_memory: true
  enable_disk: true
  enable_network: true
```

## 🏃 Usage

### Run Directly

```bash
./ninjait-agent -config /etc/ninjait/agent.yaml -verbose
```

### As a Service (Linux - systemd)

Create `/etc/systemd/system/ninjait-agent.service`:

```ini
[Unit]
Description=NinjaIT Monitoring Agent
After=network.target

[Service]
Type=simple
User=ninjait
ExecStart=/usr/local/bin/ninjait-agent -config /etc/ninjait/agent.yaml
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable ninjait-agent
sudo systemctl start ninjait-agent
sudo systemctl status ninjait-agent
```

### As a Service (Windows)

Use NSSM or Windows Service wrapper:

```cmd
sc create NinjaITAgent binPath= "C:\Program Files\NinjaIT\ninjait-agent.exe"
sc start NinjaITAgent
```

### As a Service (macOS - launchd)

Create `/Library/LaunchDaemons/com.ninjait.agent.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ninjait.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/ninjait-agent</string>
        <string>-config</string>
        <string>/etc/ninjait/agent.yaml</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load service:

```bash
sudo launchctl load /Library/LaunchDaemons/com.ninjait.agent.plist
```

## 📊 Collected Metrics

### CPU
- Usage percentage (overall and per-core)
- Core count
- Real-time utilization

### Memory
- Total, used, available, free
- Usage percentage
- Swap memory stats

### Disk
- All mounted partitions
- Total, used, free space
- Usage percentage
- Filesystem type

### Network
- Bytes sent/received
- Packets sent/received
- Errors and drops
- Interface statistics

### System Info
- OS and platform details
- Kernel version and architecture
- Hostname
- Uptime and boot time
- Process count

## 🔧 Development

### Build for All Platforms

```bash
make build-all
```

This creates binaries for:
- Linux (amd64)
- Windows (amd64)
- macOS (amd64, arm64)

### Run Tests

```bash
make test
```

### Format Code

```bash
make fmt
```

## 📁 Project Structure

```
agent/
├── cmd/
│   └── ninjait-agent/    # Main entry point
├── internal/
│   ├── config/           # Configuration management
│   ├── monitor/          # System monitoring
│   ├── api/              # API client
│   └── security/         # Security utilities
├── pkg/
│   ├── models/           # Data models
│   └── utils/            # Utilities
├── Makefile              # Build automation
├── go.mod                # Go dependencies
└── README.md
```

## 🔐 Security

- TLS/SSL support for encrypted communication
- API key authentication
- Optional metric encryption
- Secure credential storage
- No sensitive data logging

## 📝 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `server.url` | string | - | Server URL |
| `server.api_key` | string | - | API authentication key |
| `server.ws_enabled` | bool | true | Enable WebSocket |
| `agent.device_id` | string | auto | Unique device identifier |
| `agent.check_interval` | int | 60 | Metrics collection interval (seconds) |
| `agent.heartbeat_interval` | int | 30 | Heartbeat interval (seconds) |
| `agent.enable_cpu` | bool | true | Enable CPU monitoring |
| `agent.enable_memory` | bool | true | Enable memory monitoring |
| `agent.enable_disk` | bool | true | Enable disk monitoring |
| `agent.enable_network` | bool | true | Enable network monitoring |

## 🐛 Troubleshooting

### Agent Won't Start

```bash
# Check configuration
./ninjait-agent -config agent.yaml -verbose

# Check server connectivity
curl -I https://your-server.com/health
```

### High CPU Usage

Increase `check_interval` to reduce monitoring frequency:

```yaml
agent:
  check_interval: 120  # Check every 2 minutes
```

### Connection Issues

1. Verify server URL is correct
2. Check firewall settings
3. Ensure API key is valid
4. Check server logs

## 📜 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## 📞 Support

- Documentation: https://docs.ninjait.io
- Issues: https://github.com/yossibmoha/NinjaIT/issues
- Discord: https://discord.gg/ninjait
