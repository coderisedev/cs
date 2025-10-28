#!/usr/bin/env bash
set -euo pipefail

# Secrets Configuration Script for GCE Backend
# This script helps configure all required secrets and environment variables

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--dry-run] [--help]

Guides through configuration of all required secrets and environment variables
for the GCE backend deployment.

Options:
  --dry-run    Show commands without executing
  --help, -h   Show this help
USAGE
}

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

header() {
  echo -e "${BLUE}$1${NC}"
}

question() {
  echo -e "${CYAN}[Q]${NC} $1"
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

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
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

check_prerequisites() {
  header "Checking Prerequisites"

  if [[ ! -d "/srv/cs" ]]; then
    error "Directory /srv/cs not found. Run setup script first."
    exit 1
  fi

  if [[ ! -f "/srv/cs/.env" ]]; then
    error "File /srv/cs/.env not found. Run setup script first."
    exit 1
  fi

  log "Prerequisites check passed"
}

configure_registry_images() {
  header "Configure Container Registry Images"

  question "What is your GitHub organization or username?"
  read -r GITHUB_ORG

  question "What is your repository name? (default: cs-tw)"
  read -r REPO_NAME
  REPO_NAME=${REPO_NAME:-cs-tw}

  MEDUSA_IMAGE="ghcr.io/$GITHUB_ORG/cs-medusa"
  STRAPI_IMAGE="ghcr.io/$GITHUB_ORG/cs-strapi"

  log "Updating /srv/cs/.env with registry information"
  run_cmd "sudo sed -i 's|ghcr.io/<org>/cs-medusa|$MEDUSA_IMAGE|' /srv/cs/.env"
  run_cmd "sudo sed -i 's|ghcr.io/<org>/cs-strapi|$STRAPI_IMAGE|' /srv/cs/.env"

  echo -e "${CYAN}Registry configuration:${NC}"
  echo "  Medusa Image: $MEDUSA_IMAGE"
  echo "  Strapi Image: $STRAPI_IMAGE"
  echo ""
}

configure_database_secrets() {
  header "Configure Database Secrets"

  warn "Please ensure PostgreSQL and Redis are installed and running"

  question "PostgreSQL host (default: host.docker.internal):"
  read -r PG_HOST
  PG_HOST=${PG_HOST:-host.docker.internal}

  question "PostgreSQL port (default: 5432):"
  read -r PG_PORT
  PG_PORT=${PG_PORT:-5432}

  question "PostgreSQL database user (default: cs):"
  read -r PG_USER
  PG_USER=${PG_USER:-cs}

  question "PostgreSQL password for user $PG_USER:"
  read -s -r PG_PASSWORD
  echo ""

  question "Redis host (default: host.docker.internal):"
  read -r REDIS_HOST
  REDIS_HOST=${REDIS_HOST:-host.docker.internal}

  question "Redis port (default: 6379):"
  read -r REDIS_PORT
  REDIS_PORT=${REDIS_PORT:-6379}

  question "Redis password (leave empty if no password):"
  read -s -r REDIS_PASSWORD
  echo ""

  # Construct connection URLs
  PG_URL="postgres://$PG_USER:$PG_PASSWORD@$PG_HOST:$PG_PORT/medusa_production"
  REDIS_URL="redis://$REDIS_HOST:$REDIS_PORT"
  if [[ -n "$REDIS_PASSWORD" ]]; then
    REDIS_URL="redis://:$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT"
  fi

  log "Updating Medusa database configuration"
  run_cmd "sudo sed -i \"s|DATABASE_URL=.*|DATABASE_URL=$PG_URL|\" /srv/cs/env/medusa.env"
  run_cmd "sudo sed -i \"s|REDIS_URL=.*|REDIS_URL=$REDIS_URL|\" /srv/cs/env/medusa.env"

  log "Updating Strapi database configuration"
  STRAPI_PG_URL="postgres://$PG_USER:$PG_PASSWORD@$PG_HOST:$PG_PORT/strapi_production"
  run_cmd "sudo sed -i \"s|DATABASE_URL=.*|DATABASE_URL=$STRAPI_PG_URL|\" /srv/cs/env/strapi.env"

  echo -e "${CYAN}Database configuration:${NC}"
  echo "  PostgreSQL: $PG_URL"
  echo "  Redis: $REDIS_URL"
  echo ""
}

generate_secrets() {
  header "Generate Application Secrets"

  log "Generating secure secrets..."

  # Generate secrets using OpenSSL
  JWT_SECRET=$(openssl rand -base64 32)
  COOKIE_SECRET=$(openssl rand -base64 32)
  APP_KEYS=($(openssl rand -base64 32) $(openssl rand -base64 32) $(openssl rand -base64 32) $(openssl rand -base64 32))
  API_TOKEN_SALT=$(openssl rand -base64 32)
  ADMIN_JWT_SECRET=$(openssl rand -base64 32)
  TRANSFER_TOKEN_SALT=$(openssl rand -base64 32)

  log "Updating Medusa secrets"
  run_cmd "sudo sed -i \"s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|\" /srv/cs/env/medusa.env"
  run_cmd "sudo sed -i \"s|COOKIE_SECRET=.*|COOKIE_SECRET=$COOKIE_SECRET|\" /srv/cs/env/medusa.env"

  log "Updating Strapi secrets"
  run_cmd "sudo sed -i \"s|APP_KEYS=.*|APP_KEYS=${APP_KEYS[0]},${APP_KEYS[1]},${APP_KEYS[2]},${APP_KEYS[3]}|\" /srv/cs/env/strapi.env"
  run_cmd "sudo sed -i \"s|API_TOKEN_SALT=.*|API_TOKEN_SALT=$API_TOKEN_SALT|\" /srv/cs/env/strapi.env"
  run_cmd "sudo sed -i \"s|ADMIN_JWT_SECRET=.*|ADMIN_JWT_SECRET=$ADMIN_JWT_SECRET|\" /srv/cs/env/strapi.env"
  run_cmd "sudo sed -i \"s|TRANSFER_TOKEN_SALT=.*|TRANSFER_TOKEN_SALT=$TRANSFER_TOKEN_SALT|\" /srv/cs/env/strapi.env"
  run_cmd "sudo sed -i \"s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|\" /srv/cs/env/strapi.env"

  warn "Save these secrets to your vault (1Password/GCP Secret Manager):"
  echo -e "${CYAN}Generated secrets (SAVE THESE):${NC}"
  echo "  JWT_SECRET: $JWT_SECRET"
  echo "  COOKIE_SECRET: $COOKIE_SECRET"
  echo "  APP_KEYS: ${APP_KEYS[*]}"
  echo "  API_TOKEN_SALT: $API_TOKEN_SALT"
  echo "  ADMIN_JWT_SECRET: $ADMIN_JWT_SECRET"
  echo "  TRANSFER_TOKEN_SALT: $TRANSFER_TOKEN_SALT"
  echo ""
}

configure_domains() {
  header "Configure Domains and CORS"

  question "What is your main domain? (e.g., cockpitsimulator.com)"
  read -r MAIN_DOMAIN

  question "What is your admin dashboard domain? (e.g., dashboard.cockpitsimulator.com)"
  read -r ADMIN_DOMAIN

  question "What is your content/CMS domain? (e.g., content.cockpitsimulator.com)"
  read -r CONTENT_DOMAIN

  # Construct CORS URLs
  MAIN_URL="https://$MAIN_DOMAIN"
  ADMIN_URL="https://$ADMIN_DOMAIN"
  CONTENT_URL="https://$CONTENT_DOMAIN"
  STAGING_URL="https://staging.$MAIN_DOMAIN"

  log "Updating Medusa CORS configuration"
  CORS_DOMAINS="$MAIN_URL,$STAGING_URL"
  run_cmd "sudo sed -i \"s|STORE_CORS=.*|STORE_CORS=$CORS_DOMAINS|\" /srv/cs/env/medusa.env"
  run_cmd "sudo sed -i \"s|ADMIN_CORS=.*|ADMIN_CORS=$ADMIN_URL|\" /srv/cs/env/medusa.env"
  # Allow both prod and staging storefront domains for auth callbacks
  run_cmd "sudo sed -i \"s|AUTH_CORS=.*|AUTH_CORS=$MAIN_URL,$STAGING_URL|\" /srv/cs/env/medusa.env"

  log "Updating Strapi URL configuration"
  run_cmd "sudo sed -i \"s|URL=.*|URL=$CONTENT_URL|\" /srv/cs/env/strapi.env"
  run_cmd "sudo sed -i \"s|ADMIN_URL=.*|ADMIN_URL=$CONTENT_URL/admin|\" /srv/cs/env/strapi.env"

  echo -e "${CYAN}Domain configuration:${NC}"
  echo "  Main: $MAIN_URL"
  echo "  Admin: $ADMIN_URL"
  echo "  Content: $CONTENT_URL"
  echo "  Staging: $STAGING_URL"
  echo ""
}

configure_integrations() {
  header "Configure Integrations (Optional)"

  warn "These integrations are optional. Press Enter to skip any."

  question "Cloudflare R2 public URL (for uploads):"
  read -r R2_URL
  if [[ -n "$R2_URL" ]]; then
    run_cmd "sudo sed -i \"s|R2_PUBLIC_URL=.*|R2_PUBLIC_URL=$R2_URL|\" /srv/cs/env/strapi.env"
  fi

  question "SendGrid API key:"
  read -r SENDGRID_KEY
  if [[ -n "$SENDGRID_KEY" ]]; then
    run_cmd "sudo sed -i \"s|SENDGRID_API_KEY=.*|SENDGRID_API_KEY=$SENDGRID_KEY|\" /srv/cs/env/strapi.env"
  fi

  question "Discord webhook URL:"
  read -r DISCORD_WEBHOOK
  if [[ -n "$DISCORD_WEBHOOK" ]]; then
    run_cmd "sudo sed -i \"s|DISCORD_WEBHOOK_URL=.*|DISCORD_WEBHOOK_URL=$DISCORD_WEBHOOK|\" /srv/cs/env/strapi.env"
  fi

  question "Slack webhook URL:"
  read -r SLACK_WEBHOOK
  if [[ -n "$SLACK_WEBHOOK" ]]; then
    run_cmd "sudo sed -i \"s|SLACK_WEBHOOK_URL=.*|SLACK_WEBHOOK_URL=$SLACK_WEBHOOK|\" /srv/cs/env/strapi.env"
  fi

  log "Integration configuration completed"
}

verify_configuration() {
  header "Verify Configuration"

  log "Checking configuration files..."

  if [[ -f "/srv/cs/.env" ]]; then
    echo -e "${CYAN}Main environment file:${NC}"
    grep -E "^(MEDUSA_IMAGE|STRAPI_IMAGE)" /srv/cs/.env || warn "No image configuration found"
  fi

  if [[ -f "/srv/cs/env/medusa.env" ]]; then
    echo -e "${CYAN}Medusa environment:${NC}"
    grep -E "^(DATABASE_URL|REDIS_URL|STORE_CORS)" /srv/cs/env/medusa.env || warn "No core Medusa config found"
  fi

  if [[ -f "/srv/cs/env/strapi.env" ]]; then
    echo -e "${CYAN}Strapi environment:${NC}"
    grep -E "^(DATABASE_URL|URL|APP_KEYS)" /srv/cs/env/strapi.env || warn "No core Strapi config found"
  fi

  warn "Review the configuration files to ensure all settings are correct:"
  echo "  /srv/cs/.env"
  echo "  /srv/cs/env/medusa.env"
  echo "  /srv/cs/env/strapi.env"
  echo ""
}

main() {
  header "GCE Backend Secrets Configuration"

  log "This script will guide you through configuring all required secrets"
  log "Please have the following information ready:"
  echo "  - GitHub organization/username"
  echo "  - Domain names"
  echo "  - Database credentials"
  echo "  - Optional integration keys"
  echo ""

  check_prerequisites
  configure_registry_images
  configure_database_secrets
  generate_secrets
  configure_domains
  configure_integrations
  verify_configuration

  log "Configuration completed!"
  warn "IMPORTANT:"
  echo "  1. Save all generated secrets to your vault"
  echo "  2. Test the configuration with a dry-run deployment"
  echo "  3. Ensure PostgreSQL and Redis are accessible from Docker containers"
  echo "  4. Configure Cloudflare tunnel before deployment"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
