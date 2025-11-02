#!/bin/bash

# restart-dev.sh
# Restart development environment for Medusa and Next.js storefront
# Usage: ./scripts/restart-dev.sh

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

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
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
print_info "Development Environment Restart Script"
print_separator
echo ""

# Check if processes are running
print_info "Checking for running processes..."
echo ""

# Find Medusa backend process
MEDUSA_PID=$(pgrep -f "pnpm.*--filter.*medusa.*dev" || echo "")
if [ -n "$MEDUSA_PID" ]; then
    print_warning "Found Medusa backend running (PID: $MEDUSA_PID)"
    MEDUSA_RUNNING=true
else
    print_info "Medusa backend is not running"
    MEDUSA_RUNNING=false
fi

# Find Next.js storefront process
NEXT_PID=$(pgrep -f "pnpm.*--filter.*medusa-next.*dev" || echo "")
if [ -n "$NEXT_PID" ]; then
    print_warning "Found Next.js storefront running (PID: $NEXT_PID)"
    NEXT_RUNNING=true
else
    print_info "Next.js storefront is not running"
    NEXT_RUNNING=false
fi

echo ""
print_separator

# Stop running processes if any
if [ "$MEDUSA_RUNNING" = true ] || [ "$NEXT_RUNNING" = true ]; then
    echo ""
    print_info "Stopping running processes..."
    echo ""
    
    if [ "$NEXT_RUNNING" = true ]; then
        print_info "Stopping Next.js storefront (PID: $NEXT_PID)..."
        kill -TERM "$NEXT_PID" 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        if ps -p "$NEXT_PID" > /dev/null 2>&1; then
            print_warning "Force killing Next.js storefront..."
            kill -9 "$NEXT_PID" 2>/dev/null || true
        fi
        print_success "Next.js storefront stopped"
    fi
    
    if [ "$MEDUSA_RUNNING" = true ]; then
        print_info "Stopping Medusa backend (PID: $MEDUSA_PID)..."
        kill -TERM "$MEDUSA_PID" 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        if ps -p "$MEDUSA_PID" > /dev/null 2>&1; then
            print_warning "Force killing Medusa backend..."
            kill -9 "$MEDUSA_PID" 2>/dev/null || true
        fi
        print_success "Medusa backend stopped"
    fi
    
    # Wait a bit for ports to be released
    sleep 2
    echo ""
fi

print_separator
echo ""
print_info "Checking infrastructure services..."
echo ""

# Check if Docker infrastructure is running
POSTGRES_RUNNING=$(docker ps --filter "name=cs-postgres-1" --format "{{.Names}}" 2>/dev/null || echo "")
REDIS_RUNNING=$(docker ps --filter "name=cs-redis-1" --format "{{.Names}}" 2>/dev/null || echo "")

if [ -z "$POSTGRES_RUNNING" ] || [ -z "$REDIS_RUNNING" ]; then
    print_warning "Infrastructure services not running. Starting Docker containers..."
    docker compose -f docker-compose.local.yml up -d
    sleep 3
    print_success "Infrastructure services started"
else
    print_success "Infrastructure services already running"
fi

echo ""
print_separator
echo ""
print_info "Starting development environment..."
echo ""

# Create log directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/logs"

# Start Medusa backend in background
print_info "Starting Medusa backend on port 9000..."
nohup pnpm --filter medusa dev > "$PROJECT_ROOT/logs/medusa-dev.log" 2>&1 &
MEDUSA_NEW_PID=$!
echo "$MEDUSA_NEW_PID" > "$PROJECT_ROOT/logs/medusa.pid"
print_success "Medusa backend started (PID: $MEDUSA_NEW_PID)"
print_info "Logs: $PROJECT_ROOT/logs/medusa-dev.log"

# Wait for Medusa to be ready
print_info "Waiting for Medusa backend to be ready..."
MEDUSA_READY=false
for i in {1..30}; do
    if curl -s http://localhost:9000/health > /dev/null 2>&1; then
        MEDUSA_READY=true
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

if [ "$MEDUSA_READY" = true ]; then
    print_success "Medusa backend is ready!"
else
    print_warning "Medusa backend health check timed out (this may be normal)"
fi

echo ""

# Start Next.js storefront in background
print_info "Starting Next.js storefront on port 8000..."
nohup pnpm --filter medusa-next dev > "$PROJECT_ROOT/logs/next-dev.log" 2>&1 &
NEXT_NEW_PID=$!
echo "$NEXT_NEW_PID" > "$PROJECT_ROOT/logs/next.pid"
print_success "Next.js storefront started (PID: $NEXT_NEW_PID)"
print_info "Logs: $PROJECT_ROOT/logs/next-dev.log"

# Wait for Next.js to be ready
print_info "Waiting for Next.js storefront to be ready..."
NEXT_READY=false
for i in {1..30}; do
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        NEXT_READY=true
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

if [ "$NEXT_READY" = true ]; then
    print_success "Next.js storefront is ready!"
else
    print_warning "Next.js storefront health check timed out (this may be normal)"
fi

echo ""
print_separator
echo ""
print_success "Development environment started successfully!"
echo ""
print_info "Services:"
echo "  • Medusa Backend:    http://localhost:9000"
echo "  • Medusa Admin:      http://localhost:9000/app"
echo "  • Next.js Storefront: http://localhost:8000"
echo ""
print_info "Logs:"
echo "  • Medusa:  tail -f $PROJECT_ROOT/logs/medusa-dev.log"
echo "  • Next.js: tail -f $PROJECT_ROOT/logs/next-dev.log"
echo ""
print_info "Process IDs:"
echo "  • Medusa:  $MEDUSA_NEW_PID (saved to logs/medusa.pid)"
echo "  • Next.js: $NEXT_NEW_PID (saved to logs/next.pid)"
echo ""
print_info "To stop services:"
echo "  • Run: ./scripts/stop-dev.sh"
echo "  • Or manually: kill $MEDUSA_NEW_PID $NEXT_NEW_PID"
echo ""
print_separator
