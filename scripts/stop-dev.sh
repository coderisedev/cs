#!/bin/bash

# stop-dev.sh
# Stop development environment for Medusa and Next.js storefront
# Usage: ./scripts/stop-dev.sh

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
print_info "Stopping Development Environment"
print_separator
echo ""

# Stop processes from PID files if they exist
if [ -f "$PROJECT_ROOT/logs/next.pid" ]; then
    NEXT_PID=$(cat "$PROJECT_ROOT/logs/next.pid")
    if ps -p "$NEXT_PID" > /dev/null 2>&1; then
        print_info "Stopping Next.js storefront (PID: $NEXT_PID)..."
        kill -TERM "$NEXT_PID" 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        if ps -p "$NEXT_PID" > /dev/null 2>&1; then
            print_warning "Force killing Next.js storefront..."
            kill -9 "$NEXT_PID" 2>/dev/null || true
        fi
        print_success "Next.js storefront stopped"
    else
        print_warning "Next.js PID file exists but process not running"
    fi
    rm -f "$PROJECT_ROOT/logs/next.pid"
else
    # Try to find by process name
    NEXT_PID=$(pgrep -f "pnpm.*--filter.*medusa-next.*dev" || echo "")
    if [ -n "$NEXT_PID" ]; then
        print_info "Stopping Next.js storefront (PID: $NEXT_PID)..."
        kill -TERM "$NEXT_PID" 2>/dev/null || true
        sleep 2
        if ps -p "$NEXT_PID" > /dev/null 2>&1; then
            kill -9 "$NEXT_PID" 2>/dev/null || true
        fi
        print_success "Next.js storefront stopped"
    else
        print_info "Next.js storefront is not running"
    fi
fi

echo ""

if [ -f "$PROJECT_ROOT/logs/medusa.pid" ]; then
    MEDUSA_PID=$(cat "$PROJECT_ROOT/logs/medusa.pid")
    if ps -p "$MEDUSA_PID" > /dev/null 2>&1; then
        print_info "Stopping Medusa backend (PID: $MEDUSA_PID)..."
        kill -TERM "$MEDUSA_PID" 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        if ps -p "$MEDUSA_PID" > /dev/null 2>&1; then
            print_warning "Force killing Medusa backend..."
            kill -9 "$MEDUSA_PID" 2>/dev/null || true
        fi
        print_success "Medusa backend stopped"
    else
        print_warning "Medusa PID file exists but process not running"
    fi
    rm -f "$PROJECT_ROOT/logs/medusa.pid"
else
    # Try to find by process name
    MEDUSA_PID=$(pgrep -f "pnpm.*--filter.*medusa.*dev" || echo "")
    if [ -n "$MEDUSA_PID" ]; then
        print_info "Stopping Medusa backend (PID: $MEDUSA_PID)..."
        kill -TERM "$MEDUSA_PID" 2>/dev/null || true
        sleep 2
        if ps -p "$MEDUSA_PID" > /dev/null 2>&1; then
            kill -9 "$MEDUSA_PID" 2>/dev/null || true
        fi
        print_success "Medusa backend stopped"
    else
        print_info "Medusa backend is not running"
    fi
fi

echo ""
print_separator
echo ""
print_success "Development environment stopped"
print_info "Infrastructure services (Docker) are still running"
print_info "To stop infrastructure: docker compose -f docker-compose.local.yml down"
echo ""
print_separator
