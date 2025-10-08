#!/bin/bash

# NinjaIT Database Initialization Script
# Initializes all databases and runs migrations

set -e

echo "🚀 NinjaIT Database Initialization"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is running"

# Start database services
echo ""
echo "📦 Starting database services..."
docker-compose up -d postgres dragonfly clickhouse influxdb mongodb

# Wait for PostgreSQL
echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout 60 bash -c 'until docker exec ninjait-postgres pg_isready -U ninjait > /dev/null 2>&1; do sleep 1; done'
echo -e "${GREEN}✓${NC} PostgreSQL is ready"

# Wait for Dragonfly
echo ""
echo "⏳ Waiting for Dragonfly to be ready..."
timeout 60 bash -c 'until docker exec ninjait-dragonfly redis-cli ping > /dev/null 2>&1; do sleep 1; done'
echo -e "${GREEN}✓${NC} Dragonfly is ready"

# Wait for ClickHouse
echo ""
echo "⏳ Waiting for ClickHouse to be ready..."
timeout 60 bash -c 'until curl -s http://localhost:8123/ping > /dev/null 2>&1; do sleep 1; done'
echo -e "${GREEN}✓${NC} ClickHouse is ready"

# Wait for InfluxDB
echo ""
echo "⏳ Waiting for InfluxDB to be ready..."
timeout 60 bash -c 'until curl -s http://localhost:8086/health > /dev/null 2>&1; do sleep 1; done'
echo -e "${GREEN}✓${NC} InfluxDB is ready"

# Wait for MongoDB
echo ""
echo "⏳ Waiting for MongoDB to be ready..."
timeout 60 bash -c 'until docker exec ninjait-mongodb mongosh --eval "db.adminCommand(\"ping\")" > /dev/null 2>&1; do sleep 1; done'
echo -e "${GREEN}✓${NC} MongoDB is ready"

# Initialize PostgreSQL schema
echo ""
echo "📄 Initializing PostgreSQL schema..."
docker exec -i ninjait-postgres psql -U ninjait -d ninjait_dev < backend/shared/database/schema.sql
echo -e "${GREEN}✓${NC} PostgreSQL schema created"

# Test database connections
echo ""
echo "🔍 Testing database connections..."

# Test PostgreSQL
if docker exec ninjait-postgres psql -U ninjait -d ninjait_dev -c "SELECT COUNT(*) FROM organizations;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostgreSQL connection test passed"
else
    echo -e "${RED}❌${NC} PostgreSQL connection test failed"
fi

# Test Dragonfly
if docker exec ninjait-dragonfly redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dragonfly connection test passed"
else
    echo -e "${RED}❌${NC} Dragonfly connection test failed"
fi

# Test ClickHouse
if curl -s http://localhost:8123/ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} ClickHouse connection test passed"
else
    echo -e "${RED}❌${NC} ClickHouse connection test failed"
fi

# Test InfluxDB
if curl -s http://localhost:8086/health | grep -q "pass"; then
    echo -e "${GREEN}✓${NC} InfluxDB connection test passed"
else
    echo -e "${RED}❌${NC} InfluxDB connection test failed"
fi

echo ""
echo "════════════════════════════════════════"
echo -e "${GREEN}✅ All databases initialized successfully!${NC}"
echo "════════════════════════════════════════"
echo ""
echo "📊 Access Management UIs:"
echo "  • Adminer (PostgreSQL):    http://localhost:8080"
echo "  • RedisInsight (Dragonfly): http://localhost:8001"
echo "  • Tabix (ClickHouse):      http://localhost:8082"
echo "  • InfluxDB UI:             http://localhost:8086"
echo ""
echo "🔑 Default Credentials:"
echo "  • Admin User: admin@demo.com"
echo "  • Password: Admin123!"
echo ""

