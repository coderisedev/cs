#!/usr/bin/env bash
set -euo pipefail

# Deployment Verification and Health Check Script
# This script verifies the GCE backend deployment and performs health checks

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--domain your-domain.com] [--dry-run] [--help]

Verifies the GCE backend deployment and performs comprehensive health checks.

Options:
  --domain     Base domain for health checks (e.g., cockpitsimulator.com)
  --dry-run    Show commands without executing
  --help, -h   Show this help
USAGE
}

DOMAIN=""
DRY_RUN=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

failed() {
  echo -e "${RED}[FAILED]${NC} $1"
}

header() {
  echo -e "${BLUE}$1${NC}"
}

run_cmd() {
  local cmd="$1"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo -e "${YELLOW}[DRY-RUN]${NC} $cmd"
  else
    eval "$cmd"
  fi
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      error "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

check_local_services() {
  header "Checking Local Services"

  local all_good=true

  # Check Docker services
  log "Checking Docker services..."
  if docker compose ps --format "table {{.Name}}\t{{.Status}}" | grep -q "running"; then
    success "Docker services are running"
  else
    failed "Some Docker services are not running"
    all_good=false
    docker compose ps
  fi

  # Check Medusa health locally
  log "Checking Medusa local health..."
  if curl -s --fail http://127.0.0.1:9000/store/health >/dev/null; then
    success "Medusa local health check passed"
  else
    failed "Medusa local health check failed"
    all_good=false
  fi

  # Check Strapi health locally
  log "Checking Strapi local health..."
  if curl -s --fail http://127.0.0.1:1337/health >/dev/null; then
    success "Strapi local health check passed"
  else
    failed "Strapi local health check failed"
    all_good=false
  fi

  if [[ "$all_good" == "true" ]]; then
    success "All local services healthy"
  else
    error "Some local services are unhealthy"
    return 1
  fi
}

check_external_services() {
  header "Checking External Services"

  if [[ -z "$DOMAIN" ]]; then
    warn "No domain provided. Skipping external health checks."
    warn "Use --domain your-domain.com to enable external checks."
    return 0
  fi

  local api_domain="api.$DOMAIN"
  local content_domain="content.$DOMAIN"

  log "Checking external API: https://$api_domain/store/health"

  local api_status
  api_status=$(curl -s -o /dev/null -w "%{http_code}" "https://$api_domain/store/health" || echo "000")

  if [[ "$api_status" == "200" ]]; then
    success "API health check passed (HTTP $api_status)"
  else
    failed "API health check failed (HTTP $api_status)"
  fi

  log "Checking external Content: https://$content_domain/health"

  local content_status
  content_status=$(curl -s -o /dev/null -w "%{http_code}" "https://$content_domain/health" || echo "000")

  if [[ "$content_status" == "200" ]]; then
    success "Content health check passed (HTTP $content_status)"
  else
    failed "Content health check failed (HTTP $content_status)"
  fi

  # Check Cloudflare tunnel status
  log "Checking Cloudflare tunnel status..."
  if systemctl is-active --quiet cloudflared; then
    success "Cloudflare tunnel is running"
  else
    failed "Cloudflare tunnel is not running"
  fi
}

check_database_connectivity() {
  header "Checking Database Connectivity"

  # Check PostgreSQL
  log "Checking PostgreSQL connectivity..."
  if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    success "PostgreSQL is ready"
  else
    failed "PostgreSQL is not ready"
  fi

  # Check Redis
  log "Checking Redis connectivity..."
  if redis-cli -h localhost -p 6379 ping 2>/dev/null | grep -q "PONG"; then
    success "Redis is responding"
  else
    failed "Redis is not responding"
  fi
}

check_docker_images() {
  header "Checking Docker Images"

  local compose_file="/srv/cs/docker-compose.yml"

  if [[ -f "$compose_file" ]]; then
    log "Verifying Docker images in compose file..."

    # Extract image names from docker-compose.yml
    local images
    images=$(grep -E "^\s*image:" "$compose_file" | awk '{print $2}' | sed 's/"//g' | sed 's/\${.*}//g')

    for image in $images; do
      log "Checking image: $image"
      if docker image inspect "$image" >/dev/null 2>&1; then
        success "Image $image exists locally"
      else
        warn "Image $image not found locally (will be pulled)"
      fi
    done
  else
    warn "Docker compose file not found at $compose_file"
  fi
}

check_system_resources() {
  header "Checking System Resources"

  # Disk space
  local disk_usage
  disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')

  if [[ "$disk_usage" -lt 80 ]]; then
    success "Disk usage: ${disk_usage}% (OK)"
  elif [[ "$disk_usage" -lt 90 ]]; then
    warn "Disk usage: ${disk_usage}% (Warning)"
  else
    failed "Disk usage: ${disk_usage}% (Critical)"
  fi

  # Memory
  local mem_usage
  mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')

  if [[ "$mem_usage" -lt 80 ]]; then
    success "Memory usage: ${mem_usage}% (OK)"
  elif [[ "$mem_usage" -lt 90 ]]; then
    warn "Memory usage: ${mem_usage}% (Warning)"
  else
    failed "Memory usage: ${mem_usage}% (Critical)"
  fi

  # Load average
  local load_avg
  load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')

  if (( $(echo "$load_avg < 2.0" | bc -l) )); then
    success "Load average: $load_avg (OK)"
  elif (( $(echo "$load_avg < 4.0" | bc -l) )); then
    warn "Load average: $load_avg (Warning)"
  else
    failed "Load average: $load_avg (Critical)"
  fi
}

generate_health_report() {
  header "Generating Health Report"

  local timestamp
  timestamp=$(date --utc +%Y-%m-%dT%H:%M:%SZ)
  local report_file="/srv/cs/logs/health-report-$timestamp.log"

  run_cmd "mkdir -p /srv/cs/logs"

  {
    echo "=== GCE Backend Health Report ==="
    echo "Timestamp: $timestamp"
    echo "Domain: ${DOMAIN:-N/A}"
    echo ""
    echo "=== Docker Services ==="
    docker compose ps
    echo ""
    echo "=== Local Health Checks ==="
    echo "Medusa: $(curl -s http://127.0.0.1:9000/store/health 2>/dev/null || echo 'FAILED')"
    echo "Strapi: $(curl -s http://127.0.0.1:1337/health 2>/dev/null || echo 'FAILED')"
    echo ""
    echo "=== External Health Checks ==="
    if [[ -n "$DOMAIN" ]]; then
      echo "API: https://api.$DOMAIN/store/health"
      echo "Content: https://content.$DOMAIN/health"
    else
      echo "Skipped (no domain provided)"
    fi
    echo ""
    echo "=== System Resources ==="
    echo "Disk: $(df -h / | awk 'NR==2 {print $5}')"
    echo "Memory: $(free -h | awk 'NR==2 {printf "%s/%s (%.0f%%)", $3, $2, $3*100/$2}')"
    echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
    echo ""
    echo "=== Service Status ==="
    echo "PostgreSQL: $(systemctl is-active postgresql)"
    echo "Redis: $(systemctl is-active redis-server)"
    echo "Cloudflare Tunnel: $(systemctl is-active cloudflared)"
  } | tee "$report_file"

  success "Health report saved to: $report_file"
}

run_comprehensive_health_check() {
  header "Running Comprehensive Health Check"

  log "Executing built-in health collection script..."

  if [[ -x "/srv/cs/bin/collect-health.sh" ]]; then
    run_cmd "/srv/cs/bin/collect-health.sh"

    # Find the most recent health log
    local latest_log
    latest_log=$(ls -t /srv/cs/logs/health-*.log 2>/dev/null | head -1)

    if [[ -n "$latest_log" ]]; then
      log "Latest health log: $latest_log"
      echo "Contents:"
      cat "$latest_log"
    fi
  else
    warn "Health collection script not found at /srv/cs/bin/collect-health.sh"
  fi
}

create_deployment_evidence() {
  header "Creating Deployment Evidence"

  local timestamp
  timestamp=$(date --utc +%Y-%m-%dT%H:%M:%SZ)

  echo ""
  header "Deployment Evidence Summary"
  echo "Timestamp: $timestamp"
  echo "Domain: ${DOMAIN:-N/A}"
  echo ""

  if [[ -n "$DOMAIN" ]]; then
    echo "External Health Checks:"
    echo "  API: curl -I https://api.$DOMAIN/store/health"
    echo "  Content: curl -I https://content.$DOMAIN/health"
    echo ""
  fi

  echo "Local Health Checks:"
  echo "  Medusa: curl -I http://127.0.0.1:9000/store/health"
  echo "  Strapi: curl -I http://127.0.0.1:1337/health"
  echo ""

  echo "Service Status:"
  echo "  Docker: $(systemctl is-active docker)"
  echo "  PostgreSQL: $(systemctl is-active postgresql)"
  echo "  Redis: $(systemctl is-active redis-server)"
  echo "  Cloudflare Tunnel: $(systemctl is-active cloudflared)"
  echo ""

  echo "Deployment Logs:"
  echo "  Latest: $(ls -t /srv/cs/logs/deploy-*.log 2>/dev/null | head -1 || echo 'None found')"
  echo "  Health: $(ls -t /srv/cs/logs/health-*.log 2>/dev/null | head -1 || echo 'None found')"
  echo ""

  warn "Remember to add this evidence to docs/runbooks/status-log.md"
}

main() {
  header "GCE Backend Deployment Verification"

  if [[ ! -d "/srv/cs" ]]; then
    error "Directory /srv/cs not found. Run the setup script first."
    exit 1
  fi

  cd /srv/cs

  log "Starting comprehensive deployment verification..."
  echo ""

  # Run all checks
  check_local_services || warn "Local service issues detected"
  check_external_services
  check_database_connectivity
  check_docker_images
  check_system_resources
  run_comprehensive_health_check
  generate_health_report
  create_deployment_evidence

  header "Verification Complete"
  success "Deployment verification completed!"

  warn "Next steps:"
  echo "  1. Review the health report"
  echo "  2. Fix any failed checks"
  echo "  3. Update docs/runbooks/status-log.md with evidence"
  echo "  4. Monitor services regularly"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi