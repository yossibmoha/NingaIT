# NinjaIT - All-in-One IT Management & RMM Platform

<div align="center">

![NinjaIT Logo](docs/images/logo.png)

**Enterprise-grade IT management platform combining RMM, PSA, and AI-powered automation**

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.2.0--alpha-orange.svg)](https://github.com/yossibmoha/NingaIT/releases)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/yossibmoha/NingaIT/actions)
[![Phase 1](https://img.shields.io/badge/Phase%201-Complete%20✅-success.svg)](PHASE_1_FINAL_REPORT.md)
[![Phase 2](https://img.shields.io/badge/Phase%202-Complete%20✅-success.svg)](PHASE_2_FINAL_REPORT.md)
[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](docs/)

[Features](#key-features) • [Architecture](#architecture) • [Getting Started](#getting-started) • [Documentation](#documentation) • [Reports](PHASE_2_FINAL_REPORT.md)

</div>

---

## 🎉 **Phase 2 Complete! Full Foundation Ready**

**Phase 1:** ✅ 10/10 tasks (100%) - Infrastructure & Documentation  
**Phase 2:** ✅ 8/8 tasks (100%) - Core Features & UI  
**Total:** 18/18 tasks (100%) | 16,000+ lines | 37 commits  

**Latest:** [Phase 2 Final Report](PHASE_2_FINAL_REPORT.md) | [Phase 1 Report](PHASE_1_FINAL_REPORT.md)

**What's New in Phase 2:**
- ✅ Complete device management (backend + frontend)
- ✅ Real-time WebSocket communication  
- ✅ Alert system with multi-channel notifications  
- ✅ Script execution with queue management  
- ✅ Enhanced dashboard with real-time charts  
- ✅ User & role management (RBAC)  
- ✅ Comprehensive reporting system  

---

## 🚀 Overview

NinjaIT is a next-generation IT management platform designed for **Managed Service Providers (MSPs), hosting companies, cloud providers, IaaS companies, and IT departments** seeking an integrated, cost-effective, all-in-one solution. It combines industry-leading RMM capabilities with cutting-edge AI automation, advanced customization, and extensive third-party integrations including WHMCS, cPanel, Plesk, and more.

### Why NinjaIT?

- **All-in-One Platform**: RMM + PSA + Billing in a single unified solution
- **Cost-Effective**: Competitive pricing with no hidden fees
- **AI-Powered**: Intelligent automation, predictive maintenance, and smart alerting
- **Modern UI/UX**: Beautiful, intuitive interface built with Ant Design
- **Cross-Platform**: Manage Windows, macOS, Linux, and mobile devices
- **Advanced Automation**: Powerful scripting engine with visual workflow builder
- **Extensive Integrations**: WHMCS, cPanel, Plesk, CloudStack, Proxmox, VMware, and 100+ more
- **Highly Customizable**: API-first design, webhooks, custom branding
- **Enterprise-Ready**: Built for scale with microservices architecture
- **Perfect for Hosting**: Native integration with hosting platforms and billing systems

---

## ✨ Key Features

### 🖥️ Remote Monitoring & Management (RMM)
- Real-time device monitoring (CPU, RAM, disk, network)
- **Multi-platform support**: Windows, macOS, Linux, iOS, Android
- **Cross-platform agent**: Lightweight Go agent for all platforms
- SNMP monitoring for network devices
- Custom monitoring thresholds and alerts
- Performance metrics and trend analysis

### 🔐 Remote Access & Control
- One-click remote desktop access
- Multi-session support
- File transfer capabilities
- Session recording and audit trails
- Wake-on-LAN functionality

### 🔄 Patch Management
- Automated OS patching (Windows, macOS, Linux)
- Third-party application updates (200+ apps)
- Vulnerability management and CVE tracking
- Patch testing and rollback capabilities
- Compliance reporting

### 🛡️ Security & Compliance
- Endpoint Detection & Response (EDR)
- BitLocker and FileVault management
- USB device control
- Security compliance auditing (SOC 2, HIPAA, PCI-DSS)
- Zero Trust security architecture

### 🤖 Automation & Scripting
- AI-powered automation engine
- PowerShell, Bash, Python script support
- Drag-and-drop workflow builder
- Event-based triggers
- Policy-based automation

### 🎫 Professional Services Automation (PSA)
- Full-featured ticketing system
- SLA management
- Time tracking and billing
- Knowledge base
- Customer portal

### 💰 Billing & Financial Management
- Automated invoicing
- Multiple billing models (per-device, per-tech)
- Payment gateway integration
- Contract management
- Expense tracking

### 📊 Reporting & Analytics
- Executive dashboards
- Custom report builder
- Business intelligence
- Performance metrics
- Compliance reporting

### 🧠 AI & Machine Learning
- **AI Copilot/Assistant** (Premium Feature) - Conversational AI for IT support
- Predictive maintenance - Predict device failures before they occur
- Anomaly detection - Identify unusual patterns automatically
- Intelligent ticket routing - AI-powered ticket assignment
- Automated troubleshooting - AI suggests solutions
- Natural language processing - Understand user queries
- Root cause analysis - AI identifies underlying issues

### 🔄 Integration Ecosystem

#### Hosting & Cloud Platforms
- **Billing Systems**: WHMCS (deep integration), Blesta, HostBill
- **Control Panels**: cPanel/WHM, Plesk, DirectAdmin
- **Virtualization**: VMware vSphere, Proxmox VE, KVM, Hyper-V
- **Cloud Platforms**: OpenStack, CloudStack, AWS, Azure, Google Cloud
- **Container Orchestration**: Docker, Kubernetes, Rancher
- **VPS Management**: SolusVM, Virtualizor, OnApp

#### MSP & IT Service Management
- **PSA Platforms**: ConnectWise, Autotask, Kaseya BMS, Syncro
- **Ticketing**: ServiceNow, Freshservice, Jira Service Management
- **Documentation**: IT Glue, Hudu, Confluence, Notion
- **Communication**: Slack, Microsoft Teams, Discord, Mattermost
- **Identity**: Active Directory, Azure AD, Okta, Auth0

#### Security & Monitoring
- **EDR/Antivirus**: CrowdStrike, SentinelOne, Microsoft Defender
- **SIEM**: Splunk, ELK Stack, Graylog
- **Monitoring**: Datadog, New Relic, Prometheus, Grafana
- **Vulnerability**: Tenable, Qualys, Rapid7

---

## 🏗️ Architecture

NinjaIT is built on a modern, scalable microservices architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│     React 18 + TypeScript + Material-UI/Tailwind           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Gateway                          │
│              Load Balancer + Authentication                  │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │  Monitoring │   │   Ticketing │   │  Automation │
    │   Service   │   │   Service   │   │   Service   │
    └─────────────┘   └─────────────┘   └─────────────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  PostgreSQL + Redis + InfluxDB + Elasticsearch              │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend**
- Next.js 14+ (React 18, TypeScript, SSR)
- Ant Design 5+ (Clean, modern enterprise UI)
- Redux Toolkit / Zustand for state management
- WebSocket for real-time updates
- Dark mode support built-in

**Backend (Microservices)**
- **API Gateway**: Fastify (3x faster than Express)
- **High-Performance**: Go (monitoring, alerts, automation)
- **AI/ML**: Python with FastAPI
- **Business Logic**: Node.js/Fastify (ticketing, billing)
- Docker + Kubernetes
- RabbitMQ for event-driven communication

**Agent**
- Go for maximum cross-platform compatibility
- **Supported Platforms**:
  - ✅ Windows 10/11, Server 2016+
  - ✅ macOS 11 (Big Sur) and later
  - ✅ Linux (Ubuntu, CentOS, RHEL, Debian)
  - ✅ Mobile monitoring (iOS/Android)
- Lightweight (<30MB RAM, <2% CPU)
- Auto-update mechanism
- Encrypted communications (TLS 1.3)
- Offline queue for lost connectivity

**Databases**
- PostgreSQL (primary database)
- Dragonfly (high-performance caching, Redis-compatible)
- InfluxDB (time-series metrics)
- ClickHouse (analytics and statistics)
- MongoDB (logs and documents)

**Infrastructure**
- AWS / Azure (multi-cloud)
- Kubernetes (orchestration)
- Prometheus + Grafana (monitoring)
- ELK Stack (logging)

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ or Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Kubernetes (optional, for production)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yossibmoha/NingaIT.git
   cd NingaIT
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the platform**
   - Web UI: http://localhost:3000
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Development Setup

See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed development setup instructions.

---

## 📚 Documentation

### Core Documentation
- **[Development Guide](docs/DEVELOPMENT.md)** - Setup and development workflows
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture and design
- **[Project Plan](docs/PROJECT_PLAN.md)** - 36-month development roadmap
- **[Contributing](docs/CONTRIBUTING.md)** - How to contribute
- **[Roadmap](docs/ROADMAP.md)** - Development roadmap
- **[Changelog](docs/CHANGELOG.md)** - Version history

### Technical Documentation
- **[Tech Stack Decision](docs/TECH_STACK_DECISION.md)** - Framework rationale and benchmarks
- **[UI Design System](docs/UI_DESIGN_SYSTEM.md)** - Ant Design implementation guide
- **[Database Strategy](docs/DATABASE_STRATEGY.md)** - Database architecture
- **[Agent Platform Support](docs/AGENT_PLATFORM_SUPPORT.md)** - Cross-platform agent guide

### Business & Planning
- **[Target Audience](docs/TARGET_AUDIENCE.md)** - Market analysis (8 segments, $7.2B TAM)
- **[AI Copilot Feature](docs/AI_COPILOT_FEATURE.md)** - AI assistant documentation
- **[Deployment Summary](docs/DEPLOYMENT_SUMMARY.md)** - Project deployment overview

### Project Management
- **[GitHub Project Integration](docs/GITHUB_PROJECT_INTEGRATION.md)** - Task tracking with GitHub Projects
- **[GitHub Projects Guide](docs/GITHUB_PROJECTS.md)** - Task management workflows
- **[GitHub Project Setup](docs/GITHUB_PROJECT_SETUP.md)** - Initial setup instructions

---

## 🗺️ Roadmap

### Phase 1: Foundation (Months 1-6) ✅ In Progress
- [x] Core infrastructure setup
- [x] Basic authentication and authorization
- [ ] Device discovery and inventory
- [ ] Simple monitoring (CPU, RAM, disk)
- [ ] Basic alerting system
- [ ] Agent deployment mechanism

### Phase 2: Core RMM (Months 7-12)
- [ ] Advanced monitoring dashboards
- [ ] Multi-platform agent support
- [ ] Remote desktop integration
- [ ] Network discovery and mapping
- [ ] Script library and automation

### Phase 3: PSA & Ticketing (Months 13-18)
- [ ] Complete ticketing system
- [ ] Customer portal
- [ ] Knowledge base
- [ ] Time tracking
- [ ] Basic billing module

### Phase 4: Advanced Features (Months 19-24)
- [ ] Patch management system
- [ ] Vulnerability scanning
- [ ] EDR integration
- [ ] AI-powered alerting
- [ ] Predictive analytics

See [ROADMAP.md](docs/ROADMAP.md) for the complete development plan.

---

## 💼 Business Model

### Pricing Tiers

| Tier | Price/Endpoint | Features |
|------|---------------|----------|
| **Starter** | $2-3/month | Basic RMM, monitoring, alerts, all platforms |
| **Professional** | $4-6/month | RMM + PSA + basic automation + all platforms |
| **Enterprise** | $7-10/month | All features + AI Copilot + all platforms |
| **Custom** | Contact Sales | White-label + dedicated support + priority AI |

### Add-On Features (Optional)
- **AI Copilot/Assistant**: +$2-3/endpoint/month
- **Advanced Backup**: +$1-2/endpoint/month
- **EDR Integration**: +$2-4/endpoint/month
- **Advanced Reporting**: $500-1000/month (flat fee)

### Alternative: Per-Technician Pricing
- Basic: $99-129/technician/month (unlimited endpoints)
- Professional: $149-199/technician/month
- Enterprise: $249-299/technician/month

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

---

## 📊 Project Status

- **Version**: 0.1.0-alpha
- **Status**: Early Development
- **Target Launch**: Q2 2026
- **Current Phase**: Phase 1 - Foundation

### Key Metrics
- Test Coverage: 0% (Target: 80%)
- Code Quality: A (SonarQube)
- Dependencies: Up to date
- Security: 0 known vulnerabilities

---

## 🛡️ Security

Security is our top priority. Please report security vulnerabilities to security@ninjait.io.

- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Authentication**: Multi-factor authentication (MFA)
- **Compliance**: SOC 2 Type II, GDPR, HIPAA ready
- **Auditing**: Complete audit trails

See [SECURITY.md](SECURITY.md) for our security policy.

---

## 📄 License

Copyright © 2025 NinjaIT. All rights reserved.

This project is proprietary software. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Inspired by industry leaders like NinjaOne and Atera
- Built with modern open-source technologies
- Special thanks to our early adopters and beta testers

---

## 📞 Contact & Support

- **Website**: https://ninjait.io
- **Documentation**: https://docs.ninjait.io
- **Support**: support@ninjait.io
- **Sales**: sales@ninjait.io
- **Twitter**: [@NinjaIT](https://twitter.com/ninjait)
- **Discord**: [Join our community](https://discord.gg/ninjait)

---

<div align="center">

**[⬆ back to top](#ninjait---all-in-one-it-management--rmm-platform)**

Made with ❤️ by the NinjaIT Team

</div>

