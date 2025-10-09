#!/bin/bash

# ============================================================================
# NinjaIT Phase 4 - GitHub Project Management Script
# ============================================================================
# This script creates GitHub issues for Phase 4: Backend Integration
# 
# Usage:
#   ./scripts/github-project-phase4.sh create-all    # Create all Phase 4 issues
#   ./scripts/github-project-phase4.sh status        # Show project status
#
# Requirements:
#   - GitHub CLI (gh) installed and authenticated
#   - Project access for yossibmoha
# ============================================================================

set -e

# Configuration
REPO="yossibmoha/NinjaIT"
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
# Create All Phase 4 Issues
# ============================================================================

create_all_issues() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "  Creating Phase 4 Backend Integration Issues"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    # ========================================================================
    # SPRINT 1: BACKEND API DEVELOPMENT (Weeks 1-3)
    # ========================================================================
    
    # Sprint 1.1: Authentication & Authorization
    create_issue \
        "🔐 Phase 4.1: Replace Demo Auth with Real Backend" \
        "## 📋 Task Description
Replace demo authentication system with real backend JWT authentication.

## 🎯 Acceptance Criteria
- [ ] Remove mock login/register from frontend
- [ ] Connect to real auth service API
- [ ] Implement JWT token storage
- [ ] Add token refresh logic
- [ ] Update ProtectedRoute to use real auth check
- [ ] Handle auth errors gracefully
- [ ] Add loading states during auth
- [ ] Test login/logout flow

## 📝 Implementation Steps
1. Update \`frontend/src/store/auth.ts\` to use real API
2. Remove demo credentials from login page
3. Implement token refresh logic
4. Update API client with auth interceptors
5. Test auth flow end-to-end

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 1.1 (Week 1)
- **Priority**: 🔴 Critical
- **Estimated**: 3 days
- **Files**: \`frontend/src/store/auth.ts\`, \`frontend/src/app/login/page.tsx\`" \
        "phase-4,sprint-1,component-frontend,component-backend,priority-critical,type-feature" \
        "@me"
    
    create_issue \
        "🔄 Phase 4.2: Implement JWT Refresh Token Flow" \
        "## 📋 Task Description
Implement automatic JWT token refresh to keep users logged in.

## 🎯 Acceptance Criteria
- [ ] Refresh token endpoint in backend
- [ ] Automatic token refresh before expiration
- [ ] Handle refresh token expiration
- [ ] Logout on refresh failure
- [ ] Update API client interceptors
- [ ] Test token refresh flow

## 📝 Implementation Steps
1. Create refresh token endpoint in auth service
2. Store refresh token securely
3. Add refresh logic to API client
4. Test automatic refresh
5. Handle edge cases

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 1.1 (Week 1)
- **Priority**: 🔴 Critical
- **Estimated**: 2 days" \
        "phase-4,sprint-1,component-backend,priority-critical,type-feature" \
        "@me"
    
    create_issue \
        "🔑 Phase 4.3: Add Password Reset Functionality" \
        "## 📋 Task Description
Implement complete password reset flow with email verification.

## 🎯 Acceptance Criteria
- [ ] Forgot password page
- [ ] Send reset email endpoint
- [ ] Reset password endpoint
- [ ] Email template for reset
- [ ] Reset link expiration (1 hour)
- [ ] Password strength validation
- [ ] Success/error messages

## 📝 Implementation Steps
1. Create forgot password page
2. Implement email sending service
3. Create reset password page
4. Add validation
5. Test complete flow

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 1.1 (Week 1-2)
- **Priority**: 🟠 High
- **Estimated**: 3 days" \
        "phase-4,sprint-1,component-frontend,component-backend,priority-high,type-feature" \
        "@me"
    
    # Sprint 1.2: Devices Management API
    create_issue \
        "💻 Phase 4.4: Create Devices Management API (CRUD)" \
        "## 📋 Task Description
Implement complete CRUD API for device management.

## 🎯 Acceptance Criteria
- [ ] GET /api/v1/devices (list with pagination, filters)
- [ ] GET /api/v1/devices/:id (get one)
- [ ] POST /api/v1/devices (create)
- [ ] PUT /api/v1/devices/:id (update)
- [ ] DELETE /api/v1/devices/:id (delete)
- [ ] GET /api/v1/devices/:id/metrics
- [ ] POST /api/v1/devices/bulk/action
- [ ] Search and filter support
- [ ] Sorting support
- [ ] Unit tests for all endpoints

## 📝 API Endpoints
\`\`\`
GET    /api/v1/devices
GET    /api/v1/devices/:id
POST   /api/v1/devices
PUT    /api/v1/devices/:id
DELETE /api/v1/devices/:id
GET    /api/v1/devices/:id/metrics
GET    /api/v1/devices/:id/alerts
POST   /api/v1/devices/bulk/action
\`\`\`

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 1.2 (Week 2)
- **Priority**: 🔴 Critical
- **Estimated**: 4 days" \
        "phase-4,sprint-1,component-backend,priority-critical,type-feature,api" \
        "@me"
    
    create_issue \
        "📊 Phase 4.5: Implement Device Metrics Collection" \
        "## 📋 Task Description
Set up real-time device metrics collection and storage.

## 🎯 Acceptance Criteria
- [ ] Agent sends metrics to API
- [ ] API stores metrics in InfluxDB
- [ ] Metrics query endpoints
- [ ] Historical data retrieval
- [ ] Aggregation endpoints
- [ ] Performance optimization
- [ ] Handle 1000+ devices

## 📝 Implementation Steps
1. Update agent to send metrics
2. Create metrics ingestion endpoint
3. Store in InfluxDB
4. Create query endpoints
5. Test with multiple devices

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 1.2 (Week 2)
- **Priority**: 🔴 Critical
- **Estimated**: 3 days" \
        "phase-4,sprint-1,component-backend,component-agent,priority-critical,type-feature" \
        "@me"
    
    create_issue \
        "🔍 Phase 4.6: Connect Frontend Devices Page to Real API" \
        "## 📋 Task Description
Replace mock device data with real API calls in frontend.

## 🎯 Acceptance Criteria
- [ ] Connect to GET /api/v1/devices
- [ ] Implement pagination
- [ ] Implement real filtering
- [ ] Implement real sorting
- [ ] Connect bulk actions
- [ ] Add loading states
- [ ] Add error handling
- [ ] Update device details page

## 📝 Implementation Steps
1. Create devices service file
2. Update devices page to use API
3. Implement pagination
4. Add filters and sorting
5. Test with real data

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 1.2 (Week 2-3)
- **Priority**: 🔴 Critical
- **Depends on**: #4 (Devices API)
- **Estimated**: 3 days
- **Files**: \`frontend/src/app/dashboard/devices/page.tsx\`" \
        "phase-4,sprint-1,component-frontend,priority-critical,type-feature" \
        "@me"
    
    # Sprint 1.3: Monitoring & Metrics API
    create_issue \
        "📈 Phase 4.7: Set Up InfluxDB Queries for Real-Time Metrics" \
        "## 📋 Task Description
Optimize InfluxDB queries for dashboard metrics visualization.

## 🎯 Acceptance Criteria
- [ ] Efficient query patterns
- [ ] Aggregation queries (avg, max, min)
- [ ] Time-range queries
- [ ] Device grouping queries
- [ ] Performance < 200ms
- [ ] Handle concurrent queries

## 📝 Implementation Steps
1. Design query patterns
2. Implement aggregation logic
3. Add caching with Dragonfly
4. Performance testing
5. Documentation

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 1.3 (Week 2-3)
- **Priority**: 🟠 High
- **Estimated**: 3 days" \
        "phase-4,sprint-1,component-backend,priority-high,type-feature" \
        "@me"
    
    create_issue \
        "📡 Phase 4.8: Implement WebSocket for Live Metrics" \
        "## 📋 Task Description
Set up WebSocket server for real-time metric updates.

## 🎯 Acceptance Criteria
- [ ] WebSocket server setup
- [ ] Subscribe/unsubscribe to devices
- [ ] Broadcast metrics updates
- [ ] Connection management
- [ ] Reconnection logic
- [ ] Frontend WebSocket client
- [ ] Test with multiple clients

## 📝 Implementation Steps
1. Set up WebSocket server
2. Implement subscription logic
3. Add broadcasting
4. Create frontend hook
5. Test real-time updates

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 1.3 (Week 3)
- **Priority**: 🟠 High
- **Estimated**: 4 days" \
        "phase-4,sprint-1,component-backend,component-frontend,priority-high,type-feature" \
        "@me"
    
    # Sprint 1.4: Alerts Management API
    create_issue \
        "🚨 Phase 4.9: Create Alerts Management API" \
        "## 📋 Task Description
Implement complete alerts system with CRUD and notification.

## 🎯 Acceptance Criteria
- [ ] Alert CRUD endpoints
- [ ] Alert rules engine
- [ ] Notification delivery
- [ ] Alert history
- [ ] Alert grouping
- [ ] Email notifications
- [ ] Unit tests

## 📝 API Endpoints
\`\`\`
GET    /api/v1/alerts
GET    /api/v1/alerts/:id
POST   /api/v1/alerts
PUT    /api/v1/alerts/:id
DELETE /api/v1/alerts/:id
GET    /api/v1/alerts/rules
POST   /api/v1/alerts/rules
\`\`\`

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 1.4 (Week 3)
- **Priority**: 🟠 High
- **Estimated**: 4 days" \
        "phase-4,sprint-1,component-backend,priority-high,type-feature,api" \
        "@me"
    
    # ========================================================================
    # SPRINT 2: FRONTEND INTEGRATION (Weeks 4-6)
    # ========================================================================
    
    create_issue \
        "🎨 Phase 4.10: Connect Dashboard Cards to Real APIs" \
        "## 📋 Task Description
Replace all dashboard mock data with real API calls.

## 🎯 Acceptance Criteria
- [ ] System Health card with real data
- [ ] Critical Alerts from API
- [ ] Online Devices count from API
- [ ] Patch Status from API
- [ ] Top Devices from metrics API
- [ ] Availability Monitoring real data
- [ ] Servers by Type real data
- [ ] Backup Status real data
- [ ] Alerts Breakdown real data
- [ ] Add loading states
- [ ] Add error handling

## 📝 Dashboard Cards
1. System Health
2. Critical Alerts
3. Online Devices
4. Patch Status
5. Top Devices by Resource
6. Availability Monitoring
7. Servers by Type
8. Backup Status
9. Alerts Breakdown

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 2.2 (Week 4)
- **Priority**: 🔴 Critical
- **Estimated**: 5 days
- **Files**: \`frontend/src/app/dashboard/page.tsx\`, \`frontend/src/components/dashboard/*\`" \
        "phase-4,sprint-2,component-frontend,priority-critical,type-feature" \
        "@me"
    
    create_issue \
        "⚡ Phase 4.11: Implement Real-Time Dashboard Updates" \
        "## 📋 Task Description
Add WebSocket integration to dashboard for live updates.

## 🎯 Acceptance Criteria
- [ ] WebSocket connection in dashboard
- [ ] Subscribe to multiple devices
- [ ] Update cards in real-time
- [ ] Connection status indicator
- [ ] Reconnection on disconnect
- [ ] Performance optimization
- [ ] No memory leaks

## 📝 Implementation Steps
1. Create WebSocket hook
2. Connect dashboard to WebSocket
3. Update card components
4. Add connection indicator
5. Test with live data

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 2.2 (Week 4-5)
- **Priority**: 🟠 High
- **Depends on**: #8 (WebSocket Server)
- **Estimated**: 3 days" \
        "phase-4,sprint-2,component-frontend,priority-high,type-feature" \
        "@me"
    
    create_issue \
        "📄 Phase 4.12: Create Device Details Page with Real Data" \
        "## 📋 Task Description
Build comprehensive device details page with real-time metrics.

## 🎯 Acceptance Criteria
- [ ] Device info from API
- [ ] Real-time metrics charts
- [ ] Alert history
- [ ] Installed software list
- [ ] Active services
- [ ] Network information
- [ ] Remote access button
- [ ] Action buttons (reboot, shutdown)

## 📝 Implementation Steps
1. Create device details page
2. Fetch device data
3. Add metrics charts
4. Add alerts section
5. Add software/services tabs
6. Add action buttons

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 2.3 (Week 5)
- **Priority**: 🟠 High
- **Estimated**: 4 days
- **Files**: \`frontend/src/app/dashboard/devices/[id]/page.tsx\`" \
        "phase-4,sprint-2,component-frontend,priority-high,type-feature" \
        "@me"
    
    create_issue \
        "🎫 Phase 4.13: Create Tickets API and Connect Frontend" \
        "## 📋 Task Description
Implement complete ticketing system with backend and frontend.

## 🎯 Acceptance Criteria
**Backend:**
- [ ] Ticket CRUD endpoints
- [ ] Ticket status workflow
- [ ] Ticket assignments
- [ ] Ticket comments
- [ ] File attachments
- [ ] Email notifications

**Frontend:**
- [ ] Tickets list page
- [ ] Create ticket form
- [ ] Ticket details page
- [ ] Comments section
- [ ] Status updates
- [ ] File uploads

## 📝 API Endpoints
\`\`\`
GET    /api/v1/tickets
GET    /api/v1/tickets/:id
POST   /api/v1/tickets
PUT    /api/v1/tickets/:id
DELETE /api/v1/tickets/:id
POST   /api/v1/tickets/:id/comments
POST   /api/v1/tickets/:id/attachments
\`\`\`

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 2.4 (Week 5-6)
- **Priority**: 🟡 Medium
- **Estimated**: 5 days" \
        "phase-4,sprint-2,component-backend,component-frontend,priority-medium,type-feature,api" \
        "@me"
    
    create_issue \
        "👥 Phase 4.14: Create Customers API and Connect Frontend" \
        "## 📋 Task Description
Implement customer management system with backend and frontend.

## 🎯 Acceptance Criteria
**Backend:**
- [ ] Customer CRUD endpoints
- [ ] Customer contacts
- [ ] Customer sites/locations
- [ ] Customer device assignments
- [ ] Customer billing info

**Frontend:**
- [ ] Customers list page
- [ ] Create customer form
- [ ] Customer details page
- [ ] Contacts management
- [ ] Sites management
- [ ] Assigned devices view

## 📝 API Endpoints
\`\`\`
GET    /api/v1/customers
GET    /api/v1/customers/:id
POST   /api/v1/customers
PUT    /api/v1/customers/:id
DELETE /api/v1/customers/:id
GET    /api/v1/customers/:id/devices
GET    /api/v1/customers/:id/tickets
\`\`\`

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 2.4 (Week 6)
- **Priority**: 🟡 Medium
- **Estimated**: 5 days" \
        "phase-4,sprint-2,component-backend,component-frontend,priority-medium,type-feature,api" \
        "@me"
    
    create_issue \
        "🔧 Phase 4.15: Create Patch Management API and Connect Frontend" \
        "## 📋 Task Description
Implement patch management system for OS and application updates.

## 🎯 Acceptance Criteria
**Backend:**
- [ ] Patch scanning endpoints
- [ ] Available patches list
- [ ] Patch installation API
- [ ] Patch policies
- [ ] Patch history

**Frontend:**
- [ ] Patch Management page
- [ ] Available patches view
- [ ] Install/schedule patches
- [ ] Patch policies configuration
- [ ] Patch history

## 📝 API Endpoints
\`\`\`
GET    /api/v1/patches/available
GET    /api/v1/patches/devices/:id
POST   /api/v1/patches/install
POST   /api/v1/patches/policies
GET    /api/v1/patches/history
\`\`\`

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 2.4 (Week 6)
- **Priority**: 🟡 Medium
- **Estimated**: 5 days" \
        "phase-4,sprint-2,component-backend,component-frontend,priority-medium,type-feature,api" \
        "@me"
    
    # ========================================================================
    # SPRINT 3: ADVANCED FEATURES (Weeks 7-8)
    # ========================================================================
    
    create_issue \
        "🔌 Phase 4.16: Implement WebSocket Connection Management" \
        "## 📋 Task Description
Build robust WebSocket connection management system.

## 🎯 Acceptance Criteria
- [ ] Connection pool management
- [ ] Automatic reconnection
- [ ] Connection health checks
- [ ] Subscription management
- [ ] Error handling
- [ ] Connection metrics
- [ ] Load balancing support

## 📝 Implementation Steps
1. Create connection manager
2. Add reconnection logic
3. Implement health checks
4. Add subscription tracking
5. Performance testing

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 3.1 (Week 7)
- **Priority**: 🟠 High
- **Estimated**: 3 days" \
        "phase-4,sprint-3,component-backend,priority-high,type-feature" \
        "@me"
    
    create_issue \
        "📊 Phase 4.17: Connect Reports to ClickHouse Analytics" \
        "## 📋 Task Description
Integrate reports system with ClickHouse for advanced analytics.

## 🎯 Acceptance Criteria
- [ ] ClickHouse query layer
- [ ] Report generation endpoints
- [ ] Custom report builder
- [ ] Scheduled reports
- [ ] PDF export
- [ ] Excel export
- [ ] Report history

## 📝 Implementation Steps
1. Design ClickHouse schema
2. Create query layer
3. Implement report endpoints
4. Add frontend integration
5. Test with large datasets

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 3.2 (Week 7-8)
- **Priority**: 🟡 Medium
- **Estimated**: 5 days" \
        "phase-4,sprint-3,component-backend,component-frontend,priority-medium,type-feature" \
        "@me"
    
    create_issue \
        "👤 Phase 4.18: Implement Admin User Management" \
        "## 📋 Task Description
Build complete user and role management system.

## 🎯 Acceptance Criteria
- [ ] User CRUD operations
- [ ] Role management
- [ ] Permission assignment
- [ ] User invitation system
- [ ] Password reset by admin
- [ ] User activity logs
- [ ] Session management

## 📝 Implementation Steps
1. Create user management API
2. Implement role system
3. Build admin UI
4. Add invitation system
5. Test permissions

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 3.3 (Week 8)
- **Priority**: 🟡 Medium
- **Estimated**: 4 days" \
        "phase-4,sprint-3,component-backend,component-frontend,priority-medium,type-feature" \
        "@me"
    
    # ========================================================================
    # SPRINT 4: TESTING & OPTIMIZATION (Weeks 9-10)
    # ========================================================================
    
    create_issue \
        "🧪 Phase 4.19: Write E2E Tests with Playwright" \
        "## 📋 Task Description
Create comprehensive E2E test suite for all features.

## 🎯 Acceptance Criteria
- [ ] Auth flow tests
- [ ] Dashboard tests
- [ ] Devices management tests
- [ ] Tickets tests
- [ ] Customers tests
- [ ] Admin tests
- [ ] 50+ test scenarios
- [ ] 90%+ pass rate
- [ ] CI integration

## 📝 Test Categories
1. Authentication (login, logout, register)
2. Dashboard (all cards, real-time updates)
3. Devices (list, create, edit, delete, details)
4. Tickets (create, update, comments)
5. Customers (CRUD, assignments)
6. Admin (users, roles, settings)

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 4.1 (Week 9)
- **Priority**: 🟠 High
- **Estimated**: 5 days" \
        "phase-4,sprint-4,type-test,priority-high,type-feature" \
        "@me"
    
    create_issue \
        "⚡ Phase 4.20: Performance and Bundle Size Optimization" \
        "## 📋 Task Description
Optimize frontend and backend performance.

## 🎯 Acceptance Criteria
**Frontend:**
- [ ] Bundle size < 1MB (gzipped)
- [ ] First load < 2s
- [ ] Code splitting
- [ ] Image optimization
- [ ] Lazy loading

**Backend:**
- [ ] API response < 200ms (p95)
- [ ] Database query optimization
- [ ] Caching strategy
- [ ] Load testing

## 📝 Implementation Steps
1. Analyze bundle size
2. Implement code splitting
3. Optimize images
4. Add lazy loading
5. Profile and optimize queries
6. Load testing

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 4.2 (Week 9-10)
- **Priority**: 🟠 High
- **Estimated**: 4 days" \
        "phase-4,sprint-4,component-frontend,component-backend,priority-high,type-optimization" \
        "@me"
    
    create_issue \
        "📚 Phase 4.21: Complete API Documentation (Swagger/Redoc)" \
        "## 📋 Task Description
Document all API endpoints with Swagger/OpenAPI and Redoc.

## 🎯 Acceptance Criteria
- [ ] All endpoints documented
- [ ] Request/response schemas
- [ ] Authentication docs
- [ ] Error responses
- [ ] Code examples
- [ ] Interactive API explorer
- [ ] Redoc integration

## 📝 Implementation Steps
1. Update OpenAPI spec
2. Add detailed descriptions
3. Add code examples
4. Set up Redoc
5. Review and polish

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 4.3 (Week 10)
- **Priority**: 🟡 Medium
- **Estimated**: 3 days" \
        "phase-4,sprint-4,component-backend,priority-medium,type-documentation" \
        "@me"
    
    # ========================================================================
    # SPRINT 5: DEPLOYMENT (Week 11)
    # ========================================================================
    
    create_issue \
        "🚀 Phase 4.22: Deploy to Staging Environment" \
        "## 📋 Task Description
Deploy complete application to staging for QA testing.

## 🎯 Acceptance Criteria
- [ ] Backend deployed to staging
- [ ] Frontend deployed to staging
- [ ] Database configured
- [ ] Environment variables set
- [ ] HTTPS configured
- [ ] Monitoring active
- [ ] Run smoke tests
- [ ] QA team access

## 📝 Implementation Steps
1. Set up staging infrastructure
2. Deploy backend services
3. Deploy frontend
4. Configure database
5. Run smoke tests
6. QA testing

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 5.1 (Week 11)
- **Priority**: 🔴 Critical
- **Estimated**: 3 days" \
        "phase-4,sprint-5,component-infrastructure,priority-critical,type-deployment" \
        "@me"
    
    create_issue \
        "🎉 Phase 4.23: Deploy to Production Environment" \
        "## 📋 Task Description
Deploy NinjaIT platform to production!

## 🎯 Acceptance Criteria
- [ ] Backend deployed to production
- [ ] Frontend deployed to production
- [ ] Database configured with backups
- [ ] CDN configured
- [ ] Monitoring and alerting
- [ ] Backup strategy
- [ ] CI/CD pipeline
- [ ] Rollback plan
- [ ] Documentation updated

## 📝 Implementation Steps
1. Prepare production infrastructure
2. Deploy backend
3. Deploy frontend
4. Configure CDN
5. Set up monitoring
6. Run final tests
7. Go live!

## 🔗 Related
- **Phase**: Phase 4 - Backend Integration
- **Sprint**: Sprint 5.2 (Week 11)
- **Priority**: 🔴 Critical
- **Estimated**: 3 days" \
        "phase-4,sprint-5,component-infrastructure,priority-critical,type-deployment" \
        "@me"
    
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    log_success "All Phase 4 issues created and added to project!"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "📊 View project: https://github.com/users/$PROJECT_OWNER/projects/$PROJECT_NUMBER"
    echo "📝 View issues: https://github.com/$REPO/issues"
    echo ""
    echo "📈 Phase 4 Summary:"
    echo "   - Total Issues: 23"
    echo "   - Sprint 1 (Backend APIs): 9 issues"
    echo "   - Sprint 2 (Frontend Integration): 6 issues"
    echo "   - Sprint 3 (Advanced Features): 3 issues"
    echo "   - Sprint 4 (Testing & Optimization): 3 issues"
    echo "   - Sprint 5 (Deployment): 2 issues"
    echo ""
}

# ============================================================================
# Show Project Status
# ============================================================================

show_status() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "  NinjaIT Phase 4 Project Status"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    gh issue list --repo $REPO --label "phase-4" --limit 30
    
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
        echo "  create-all  - Create all Phase 4 issues"
        echo "  status      - Show Phase 4 project status"
        echo ""
        exit 1
        ;;
esac

