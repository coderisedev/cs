#!/usr/bin/env bash
set -euo pipefail

# GCE Backend Deployment Playbook Implementation
# Based on docs/runbooks/gce-backend-playbook.md

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--step <step-number>] [--domain <root-domain>] [--dry-run]

Implements the GCE backend deployment playbook. If no step specified, runs all steps.

Options:
  --step <1-9>    Run specific step only
  --domain        Root domain for external health checks (e.g. example.com)
  --dry-run       Show commands without executing
  --help, -h      Show this help

Steps:
  1 - Prepare directories & templates
  2 - Install system dependencies
  3 - Populate secrets & config
  4 - Configure Cloudflare tunnel
  5 - Configure GitHub secrets
  6 - Dry-run deployment workflow
  7 - Verify and log evidence
  8 - Security & backups
  9 - Promote to production
USAGE
}

DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_GROUP="${DEPLOY_GROUP:-deploy}"
DRY_RUN=false
STEP=""
VERIFY_DOMAIN="${VERIFY_DOMAIN:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

step() {
  echo -e "${BLUE}[STEP]${NC} $1"
}

run_cmd() {
  local cmd="$1"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo -e "${YELLOW}[DRY-RUN]${NC} $cmd"
  else
    log "Running: $cmd"
    eval "$cmd"
  fi
}

ensure_deploy_identity() {
  if ! getent group "$DEPLOY_GROUP" >/dev/null 2>&1; then
    log "Creating deploy group $DEPLOY_GROUP"
    run_cmd "sudo groupadd --system $DEPLOY_GROUP"
  fi

  if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
    log "Creating deploy user $DEPLOY_USER"
    run_cmd "sudo useradd --system --create-home --shell /bin/bash --gid $DEPLOY_GROUP $DEPLOY_USER"
  fi
}

ensure_postgresql_repo() {
  local repo_file="/etc/apt/sources.list.d/pgdg.list"
  if [[ -f "$repo_file" ]]; then
    return
  fi

  log "Adding PostgreSQL APT repository for version 15"

  local distro_codename
  distro_codename="$(lsb_release -cs)"
  case "$distro_codename" in
    questing|plucky)
      warn "PostgreSQL upstream repository not yet available for $distro_codename; falling back to noble packages"
      distro_codename="noble"
      ;;
  esac

  run_cmd "sudo apt-get install -y wget gnupg2 software-properties-common"
  run_cmd "sudo mkdir -p /etc/apt/keyrings"
  run_cmd "sudo rm -f /etc/apt/keyrings/postgresql.gpg"
  run_cmd "wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/keyrings/postgresql.gpg"
  run_cmd "echo \"deb [signed-by=/etc/apt/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt/ ${distro_codename}-pgdg main\" | sudo tee $repo_file > /dev/null"
  run_cmd "sudo apt-get update"
}

install_database_stack() {
  local distro_codename
  distro_codename="$(lsb_release -cs)"

  case "$distro_codename" in
    questing|plucky)
      warn "PostgreSQL 15 packages are not available for $distro_codename; installing distro-provided versions instead"
      if [[ -f /etc/apt/sources.list.d/pgdg.list ]]; then
        warn "Removing incompatible PostgreSQL repository override"
        run_cmd "sudo rm -f /etc/apt/sources.list.d/pgdg.list"
        run_cmd "sudo apt-get update"
      fi
      run_cmd "sudo apt-get install -y postgresql postgresql-client redis-server redis-tools"
      ;;
    *)
      ensure_postgresql_repo
      run_cmd "sudo apt-get install -y postgresql-15 postgresql-client-15 redis-server"
      ;;
  esac
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --step)
      STEP="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --domain)
      VERIFY_DOMAIN="$2"
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

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GCP_INFRA_DIR="$REPO_ROOT/infra/gcp"

step_1_prepare_directories() {
  step "Step 1: Prepare Directories & Templates"

  ensure_deploy_identity

  log "Creating directory structure /srv/cs/{env,bin,logs}"
  run_cmd "sudo mkdir -p /srv/cs/{env,bin,logs}"

  log "Copying template files from repository"
  run_cmd "sudo cp $GCP_INFRA_DIR/.env.example /srv/cs/.env"
  run_cmd "sudo cp $GCP_INFRA_DIR/env/medusa.env.example /srv/cs/env/medusa.env"
  run_cmd "sudo cp $GCP_INFRA_DIR/env/strapi.env.example /srv/cs/env/strapi.env"
  run_cmd "sudo cp $GCP_INFRA_DIR/docker-compose.yml /srv/cs/docker-compose.yml"
  run_cmd "sudo cp $GCP_INFRA_DIR/bin/collect-health.sh /srv/cs/bin/collect-health.sh"

  log "Setting permissions"
  run_cmd "sudo chmod 640 /srv/cs/.env /srv/cs/env/*.env"
  run_cmd "sudo chmod 750 /srv/cs/bin/collect-health.sh"
  run_cmd "sudo chown $DEPLOY_USER:$DEPLOY_GROUP -R /srv/cs"

  log "Directory structure prepared successfully"
}

step_2_install_dependencies() {
  step "Step 2: Install System Dependencies"

  ensure_deploy_identity

  log "Installing Docker Engine + Compose plugin"
  run_cmd "sudo apt-get update"
  run_cmd "sudo apt-get install -y ca-certificates curl gnupg lsb-release"
  run_cmd "sudo mkdir -p /etc/apt/keyrings"
  run_cmd "sudo rm -f /etc/apt/keyrings/docker.gpg"
  run_cmd "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg"
  run_cmd "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null"
  run_cmd "sudo apt-get update"
  run_cmd "sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin"

  log "Installing PostgreSQL and Redis services"
  install_database_stack

  log "Adding deploy user to docker group"
  run_cmd "sudo usermod -aG docker $DEPLOY_USER"

  log "Optionally installing cloudflared"
  run_cmd "which cloudflared || (wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && sudo dpkg -i cloudflared-linux-amd64.deb && rm cloudflared-linux-amd64.deb)"

  log "System dependencies installed successfully"
}

step_3_populate_secrets() {
  step "Step 3: Populate Secrets & Config"

  warn "This step requires manual intervention to update secrets"

  log "Update /srv/cs/.env with your registry details"
  echo "Edit /srv/cs/.env and set:"
  echo "  MEDUSA_IMAGE=ghcr.io/<your-org>/cs-medusa"
  echo "  STRAPI_IMAGE=ghcr.io/<your-org>/cs-strapi"

  log "Update /srv/cs/env/medusa.env with production values"
  echo "Replace placeholders in /srv/cs/env/medusa.env:"
  echo "  DATABASE_URL (PostgreSQL connection)"
  echo "  REDIS_URL (Redis connection)"
  echo "  JWT_SECRET, COOKIE_SECRET"
  echo "  STORE_CORS, ADMIN_CORS, AUTH_CORS domains"

  log "Update /srv/cs/env/strapi.env with production values"
  echo "Replace placeholders in /srv/cs/env/strapi.env:"
  echo "  DATABASE_URL (PostgreSQL connection)"
  echo "  APP_KEYS, API_TOKEN_SALT, JWT_SECRET, etc."
  echo "  Upload provider credentials"
  echo "  Webhook URLs for integrations"

  log "Store real values in team vault (GCP Secret Manager / 1Password)"

  warn "Remember to secure PostgreSQL pg_hba.conf and Redis with strong passwords"
}

step_4_configure_cloudflare() {
  step "Step 4: Configure Cloudflare Tunnel"

  log "Creating Cloudflare tunnel"
  run_cmd "cloudflared tunnel create cs-tunnel || true"

  log "Creating cloudflared config directory"
  run_cmd "sudo mkdir -p /etc/cloudflared"

  warn "Update /etc/cloudflared/config.yml with your domains"
  cat <<'CONFIG'
# Example /etc/cloudflared/config.yml - Update with your domains
tunnel: cs-tunnel
credentials-file: /etc/cloudflared/cs-tunnel.json
ingress:
  - hostname: api.example.com
    service: http://127.0.0.1:9000
  - hostname: content.example.com
    service: http://127.0.0.1:1337
  - service: http_status:404
CONFIG

  log "Routing DNS (update with your domains)"
  echo "Run these commands with your actual domains:"
  echo "  cloudflared tunnel route dns cs-tunnel api.yourdomain.com"
  echo "  cloudflared tunnel route dns cs-tunnel content.yourdomain.com"

  if [[ -f "/etc/cloudflared/cs-tunnel.json" ]]; then
    log "Enabling cloudflared service"
    run_cmd "sudo systemctl enable --now cloudflared"
    run_cmd "sudo systemctl status cloudflared"
  else
    warn "Skipping cloudflared service enablement; /etc/cloudflared/cs-tunnel.json not found yet"
  fi

  log "Cloudflare tunnel configured"
}

step_5_configure_github() {
  step "Step 5: Configure GitHub Secrets"

  warn "This step requires manual configuration in GitHub repository settings"

  echo "In repository settings → Secrets and variables / Actions, add:"
  echo "  GCE_HOST – host/IP of the VM"
  echo "  GCE_USER – SSH user (must own /srv/cs and belong to docker)"
  echo "  GCE_SSH_KEY – private key with access to the VM"
  echo "  Optional: GHCR_WRITE_TOKEN if GITHUB_TOKEN cannot push to GHCR"

  log "GitHub secrets configuration guide provided"
}

step_6_dry_run_deployment() {
  step "Step 6: Dry-Run the Deployment Workflow"

  log "To test the deployment workflow:"
  echo "1. Push to staging branch (or trigger 'Deploy Services' manually)"
  echo "2. Workflow will:"
  echo "   - Build apps/*/Dockerfile"
  echo "   - Push GHCR tags"
  echo "   - Copy deploy scripts"
  echo "   - Execute deploy.sh with current SHA"
  echo "3. Verify logs in /srv/cs/logs/"

  log "Deployment workflow test procedure provided"
}

step_7_verify_evidence() {
  step "Step 7: Verify and Log Evidence"

  if [[ -n "$VERIFY_DOMAIN" ]]; then
    log "Running external health checks against $VERIFY_DOMAIN"
    run_cmd "curl -I https://api.${VERIFY_DOMAIN}/store/health || warn 'API health check failed'"
    run_cmd "curl -I https://content.${VERIFY_DOMAIN}/health || warn 'Content health check failed'"
  else
    warn "Skipping external health checks; set VERIFY_DOMAIN=<root-domain> to enable"
  fi

  log "Creating status log directory"
  run_cmd "mkdir -p $REPO_ROOT/docs/runbooks"

  warn "Append summaries, tunnel IPs, and GH Actions link to docs/runbooks/status-log.md"
  echo "Capture deployment log tail from workflow summary for audit"

  log "Health check procedures completed"
}

step_8_security_backups() {
  step "Step 8: Security & Backups"

  log "Configuring security measures"
  run_cmd "sudo ufw allow 22"
  run_cmd "sudo ufw allow 80"
  run_cmd "sudo ufw allow 443"
  run_cmd "sudo ufw --force enable"

  warn "Schedule PostgreSQL/Redis backups"
  echo "Add cron jobs for logical dumps or configure snapshot backups"

  warn "Document manual rollback procedures"
  echo "See infra/gcp/README.md for rollback commands"
  echo "Set up incident notification channels"

  log "Security and backup procedures configured"
}

step_9_promote_production() {
  step "Step 9: Promote to Production"

  log "Production promotion procedure"
  echo "1. Repeat workflow on main branch once staging verification is complete"
  echo "2. Confirm Cloudflare tunnel endpoints return HTTP 200"
  echo "3. Update status log with production evidence"

  warn "Ensure all staging tests pass before production promotion"

  log "Production promotion guide provided"
}

# Main execution
main() {
  log "Starting GCE Backend Deployment Playbook Implementation"

  if [[ -n "$STEP" ]]; then
    case "$STEP" in
      1) step_1_prepare_directories ;;
      2) step_2_install_dependencies ;;
      3) step_3_populate_secrets ;;
      4) step_4_configure_cloudflare ;;
      5) step_5_configure_github ;;
      6) step_6_dry_run_deployment ;;
      7) step_7_verify_evidence ;;
      8) step_8_security_backups ;;
      9) step_9_promote_production ;;
      *)
        error "Invalid step number. Choose 1-9."
        exit 1
        ;;
    esac
  else
    step_1_prepare_directories
    step_2_install_dependencies
    step_3_populate_secrets
    step_4_configure_cloudflare
    step_5_configure_github
    step_6_dry_run_deployment
    step_7_verify_evidence
    step_8_security_backups
    step_9_promote_production
  fi

  log "GCE Backend Deployment Playbook Implementation completed!"
  warn "Remember to:"
  echo "  - Replace placeholder values with actual production secrets"
  echo "  - Test thoroughly in staging before production"
  echo "  - Keep your team vault updated with current credentials"
  echo "  - Monitor logs and health checks regularly"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
