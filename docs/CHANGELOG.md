# Changelog

All notable changes to NinjaIT will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure
- Project documentation (README, ARCHITECTURE, ROADMAP, DEVELOPMENT)
- GitHub templates (bug report, feature request, pull request)
- CI/CD pipeline configuration
- Docker Compose setup for local development
- Environment configuration template
- **Dragonfly** integration (Redis-compatible, high-performance caching)
- **ClickHouse** integration (analytics and statistics database)
- **TARGET_AUDIENCE.md** - Comprehensive target market documentation
- **AI_COPILOT_FEATURE.md** - AI Copilot feature documentation
- **AGENT_PLATFORM_SUPPORT.md** - Cross-platform agent support documentation
- **TECH_STACK_DECISION.md** - Technology stack rationale and benchmarks
- **UI_DESIGN_SYSTEM.md** - Ant Design implementation guide
- **DATABASE_STRATEGY.md** - Database architecture strategy

### Changed
- **Database Stack**: Replaced Redis with Dragonfly for improved performance
- **Analytics Stack**: Added ClickHouse for statistics and analytics
- **Frontend**: Updated to Next.js 14+ with Ant Design 5+ (exclusive UI framework)
- **API Gateway**: Changed to Fastify for 3x better performance
- **Backend Services**: Updated to use Go for high-performance microservices, Python for AI/ML
- **README.md**: Expanded target audience to include MSPs, hosting companies, cloud providers, IaaS, WHMCS users
- **PROJECT_PLAN.md**: Updated target markets and deliverables
- **ARCHITECTURE.md**: Updated to reflect new tech stack and database choices
- **DEVELOPMENT.md**: Updated setup instructions for Dragonfly and ClickHouse
- **docker-compose.yml**: Added Dragonfly, ClickHouse, and management UI services

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

---

## [0.1.0-alpha] - 2025-10-08

### Added
- Project initialization
- Core documentation
- Development environment setup
- GitHub project configuration

---

## Release Types

- **Major**: Breaking changes that require migration
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, backward compatible

## Version Format

Format: `MAJOR.MINOR.PATCH[-PRERELEASE]`

Examples:
- `1.0.0` - Production release
- `1.0.0-beta.1` - Beta release
- `1.0.0-alpha.1` - Alpha release
- `1.0.0-rc.1` - Release candidate

---

## Future Releases

### [0.2.0] - Phase 1: Foundation (Target: Q1 2026)
- User authentication and authorization
- Basic device discovery and inventory
- Simple monitoring (CPU, RAM, Disk)
- Basic alerting system
- Windows agent MVP
- Admin dashboard UI

### [0.3.0] - Phase 2: Core RMM (Target: Q3 2026)
- Advanced monitoring dashboards
- Multi-platform agents (Windows, macOS, Linux)
- Remote desktop integration
- Network discovery and mapping
- Script library and automation
- SNMP monitoring

### [1.0.0] - Public Launch (Target: Q2 2027)
- Complete RMM feature set
- PSA and ticketing system
- Time tracking and billing
- Customer portal
- Knowledge base
- Mobile apps (basic)

---

[Unreleased]: https://github.com/yossibmoha/NinjaIT/compare/v0.1.0-alpha...HEAD
[0.1.0-alpha]: https://github.com/yossibmoha/NinjaIT/releases/tag/v0.1.0-alpha

