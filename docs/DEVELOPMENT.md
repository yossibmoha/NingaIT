# Development Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Git Workflow](#git-workflow)
7. [CI/CD](#cicd)
8. [Debugging](#debugging)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn** (latest version)
- **Docker** 20+ and **Docker Compose** 2+
- **PostgreSQL** 15+ (or use Docker)
- **Redis** 7+
- **Git** 2.30+
- **IDE**: VS Code, WebStorm, or your preferred editor

### Optional Tools
- **Kubernetes** (for local development with Minikube/Kind)
- **Postman** or **Insomnia** (API testing)
- **TablePlus** or **pgAdmin** (database GUI)

---

## Development Environment

### 1. Clone the Repository

```bash
git clone https://github.com/yossibmoha/NingaIT.git
cd NingaIT
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your local configuration:

```env
# Application
NODE_ENV=development
APP_PORT=8000
APP_URL=http://localhost:8000

# Database
DATABASE_URL=postgresql://ninjait:password@localhost:5432/ninjait_dev
DRAGONFLY_URL=redis://localhost:6379
REDIS_URL=redis://localhost:6379  # Dragonfly is Redis-compatible
INFLUXDB_URL=http://localhost:8086
CLICKHOUSE_URL=http://localhost:8123
MONGODB_URL=mongodb://localhost:27017/ninjait

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h

# Email (Development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@ninjait.local

# AWS (Optional for local dev)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=ninjait-dev

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_BILLING=false
```

### 3. Start Services with Docker

```bash
# Start all services
docker-compose up -d

# Or start specific services
docker-compose up -d postgres dragonfly influxdb clickhouse mongodb
```

### 4. Install Dependencies

#### Backend
```bash
cd backend
npm install
# or
yarn install
```

#### Frontend
```bash
cd frontend
npm install
# or
yarn install
```

#### Agent (if working on agent)
```bash
cd agent
# For Go
go mod download

# For Rust
cargo build
```

### 5. Database Setup

```bash
# Run migrations
cd backend
npm run migrate

# Seed database with sample data
npm run seed
```

### 6. Start Development Servers

#### Backend
```bash
cd backend
npm run dev
# Backend will run on http://localhost:8000
```

#### Frontend
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:3000
```

#### Full Stack (with Concurrently)
```bash
# From root directory
npm run dev:all
```

### 7. Verify Installation

- Open http://localhost:3000 in your browser
- Login with default credentials:
  - Email: `admin@ninjait.local`
  - Password: `admin123` (change in production!)

### 8. Access Management UIs

- **Adminer** (PostgreSQL): http://localhost:8080
- **RedisInsight** (Dragonfly): http://localhost:8001
- **MailHog** (Email testing): http://localhost:8025
- **RabbitMQ**: http://localhost:15672
- **ClickHouse UI** (Tabix): http://localhost:8082

---

## Project Structure

```
NinjaIT/
├── .github/                 # GitHub Actions, issue templates
├── backend/                 # Backend API services
│   ├── src/
│   │   ├── api/            # API routes
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Helper functions
│   │   ├── config/         # Configuration files
│   │   └── tests/          # Backend tests
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React frontend application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript types
│   │   └── tests/          # Frontend tests
│   ├── package.json
│   └── tsconfig.json
├── agent/                   # Cross-platform agent software
│   ├── cmd/                # Entry points
│   ├── internal/           # Private application code
│   ├── pkg/                # Public libraries
│   └── build/              # Build scripts
├── docs/                    # Project documentation
├── scripts/                 # Utility scripts
├── k8s/                     # Kubernetes manifests
├── docker-compose.yml       # Local development services
├── Dockerfile               # Backend Dockerfile
├── .env.example             # Environment template
└── README.md                # Main readme
```

### Backend Structure Details

```
backend/src/
├── api/
│   ├── v1/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── devices.routes.ts
│   │   │   ├── alerts.routes.ts
│   │   │   └── tickets.routes.ts
│   │   └── controllers/
│   │       ├── auth.controller.ts
│   │       ├── devices.controller.ts
│   │       └── ...
│   └── middleware/
│       ├── auth.middleware.ts
│       ├── validation.middleware.ts
│       └── error.middleware.ts
├── services/
│   ├── device.service.ts
│   ├── monitoring.service.ts
│   ├── alert.service.ts
│   └── ...
├── models/
│   ├── user.model.ts
│   ├── device.model.ts
│   └── ...
├── utils/
│   ├── logger.ts
│   ├── crypto.ts
│   └── ...
└── app.ts
```

### Frontend Structure Details

```
frontend/src/
├── components/
│   ├── common/           # Shared components
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Modal/
│   ├── layout/           # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── Footer/
│   └── features/         # Feature-specific components
│       ├── devices/
│       ├── alerts/
│       └── tickets/
├── pages/
│   ├── Dashboard/
│   ├── Devices/
│   ├── Alerts/
│   └── Tickets/
├── store/
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── devicesSlice.ts
│   │   └── ...
│   └── store.ts
└── App.tsx
```

---

## Coding Standards

### TypeScript/JavaScript

#### General Rules
- Use **TypeScript** for all new code
- Use **ES6+** features (arrow functions, destructuring, etc.)
- Use **async/await** over callbacks and promises
- Avoid `any` type; use proper typing

#### Naming Conventions
- **Variables/Functions**: camelCase (`getUserById`)
- **Classes/Interfaces**: PascalCase (`DeviceService`, `IUser`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Files**: kebab-case (`device-service.ts`)

#### Code Style
```typescript
// Good ✅
interface User {
  id: string;
  email: string;
  role: UserRole;
}

async function createUser(data: Partial<User>): Promise<User> {
  const user = await db.user.create({ data });
  return user;
}

// Bad ❌
function createUser(data: any) {
  return new Promise((resolve, reject) => {
    db.user.create({ data }, (err: any, user: any) => {
      if (err) reject(err);
      else resolve(user);
    });
  });
}
```

### React Components

#### Functional Components
```tsx
// Good ✅
import React, { useState, useEffect } from 'react';

interface DeviceCardProps {
  device: Device;
  onSelect: (id: string) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onSelect }) => {
  const [status, setStatus] = useState<string>(device.status);

  useEffect(() => {
    // Effect logic
  }, [device]);

  return (
    <div onClick={() => onSelect(device.id)}>
      <h3>{device.name}</h3>
      <span>{status}</span>
    </div>
  );
};
```

### API Design

#### RESTful Conventions
```typescript
// Resources are plural nouns
GET    /api/v1/devices          # List all devices
GET    /api/v1/devices/:id      # Get specific device
POST   /api/v1/devices          # Create device
PUT    /api/v1/devices/:id      # Update device (full)
PATCH  /api/v1/devices/:id      # Update device (partial)
DELETE /api/v1/devices/:id      # Delete device

// Nested resources
GET    /api/v1/devices/:id/alerts    # Get device's alerts
POST   /api/v1/devices/:id/actions   # Trigger device action
```

#### Response Format
```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "message": "Device created successfully"
}

// Error response
{
  "success": false,
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "Device with ID abc123 not found",
    "details": { ... }
  }
}

// Pagination
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

## Testing

### Testing Strategy

- **Unit Tests**: Test individual functions and classes (80%+ coverage)
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Load testing for scalability

### Running Tests

```bash
# Backend tests
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Generate coverage report

# Frontend tests
cd frontend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Generate coverage

# E2E tests
npm run test:e2e            # Run E2E tests
```

### Writing Tests

#### Backend Unit Test Example
```typescript
import { DeviceService } from './device.service';
import { db } from '../utils/database';

jest.mock('../utils/database');

describe('DeviceService', () => {
  let deviceService: DeviceService;

  beforeEach(() => {
    deviceService = new DeviceService();
  });

  describe('getDeviceById', () => {
    it('should return device when found', async () => {
      const mockDevice = { id: '123', name: 'Test Device' };
      (db.device.findUnique as jest.Mock).mockResolvedValue(mockDevice);

      const result = await deviceService.getDeviceById('123');

      expect(result).toEqual(mockDevice);
      expect(db.device.findUnique).toHaveBeenCalledWith({
        where: { id: '123' }
      });
    });

    it('should throw error when device not found', async () => {
      (db.device.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(deviceService.getDeviceById('999'))
        .rejects
        .toThrow('Device not found');
    });
  });
});
```

#### Frontend Component Test
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DeviceCard } from './DeviceCard';

describe('DeviceCard', () => {
  const mockDevice = {
    id: '123',
    name: 'Test Device',
    status: 'online'
  };

  it('renders device information', () => {
    render(<DeviceCard device={mockDevice} onSelect={jest.fn()} />);

    expect(screen.getByText('Test Device')).toBeInTheDocument();
    expect(screen.getByText('online')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<DeviceCard device={mockDevice} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Test Device'));

    expect(onSelect).toHaveBeenCalledWith('123');
  });
});
```

---

## Git Workflow

### Branch Strategy

We use **Git Flow**:

```
main                    # Production-ready code
├── develop            # Integration branch
    ├── feature/*      # New features
    ├── bugfix/*       # Bug fixes
    ├── hotfix/*       # Production hotfixes
    └── release/*      # Release preparation
```

### Branch Naming

- `feature/add-device-monitoring`
- `bugfix/fix-alert-routing`
- `hotfix/security-patch`
- `release/v1.0.0`

### Commit Messages

Follow **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Add tests
- `chore`: Build/tooling changes

**Examples**:
```bash
feat(devices): add real-time CPU monitoring

Implemented WebSocket connection for live CPU metrics.
Added chart component to display historical data.

Closes #123

fix(auth): prevent token expiration race condition

Added mutex to token refresh logic to prevent concurrent refreshes.

test(alerts): add unit tests for alert service

Added tests for alert creation, routing, and notification delivery.
Coverage increased from 65% to 82%.
```

### Pull Request Process

1. **Create branch** from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-new-feature
   ```

2. **Make changes** and commit
   ```bash
   git add .
   git commit -m "feat(devices): add device monitoring"
   ```

3. **Push branch**
   ```bash
   git push origin feature/my-new-feature
   ```

4. **Create Pull Request** on GitHub
   - Fill out PR template
   - Link related issues
   - Request reviewers
   - Ensure CI passes

5. **Address review feedback**
   ```bash
   git add .
   git commit -m "fix: address review comments"
   git push origin feature/my-new-feature
   ```

6. **Merge** (after approval)
   - Use "Squash and merge" for feature branches
   - Use "Merge commit" for release branches

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log or debug code
- [ ] No sensitive data (keys, passwords)
- [ ] Performance considered
- [ ] Security reviewed
- [ ] Backward compatibility maintained

---

## CI/CD

### GitHub Actions Workflows

#### Pull Request Checks
```yaml
# .github/workflows/pr-checks.yml
- Lint code
- Run unit tests
- Check test coverage (min 80%)
- Build Docker image
- Security scan
```

#### Deployment Pipeline
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main, develop]

stages:
  - Build
  - Test
  - Deploy to staging (develop branch)
  - Deploy to production (main branch)
```

### Local CI Testing

```bash
# Run linters
npm run lint

# Fix linting issues
npm run lint:fix

# Check types
npm run type-check

# Run all checks (lint + test + build)
npm run ci
```

---

## Debugging

### Backend Debugging (Node.js)

#### VS Code Launch Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/app.ts",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "envFile": "${workspaceFolder}/.env"
    }
  ]
}
```

#### Using Chrome DevTools
```bash
node --inspect-brk backend/dist/app.js
# Open chrome://inspect in Chrome
```

### Frontend Debugging (React)

#### React DevTools
- Install React DevTools browser extension
- Inspect component hierarchy
- View props and state
- Profile performance

#### Redux DevTools
- Install Redux DevTools extension
- View actions and state changes
- Time-travel debugging

### Database Debugging

```bash
# PostgreSQL query logs
docker-compose logs -f postgres

# Connect to database
docker-compose exec postgres psql -U ninjait -d ninjait_dev

# Check slow queries
EXPLAIN ANALYZE SELECT * FROM devices WHERE status = 'online';

# Dragonfly (Redis-compatible)
docker-compose exec dragonfly redis-cli
> PING
> INFO
> MONITOR  # Watch commands in real-time

# ClickHouse queries
docker-compose exec clickhouse clickhouse-client
> SHOW DATABASES;
> USE ninjait;
> SELECT count() FROM device_metrics_hourly;
```

### Network Debugging

```bash
# View API requests
curl -X GET http://localhost:8000/api/v1/devices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v

# Test WebSocket connection
wscat -c ws://localhost:8000/ws
```

---

## Useful Commands

### Docker
```bash
# Rebuild containers
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Execute command in container
docker-compose exec postgres bash

# Stop all services
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v
```

### Database
```bash
# Create new migration
npm run migrate:create -- --name add_device_table

# Run migrations
npm run migrate

# Rollback migration
npm run migrate:rollback

# Reset database
npm run db:reset
```

### Package Management
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Audit security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

#### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

#### Agent Won't Connect
- Check firewall rules
- Verify API endpoint in agent config
- Check agent logs
- Verify TLS certificates

#### Build Failures
```bash
# Clean node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run clean
```

---

## Resources

### Documentation
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Tools
- [Postman Collection](./postman/NinjaIT.postman_collection.json)
- [Database Schema](./docs/database-schema.md)
- [API Documentation](./docs/API.md)

### Getting Help
- Internal Wiki: https://wiki.ninjait.io
- Slack Channel: #dev-help
- Team Standups: Daily at 10 AM

---

## Next Steps

1. Complete the [onboarding checklist](./ONBOARDING.md)
2. Set up your development environment
3. Pick a "good first issue" from GitHub
4. Join the team Slack channels
5. Attend the next team standup

Welcome to the team! 🎉

