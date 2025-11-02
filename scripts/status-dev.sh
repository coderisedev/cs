#!/bin/bash

# status-dev.sh
# Check status of development environment services
# Usage: ./scripts/status-dev.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_separator() {
    echo "=================================================="
}

# Change to project root directory
cd "$(dirname "$0")/.." || exit 1
PROJECT_ROOT=$(pwd)

print_separator
print_info "Development Environment Status"
print_separator
echo ""

# Check Infrastructure Services (Docker)
print_info "Infrastructure Services (Docker):"
echo ""

POSTGRES_STATUS=$(docker ps --filter "name=cs-postgres-1" --format "{{.Status}}" 2>/dev/null || echo "")
if [ -n "$POSTGRES_STATUS" ]; then
    print_success "PostgreSQL: Running ($POSTGRES_STATUS)"
    echo "            Port: 5432"
    echo "            Container: cs-postgres-1"
else
    print_error "PostgreSQL: Not running"
fi

echo ""

REDIS_STATUS=$(docker ps --filter "name=cs-redis-1" --format "{{.Status}}" 2>/dev/null || echo "")
if [ -n "$REDIS_STATUS" ]; then
    print_success "Redis: Running ($REDIS_STATUS)"
    echo "         Port: 6379"
    echo "         Container: cs-redis-1"
else
    print_error "Redis: Not running"
fi

echo ""
print_separator
echo ""

# Check Application Services
print_info "Application Services:"
echo ""

# Check Medusa Backend
MEDUSA_PID=$(pgrep -f "pnpm.*--filter.*medusa.*dev" || echo "")
if [ -n "$MEDUSA_PID" ]; then
    print_success "Medusa Backend: Running (PID: $MEDUSA_PID)"
    echo "                 URL: http://localhost:9000"
    echo "                 Admin: http://localhost:9000/app"
    
    # Test health endpoint
    if curl -s http://localhost:9000/health > /dev/null 2>&1; then
        echo "                 Health: ✓ OK"
    else
        echo "                 Health: ⚠ Not responding"
    fi
else
    print_error "Medusa Backend: Not running"
fi

echo ""

# Check Next.js Storefront
NEXT_PID=$(pgrep -f "pnpm.*--filter.*medusa-next.*dev" || echo "")
if [ -n "$NEXT_PID" ]; then
    print_success "Next.js Storefront: Running (PID: $NEXT_PID)"
    echo "                     URL: http://localhost:8000"
    
    # Test homepage
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        echo "                     Health: ✓ OK"
    else
        echo "                     Health: ⚠ Not responding"
    fi
else
    print_error "Next.js Storefront: Not running"
fi

echo ""
print_separator
echo ""

# Check for log files
print_info "Log Files:"
echo ""

if [ -f "$PROJECT_ROOT/logs/medusa-dev.log" ]; then
    MEDUSA_LOG_SIZE=$(du -h "$PROJECT_ROOT/logs/medusa-dev.log" | cut -f1)
    echo "  • Medusa:  $PROJECT_ROOT/logs/medusa-dev.log ($MEDUSA_LOG_SIZE)"
    echo "             tail -f $PROJECT_ROOT/logs/medusa-dev.log"
else
    echo "  • Medusa:  No log file found"
fi

echo ""

if [ -f "$PROJECT_ROOT/logs/next-dev.log" ]; then
    NEXT_LOG_SIZE=$(du -h "$PROJECT_ROOT/logs/next-dev.log" | cut -f1)
    echo "  • Next.js: $PROJECT_ROOT/logs/next-dev.log ($NEXT_LOG_SIZE)"
    echo "             tail -f $PROJECT_ROOT/logs/next-dev.log"
else
    echo "  • Next.js: No log file found"
fi

echo ""
print_separator
echo ""

# Quick actions
print_info "Quick Actions:"
echo "  • Restart:  ./scripts/restart-dev.sh"
echo "  • Stop:     ./scripts/stop-dev.sh"
echo "  • Status:   ./scripts/status-dev.sh"
echo ""
print_separator
