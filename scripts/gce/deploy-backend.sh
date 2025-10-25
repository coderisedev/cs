#!/usr/bin/env bash
set -euo pipefail

# GCE Backend Deployment Orchestrator
# This script orchestrates the complete GCE backend deployment process

usage() {
  cat <<USAGE
Usage: $(basename "$0") [command] [options]

GCE Backend Deployment Orchestrator - Complete deployment automation.

Commands:
  setup         Run complete setup (all steps)
  deps          Install system dependencies only
  secrets       Configure secrets and environment variables
  tunnel        Configure Cloudflare tunnel
  verify        Verify deployment and run health checks
  status        Show deployment status
  help          Show this help

Options:
  --dry-run     Show commands without executing
  --domain      Base domain for configuration and health checks
  --step        Run specific step number (1-9)

Examples:
  $(basename "$0") setup                    # Run complete setup
  $(basename "$0) setup --dry-run          # Preview setup commands
  $(basename "$0) deps                      # Install dependencies only
  $(basename "$0) verify --domain example.com  # Verify with domain
  $(basename "$0) setup --step 3            # Run step 3 only
USAGE
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

DRY_RUN=false
DOMAIN=""
COMMAND=""
STEP=""

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

header() {
  echo -e "${BLUE}$1${NC}"
}

banner() {
  echo ""
  echo -e "${CYAN}================================================================${NC}"
  echo -e "${CYAN}  GCE Backend Deployment Orchestrator${NC}"
  echo -e "${CYAN}================================================================${NC}"
  echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    setup|deps|secrets|tunnel|verify|status|help)
      COMMAND="$1"
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      export DRY_RUN=true
      shift
      ;;
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --step)
      STEP="$2"
      shift 2
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

show_status() {
  header "Deployment Status"

  echo "Directory Structure:"
  ls -la /srv/cs/ 2>/dev/null || echo "  /srv/cs not found"

  echo ""
  echo "Service Status:"
  for service in docker postgresql redis-server cloudflared; do
    if systemctl is-active --quiet "$service" 2>/dev/null; then
      echo "  $service: ${GREEN}running${NC}"
    else
      echo "  $service: ${RED}stopped${NC}"
    fi
  done

  echo ""
  echo "Docker Services:"
  if [[ -d "/srv/cs" ]]; then
    cd /srv/cs
    if [[ -f "docker-compose.yml" ]]; then
      docker compose ps 2>/dev/null || echo "  No running containers"
    else
      echo "  No docker-compose.yml found"
    fi
  fi

  echo ""
  echo "Recent Logs:"
  echo "  Latest deploy log: $(ls -t /srv/cs/logs/deploy-*.log 2>/dev/null | head -1 || echo "None")"
  echo "  Latest health log: $(ls -t /srv/cs/logs/health-*.log 2>/dev/null | head -1 || echo "None")"

  echo ""
  echo "Configuration Files:"
  for file in .env env/medusa.env env/strapi.env; do
    if [[ -f "/srv/cs/$file" ]]; then
      echo "  /srv/cs/$file: ${GREEN}exists${NC}"
    else
      echo "  /srv/cs/$file: ${RED}missing${NC}"
    fi
  done
}

run_setup() {
  header "Running Complete Setup"

  log "This will execute the entire GCE backend deployment playbook"
  warn "This process may take 20-30 minutes"
  echo ""

  read -p "Continue? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Setup cancelled"
    return 0
  fi

  # Run the setup script
  local setup_args=()
  if [[ "$DRY_RUN" == "true" ]]; then
    setup_args+=(--dry-run)
  fi
  if [[ -n "$STEP" ]]; then
    setup_args+=(--step "$STEP")
  fi

  "$SCRIPT_DIR/setup-backend.sh" "${setup_args[@]}"
}

run_deps() {
  header "Installing System Dependencies"

  local deps_args=()
  if [[ "$DRY_RUN" == "true" ]]; then
    deps_args+=(--dry-run)
  fi

  "$SCRIPT_DIR/install-deps.sh" "${deps_args[@]}"
}

run_secrets() {
  header "Configuring Secrets and Environment Variables"

  local secrets_args=()
  if [[ "$DRY_RUN" == "true" ]]; then
    secrets_args+=(--dry-run)
  fi

  "$SCRIPT_DIR/configure-secrets.sh" "${secrets_args[@]}"
}

run_tunnel() {
  header "Configuring Cloudflare Tunnel"

  local tunnel_args=()
  if [[ "$DRY_RUN" == "true" ]]; then
    tunnel_args+=(--dry-run)
  fi

  "$SCRIPT_DIR/configure-tunnel.sh" "${tunnel_args[@]}"
}

run_verify() {
  header "Verifying Deployment"

  local verify_args=()
  if [[ "$DRY_RUN" == "true" ]]; then
    verify_args+=(--dry-run)
  fi
  if [[ -n "$DOMAIN" ]]; then
    verify_args+=(--domain "$DOMAIN")
  fi

  "$SCRIPT_DIR/verify-deployment.sh" "${verify_args[@]}"
}

show_next_steps() {
  header "Next Steps"

  echo "Deployment setup complete! Here's what to do next:"
  echo ""
  echo "1. Configure GitHub Secrets:"
  echo "   - GCE_HOST: Your VM's IP address"
  echo "   - GCE_USER: SSH username (deploy)"
  echo "   - GCE_SSH_KEY: Private SSH key"
  echo "   See: docs/runbooks/github-secrets-guide.md"
  echo ""
  echo "2. Test Deployment:"
  echo "   - Push to staging branch to trigger deployment"
  echo "   - Or run manually via GitHub Actions"
  echo ""
  echo "3. Verify Deployment:"
  echo "   - $0 verify --domain your-domain.com"
  echo "   - Check health endpoints"
  echo ""
  echo "4. Monitor and Maintain:"
  echo "   - Check logs: /srv/cs/logs/"
  echo "   - Update status log: docs/runbooks/status-log.md"
  echo "   - Regular backups and security updates"
  echo ""
}

main() {
  banner

  case "${COMMAND:-help}" in
    setup)
      run_setup
      show_next_steps
      ;;
    deps)
      run_deps
      ;;
    secrets)
      run_secrets
      ;;
    tunnel)
      run_tunnel
      ;;
    verify)
      run_verify
      ;;
    status)
      show_status
      ;;
    help|"")
      usage
      ;;
    *)
      error "Unknown command: $COMMAND"
      usage
      exit 1
      ;;
  esac
}

# Check if running as root for certain operations
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  if [[ "$COMMAND" =~ ^(setup|deps|secrets|tunnel)$ ]] && [[ "$EUID" -ne 0 ]] && [[ "$DRY_RUN" != "true" ]]; then
    error "This command requires root privileges. Run with sudo."
    echo "Example: sudo $0 $COMMAND"
    exit 1
  fi

  main "$@"
fi