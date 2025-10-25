#!/usr/bin/env bash
set -euo pipefail

# Cloudflare Tunnel Configuration Script for GCE Backend
# This script helps configure Cloudflare tunnel for the backend services

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--dry-run] [--help]

Configures Cloudflare tunnel to expose backend services through Cloudflare's network.

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

  if ! command -v cloudflared >/dev/null 2>&1; then
    error "cloudflared not found. Install it first with the dependencies script."
    exit 1
  fi

  if [[ ! -f "$HOME/.cloudflared/cert.pem" ]]; then
    warn "Cloudflare credentials not found. You will need to authenticate."
    echo "Run: cloudflared tunnel login"
  fi

  log "Prerequisites check completed"
}

authenticate_cloudflare() {
  header "Authenticate with Cloudflare"

  if [[ ! -f "$HOME/.cloudflared/cert.pem" ]]; then
    log "Please authenticate with Cloudflare..."
    run_cmd "cloudflared tunnel login"
  else
    log "Already authenticated with Cloudflare"
  fi
}

create_tunnel() {
  header "Create Cloudflare Tunnel"

  TUNNEL_NAME="cs-tunnel"

  log "Creating tunnel: $TUNNEL_NAME"

  # Check if tunnel already exists
  if cloudflared tunnel list 2>/dev/null | awk 'NR>1 {print $2}' | grep -qx "$TUNNEL_NAME"; then
    warn "Tunnel $TUNNEL_NAME already exists"
    TUNNEL_UUID=$(cloudflared tunnel list 2>/dev/null | awk -v name="$TUNNEL_NAME" 'NR>1 && $2==name {print $1; exit}')
  else
    log "Creating new tunnel"
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "[DRY-RUN] cloudflared tunnel create $TUNNEL_NAME"
      TUNNEL_UUID="generated-uuid"
    else
      TUNNEL_OUTPUT=$(cloudflared tunnel create "$TUNNEL_NAME")
      TUNNEL_UUID=$(echo "$TUNNEL_OUTPUT" | grep -o '[a-f0-9-]\{36\}' | head -n1)
    fi
  fi

  if [[ -z "$TUNNEL_UUID" ]]; then
    error "Unable to determine tunnel UUID. Verify Cloudflare account permissions."
    exit 1
  fi

  log "Tunnel UUID: $TUNNEL_UUID"
  echo "TUNNEL_UUID=$TUNNEL_UUID" > /tmp/tunnel_info
  echo "TUNNEL_NAME=$TUNNEL_NAME" >> /tmp/tunnel_info
}

create_config() {
  header "Create Tunnel Configuration"

  question "What is your API domain? (e.g., api.cockpitsimulator.com)"
  read -r API_DOMAIN

  question "What is your content/CMS domain? (e.g., content.cockpitsimulator.com)"
  read -r CONTENT_DOMAIN

  # Create config directory
  run_cmd "sudo mkdir -p /etc/cloudflared"

  # Create config file
  CONFIG_FILE="/etc/cloudflared/config.yml"

  if [[ -f "$CONFIG_FILE" ]]; then
    warn "Config file already exists. Creating backup..."
    run_cmd "sudo cp $CONFIG_FILE ${CONFIG_FILE}.backup.$(date +%Y%m%d-%H%M%S)"
  fi

  log "Creating Cloudflare tunnel configuration"
  sudo tee "$CONFIG_FILE" > /dev/null <<CONFIG
tunnel: cs-tunnel
credentials-file: /etc/cloudflared/cs-tunnel.json

ingress:
  - hostname: $API_DOMAIN
    service: http://127.0.0.1:9000
  - hostname: $CONTENT_DOMAIN
    service: http://127.0.0.1:1337
  - service: http_status:404
CONFIG

  log "Configuration created: $CONFIG_FILE"
  echo "API_DOMAIN=$API_DOMAIN" >> /tmp/tunnel_info
  echo "CONTENT_DOMAIN=$CONTENT_DOMAIN" >> /tmp/tunnel_info
}

setup_tunnel_credentials() {
  header "Setup Tunnel Credentials"

  if [[ -f "/tmp/tunnel_info" ]]; then
    source /tmp/tunnel_info
  else
    error "Tunnel information not found. Run create_tunnel first."
    exit 1
  fi

  log "Setting up tunnel credentials file"

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY-RUN] cloudflared tunnel route dns cs-tunnel $API_DOMAIN"
    echo "[DRY-RUN] cloudflared tunnel route dns cs-tunnel $CONTENT_DOMAIN"
    echo "[DRY-RUN] cloudflared tunnel credentials create $TUNNEL_NAME"
    echo "[DRY-RUN] sudo install -o root -g root -m 600 ~/.cloudflared/${TUNNEL_UUID}.json /etc/cloudflared/cs-tunnel.json"
    return
  fi

  # Route DNS entries
  log "Routing DNS for $API_DOMAIN"
  cloudflared tunnel route dns "$TUNNEL_NAME" "$API_DOMAIN"

  log "Routing DNS for $CONTENT_DOMAIN"
  cloudflared tunnel route dns "$TUNNEL_NAME" "$CONTENT_DOMAIN"

  # Ensure credentials file exists
  log "Generating tunnel credentials file"
  cloudflared tunnel credentials create "$TUNNEL_NAME" >/dev/null

  local source_credentials="$HOME/.cloudflared/${TUNNEL_UUID}.json"
  if [[ ! -f "$source_credentials" ]]; then
    error "Expected credentials at $source_credentials but none found"
    exit 1
  fi

  # Install credentials with correct permissions
  run_cmd "sudo install -o root -g root -m 600 $source_credentials /etc/cloudflared/cs-tunnel.json"

  log "Tunnel credentials configured"
}

setup_systemd_service() {
  header "Setup Cloudflare Tunnel Service"

  log "Creating systemd service for cloudflared"

  # Create systemd service file
  sudo tee /etc/systemd/system/cloudflared.service > /dev/null <<SERVICE
[Unit]
Description=cloudflared
After=network.target

[Service]
Type=simple
User=cloudflared
Group=cloudflared
ExecStart=/usr/bin/cloudflared tunnel --config /etc/cloudflared/config.yml run
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

  # Create cloudflared user if not exists
  if ! id "cloudflared" &>/dev/null; then
    run_cmd "sudo useradd --system --home-dir /etc/cloudflared --shell /usr/sbin/nologin cloudflared"
  fi

  # Set ownership
  run_cmd "sudo chown -R cloudflared:cloudflared /etc/cloudflared"

  # Enable and start service
  run_cmd "sudo systemctl daemon-reload"
  run_cmd "sudo systemctl enable cloudflared"
  run_cmd "sudo systemctl start cloudflared"

  log "Cloudflare tunnel service configured and started"
}

verify_tunnel() {
  header "Verify Tunnel Configuration"

  log "Checking service status"
  run_cmd "sudo systemctl status cloudflared --no-pager"

  log "Checking tunnel connectivity"
  sleep 5  # Give service time to start

  if [[ -f "/tmp/tunnel_info" ]]; then
    source /tmp/tunnel_info
    log "Testing tunnel connectivity..."
    log "API: https://$API_DOMAIN/store/health"
    log "Content: https://$CONTENT_DOMAIN/health"
  fi

  log "Tunnel logs can be viewed with: sudo journalctl -u cloudflared -f"
}

create_tunnel_management_commands() {
  header "Create Tunnel Management Commands"

  log "Creating tunnel management helper script"

  sudo tee /usr/local/bin/cs-tunnel > /dev/null <<'SCRIPT'
#!/usr/bin/env bash
case "$1" in
  status)
    sudo systemctl status cloudflared --no-pager
    ;;
  logs)
    sudo journalctl -u cloudflared -f
    ;;
  restart)
    sudo systemctl restart cloudflared
    echo "Cloudflare tunnel restarted"
    ;;
  stop)
    sudo systemctl stop cloudflared
    echo "Cloudflare tunnel stopped"
    ;;
  start)
    sudo systemctl start cloudflared
    echo "Cloudflare tunnel started"
    ;;
  *)
    echo "Usage: cs-tunnel {status|logs|restart|stop|start}"
    exit 1
    ;;
esac
SCRIPT

  run_cmd "sudo chmod +x /usr/local/bin/cs-tunnel"

  log "Tunnel management commands available:"
  echo "  cs-tunnel status   - Check tunnel status"
  echo "  cs-tunnel logs     - View tunnel logs"
  echo "  cs-tunnel restart  - Restart tunnel"
  echo "  cs-tunnel stop     - Stop tunnel"
  echo "  cs-tunnel start    - Start tunnel"
}

main() {
  header "Cloudflare Tunnel Configuration"

  log "This script will configure Cloudflare tunnel to expose your backend services"
  log "Please have the following ready:"
  echo "  - Cloudflare account access"
  echo "  - Domain names for API and content services"
  echo "  - Permission to modify DNS records"
  echo ""

  check_prerequisites
  authenticate_cloudflare
  create_tunnel
  create_config
  setup_tunnel_credentials
  setup_systemd_service
  verify_tunnel
  create_tunnel_management_commands

  log "Cloudflare tunnel configuration completed!"

  if [[ -f "/tmp/tunnel_info" ]]; then
    source /tmp/tunnel_info
    echo ""
    header "Tunnel Summary"
    echo "  API URL: https://$API_DOMAIN"
    echo "  Content URL: https://$CONTENT_DOMAIN"
    echo "  Tunnel Name: cs-tunnel"
    echo "  Management: cs-tunnel {status|logs|restart|stop|start}"
  fi

  # Cleanup
  rm -f /tmp/tunnel_info

  warn "Next steps:"
  echo "  1. Test the tunnel URLs"
  echo "  2. Configure SSL certificates in your applications"
  echo "  3. Update your application URLs if needed"
  echo "  4. Set up monitoring for the tunnel service"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
