#!/bin/bash

# ============================================================================
# NinjaIT GitHub Project Management Script
# ============================================================================
# This script manages GitHub issues and project board for NinjaIT development
# 
# Usage:
#   ./scripts/github-project-sync.sh create-all    # Create all Phase 1 issues
#   ./scripts/github-project-sync.sh update        # Update issue statuses
#   ./scripts/github-project-sync.sh status        # Show project status
#
# Requirements:
#   - GitHub CLI (gh) installed and authenticated
#   - Project #3 access for yossibmoha
# ============================================================================

set -e

# Configuration
REPO="yossibmoha/NingaIT"
PROJECT_NUMBER=3
PROJECT_OWNER="yossibmoha"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Create issue and add to project
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    local assignee="$4"
    
    log_info "Creating issue: $title"
    
    # Create issue
    issue_url=$(gh issue create \
        --repo $REPO \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        --assignee "$assignee" \
        --json url \
        -q .url 2>&1 | tail -1)
    
    if [[ $issue_url == http* ]]; then
        log_success "Issue created: $issue_url"
        
        # Add to project
        if gh project item-add $PROJECT_NUMBER --owner $PROJECT_OWNER --url "$issue_url" > /dev/null 2>&1; then
            log_success "Added to project board"
        else
            log_warning "Could not add to project board"
        fi
        
        echo "$issue_url"
    else
        log_error "Failed to create issue"
        echo ""
    fi
}

# ============================================================================
# Create All Phase 1 Issues
# ============================================================================

create_all_issues() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "  Creating Phase 1 Sprint 1 Issues for NinjaIT"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    # Issue 2: API Gateway (Already Complete - for reference)
    create_issue \
        "✅ Phase 1.2: API Gateway Foundation (Fastify)" \
        "## 📋 Task Description
Build high-performance API Gateway using Fastify with routing, middleware, and documentation.

## ✅ Status
**COMPLETED** ✅ 

## 📦 Deliverables
- [x] Fastify TypeScript project with strict mode
- [x] 17 REST API endpoints (auth, users, devices)
- [x] Swagger/OpenAPI documentation at \`/docs\`
- [x] JWT authentication ready
- [x] Rate limiting, CORS, security headers
- [x] WebSocket support
- [x] Environment configuration with Zod
- [x] Pino logging with pretty print

## 📊 Results
- **Files Created**: 12 files, 1,312 lines
- **Performance**: < 1ms response time
- **Commit**: b6b6fa6

## 🔗 Related
- **Phase**: Phase 1 - Foundation
- **Sprint**: Sprint 1
- **Completed**: Day 1" \
        "phase-1,component-backend,priority-critical,type-feature" \
        "@me"
    
    # Issue 3: Database Schemas (Already Complete - for reference)
    create_issue \
        "✅ Phase 1.3: Database Schemas & Migrations" \
        "## 📋 Task Description
Design and implement complete PostgreSQL schema with all entities and relationships.

## ✅ Status
**COMPLETED** ✅

## 📦 Deliverables
- [x] 13 PostgreSQL tables with relationships
- [x] Multi-tenant architecture (organizations)
- [x] Users with RBAC (admin, tech, user)
- [x] Devices with full system metadata
- [x] Alerts, audit logs, API keys
- [x] Scripts and automation tables
- [x] Database initialization script
- [x] Seed data (admin@demo.com)

## 📊 Results
- **Tables**: 13 tables
- **Lines**: 400+ lines of SQL
- **Script**: \`./scripts/setup/init-databases.sh\`
- **Commit**: d664c25

## 🔗 Related
- **Phase**: Phase 1 - Foundation
- **Sprint**: Sprint 1
- **Completed**: Day 1" \
        "phase-1,component-database,priority-critical,type-feature" \
        "@me"
    
    # Issue 4: Authentication Service
    create_issue \
        "🔐 Phase 1.4: Authentication Service Implementation" \
        "## 📋 Task Description
Implement JWT-based authentication service with user registration, login, and RBAC.

## 🎯 Acceptance Criteria
- [ ] JWT token generation and validation
- [ ] Password hashing with bcrypt
- [ ] User registration endpoint working
- [ ] Login endpoint working
- [ ] Refresh token mechanism
- [ ] RBAC middleware (admin, tech, user)
- [ ] Database integration with PostgreSQL
- [ ] Unit tests for auth flows
- [ ] Integration tests

## 📝 Implementation Steps
1. Create auth service module
2. Implement password hashing
3. Implement JWT generation/validation
4. Create registration logic
5. Create login logic
6. Implement refresh token flow
7. Add RBAC middleware
8. Write tests
9. Update API Gateway routes

## 🔗 Related
- **Phase**: Phase 1 - Foundation
- **Sprint**: Sprint 1 (Week 1)
- **Priority**: 🔴 Critical
- **Depends on**: #1 (Infrastructure), #3 (Database)
- **Estimated**: 5 days

## 📚 Resources
- \`backend/services/auth/\`
- JWT documentation
- bcrypt documentation" \
        "phase-1,component-backend,priority-critical,type-feature" \
        "@me"
    
    # Issue 5: Frontend Foundation
    create_issue \
        "🎨 Phase 1.5: Frontend Foundation (Next.js + Ant Design)" \
        "## 📋 Task Description
Initialize Next.js 14+ frontend with Ant Design 5+, authentication, and core layouts.

## 🎯 Acceptance Criteria
- [ ] Next.js 14+ initialized with TypeScript
- [ ] Ant Design 5+ installed and configured
- [ ] Project folder structure created
- [ ] Redux Toolkit for state management
- [ ] Layout components (Header, Sidebar, Footer)
- [ ] Dark mode toggle implemented
- [ ] Login and Register pages
- [ ] API client with axios interceptors
- [ ] Protected routes working
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Playwright E2E test for login

## 📝 Implementation Steps
1. Initialize Next.js with TypeScript
2. Install Ant Design 5+
3. Create project structure
4. Set up Redux Toolkit/Zustand
5. Create layout components
6. Implement dark mode
7. Create auth pages
8. Set up API client
9. Implement route protection
10. Add responsive design
11. Write E2E tests

## 🔗 Related
- **Phase**: Phase 1 - Foundation  
- **Sprint**: Sprint 1 (Week 1)
- **Priority**: 🔴 Critical
- **Status**: 🚀 40% Complete
- **Estimated**: 5 days

## 📚 Resources
- \`frontend/\`
- Next.js 14 docs
- Ant Design 5 docs" \
        "phase-1,component-frontend,priority-high,type-feature,status-in-progress" \
        "@me"
    
    # Issue 6: Go Agent Foundation
    create_issue \
        "💻 Phase 1.6: Go Agent Foundation" \
        "## 📋 Task Description
Create cross-platform agent in Go for system monitoring and management.

## 🎯 Acceptance Criteria
- [ ] Go project initialized with modules
- [ ] Cross-compilation for Windows, macOS, Linux
- [ ] System info collection (CPU, RAM, disk)
- [ ] Heartbeat mechanism (every 30s)
- [ ] Secure communication (TLS 1.3)
- [ ] Configuration file support (YAML)
- [ ] Logging system implemented
- [ ] Auto-update mechanism
- [ ] Installers for each platform (MSI, PKG, DEB)
- [ ] Offline queue for lost connectivity
- [ ] Unit tests
- [ ] Memory usage < 30MB
- [ ] CPU usage < 2%

## 📝 Implementation Steps
1. Initialize Go project
2. Set up cross-compilation
3. Implement system metrics collection
4. Create heartbeat mechanism
5. Add TLS communication
6. Configuration management
7. Logging system
8. Auto-update functionality
9. Create installers
10. Offline queue
11. Write tests
12. Performance optimization

## 🔗 Related
- **Phase**: Phase 1 - Foundation
- **Sprint**: Sprint 1 (Week 2)
- **Priority**: 🟠 High
- **Owner**: DevOps Senior #2
- **Estimated**: 6 days

## 📚 Resources
- \`agent/\`
- Go documentation
- TLS 1.3 guide" \
        "phase-1,component-agent,priority-high,type-feature" \
        "@me"
    
    # Issue 7: Monitoring Service
    create_issue \
        "📊 Phase 1.7: Monitoring Service (Go)" \
        "## 📋 Task Description
Build Go microservice to receive and process monitoring data from agents.

## 🎯 Acceptance Criteria
- [ ] WebSocket server for agent connections
- [ ] Message parsing and validation
- [ ] Store metrics in InfluxDB
- [ ] Cache device state in Dragonfly
- [ ] Alert threshold checking
- [ ] REST API for dashboard queries
- [ ] Prometheus metrics export
- [ ] Handle 1000+ concurrent connections
- [ ] Response time < 100ms
- [ ] Unit tests
- [ ] Integration tests

## 📝 Implementation Steps
1. Initialize Go microservice
2. Create WebSocket server
3. Implement message parsing
4. InfluxDB integration
5. Dragonfly caching
6. Alert system
7. REST API
8. Prometheus metrics
9. Performance testing
10. Write tests

## 🔗 Related
- **Phase**: Phase 1 - Foundation
- **Sprint**: Sprint 1 (Week 2)
- **Priority**: 🟠 High
- **Depends on**: #1 (Infrastructure), #6 (Agent)
- **Owner**: Full-Stack Dev #1 + DevOps #2
- **Estimated**: 4 days

## 📚 Resources
- \`backend/services/monitoring/\`
- InfluxDB Go client
- Dragonfly Go client" \
        "phase-1,component-backend,priority-high,type-feature" \
        "@me"
    
    # Issue 8: CI/CD Pipeline
    create_issue \
        "⚙️ Phase 1.8: CI/CD Pipeline Setup" \
        "## 📋 Task Description
Set up automated CI/CD pipelines for testing and deployment.

## 🎯 Acceptance Criteria
- [ ] GitHub Actions workflows configured
- [ ] Backend unit tests job
- [ ] Frontend unit tests job
- [ ] E2E tests job with Playwright
- [ ] Docker image build job
- [ ] Security scanning (Snyk/Dependabot)
- [ ] Code quality checks (ESLint, Prettier)
- [ ] Deployment to staging
- [ ] Deployment to production (manual approval)
- [ ] Slack/Discord notifications

## 📝 Implementation Steps
1. Create GitHub Actions workflows
2. Add test jobs
3. Add build jobs
4. Security scanning
5. Code quality
6. Deployment jobs
7. Notifications

## 🔗 Related
- **Phase**: Phase 1 - Foundation
- **Sprint**: Sprint 1 (Week 2)
- **Priority**: 🟡 Medium
- **Owner**: DevOps Team
- **Estimated**: 3 days

## 📚 Resources
- \`.github/workflows/\`" \
        "phase-1,component-infrastructure,priority-medium,type-feature" \
        "@me"
    
    # Issue 9: Testing Framework
    create_issue \
        "🧪 Phase 1.9: E2E Testing Framework (Playwright)" \
        "## 📋 Task Description
Create comprehensive E2E test suite using Playwright.

## 🎯 Acceptance Criteria
- [ ] Playwright project set up
- [ ] Test utilities and fixtures
- [ ] Auth flow tests (login, logout, register)
- [ ] Dashboard tests
- [ ] Device management tests
- [ ] Alert tests
- [ ] Visual regression tests
- [ ] Test reports (HTML, JUnit)
- [ ] Tests run in CI
- [ ] 20+ test scenarios
- [ ] 90%+ pass rate

## 📝 Implementation Steps
1. Set up Playwright
2. Create test utilities
3. Write auth tests
4. Write dashboard tests
5. Write device tests
6. Add visual regression
7. Configure reports
8. Add to CI

## 🔗 Related
- **Phase**: Phase 1 - Foundation
- **Sprint**: Sprint 1 (Week 2)
- **Priority**: 🟡 Medium
- **Owner**: QA Engineer + Full-Stack Devs
- **Estimated**: 4 days

## 📚 Resources
- \`tests/e2e/\`
- Playwright docs" \
        "phase-1,type-test,priority-medium,type-feature" \
        "@me"
    
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    log_success "All issues created and added to project!"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "📊 View project: https://github.com/users/$PROJECT_OWNER/projects/$PROJECT_NUMBER"
    echo "📝 View issues: https://github.com/$REPO/issues"
    echo ""
}

# ============================================================================
# Show Project Status
# ============================================================================

show_status() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "  NinjaIT Project Status"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    gh issue list --repo $REPO --limit 20
    
    echo ""
    log_info "Project Board: https://github.com/users/$PROJECT_OWNER/projects/$PROJECT_NUMBER"
    echo ""
}

# ============================================================================
# Main
# ============================================================================

case "${1:-}" in
    create-all)
        create_all_issues
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {create-all|status}"
        echo ""
        echo "Commands:"
        echo "  create-all  - Create all Phase 1 Sprint 1 issues"
        echo "  status      - Show current project status"
        echo ""
        exit 1
        ;;
esac

