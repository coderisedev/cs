#!/usr/bin/env bash
set -euo pipefail

# System Dependencies Installation Script for GCE Backend
# This script installs Docker, PostgreSQL, Redis, and other required dependencies

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--dry-run] [--help]

Installs all system dependencies required for the GCE backend deployment.

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

check_system() {
  log "Checking system requirements..."

  if [[ ! -f /etc/os-release ]]; then
    error "Cannot determine OS version"
    exit 1
  fi

  source /etc/os-release
  if [[ "$ID" != "ubuntu" ]]; then
    error "This script is designed for Ubuntu. Detected OS: $ID"
    exit 1
  fi

  if ! dpkg --compare-versions "$VERSION_ID" ge "22.04"; then
    error "Ubuntu 22.04 or higher required. Detected: $VERSION_ID"
    exit 1
  fi

  log "System check passed: Ubuntu $VERSION_ID"
}

install_docker() {
  log "Installing Docker Engine + Compose plugin..."

  # Remove old versions
  run_cmd "sudo apt-get remove -y docker docker-engine docker.io containerd runc || true"

  # Update package index
  run_cmd "sudo apt-get update"

  # Install packages for apt repository over HTTPS
  run_cmd "sudo apt-get install -y ca-certificates curl gnupg lsb-release"

  # Add Docker's official GPG key
  run_cmd "sudo mkdir -p /etc/apt/keyrings"
  run_cmd "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg"

  # Set up the repository
  run_cmd "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null"

  # Update package index again
  run_cmd "sudo apt-get update"

  # Install Docker Engine, CLI, containerd, and Docker Compose plugin
  run_cmd "sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin"

  # Start and enable Docker
  run_cmd "sudo systemctl start docker"
  run_cmd "sudo systemctl enable docker"

  # Add current user to docker group
  run_cmd "sudo usermod -aG docker $USER"

  # Verify Docker installation
  run_cmd "sudo docker run --rm hello-world"
  run_cmd "docker compose version"

  log "Docker installation completed"
}

install_postgresql() {
  log "Installing PostgreSQL 15..."

  # Add PostgreSQL official repository
  run_cmd "sudo apt-get install -y wget gnupg2 software-properties-common"
  run_cmd "wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -"
  run_cmd "echo \"deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main\" | sudo tee /etc/apt/sources.list.d/pgdg.list"

  # Update package index
  run_cmd "sudo apt-get update"

  # Install PostgreSQL 15
  run_cmd "sudo apt-get install -y postgresql-15 postgresql-client-15"

  # Start and enable PostgreSQL
  run_cmd "sudo systemctl start postgresql"
  run_cmd "sudo systemctl enable postgresql"

  # Create cs user and databases
  run_cmd "sudo -u postgres createuser -s cs || true"
  run_cmd "sudo -u postgres createdb -O cs medusa_production || true"
  run_cmd "sudo -u postgres createdb -O cs strapi_production || true"

  # Set password for cs user (will need to be changed manually)
  run_cmd "sudo -u postgres psql -c \"ALTER USER cs PASSWORD 'change-me-password';\""

  log "PostgreSQL installation completed"
  warn "Remember to change the PostgreSQL password for the 'cs' user"
}

install_redis() {
  log "Installing Redis 7..."

  # Add Redis official repository
  run_cmd "sudo apt-get install -y lsb-release curl gpg"
  run_cmd "curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg"
  run_cmd "echo \"deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main\" | sudo tee /etc/apt/sources.list.d/redis.list"

  # Update package index
  run_cmd "sudo apt-get update"

  # Install Redis
  run_cmd "sudo apt-get install -y redis"

  # Configure Redis to bind to localhost only
  run_cmd "sudo sed -i 's/^bind .*/bind 127.0.0.1 ::1/' /etc/redis/redis.conf"

  # Set Redis password (will need to be changed manually)
  run_cmd "sudo sed -i 's/^# requirepass .*/requirepass change-me-password/' /etc/redis/redis.conf"

  # Start and enable Redis
  run_cmd "sudo systemctl start redis-server"
  run_cmd "sudo systemctl enable redis-server"

  # Test Redis
  run_cmd "redis-cli ping"

  log "Redis installation completed"
  warn "Remember to change the Redis password in /etc/redis/redis.conf"
}

install_cloudflared() {
  log "Installing cloudflared..."

  if command -v cloudflared >/dev/null 2>&1; then
    log "cloudflared already installed"
    return
  fi

  # Download and install cloudflared
  run_cmd "wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb"
  run_cmd "sudo dpkg -i cloudflared-linux-amd64.deb"
  run_cmd "rm cloudflared-linux-amd64.deb"

  # Verify installation
  run_cmd "cloudflared --version"

  log "cloudflared installation completed"
}

configure_firewall() {
  log "Configuring firewall..."

  # Install ufw if not present
  run_cmd "sudo apt-get install -y ufw"

  # Reset firewall rules
  run_cmd "sudo ufw --force reset"

  # Default policies
  run_cmd "sudo ufw default deny incoming"
  run_cmd "sudo ufw default allow outgoing"

  # Allow SSH (port 22)
  run_cmd "sudo ufw allow 22/tcp"

  # Allow HTTP and HTTPS
  run_cmd "sudo ufw allow 80/tcp"
  run_cmd "sudo ufw allow 443/tcp"

  # Enable firewall
  run_cmd "sudo ufw --force enable"

  log "Firewall configuration completed"
}

main() {
  log "Starting system dependencies installation..."

  check_system
  install_docker
  install_postgresql
  install_redis
  install_cloudflared
  configure_firewall

  log "System dependencies installation completed!"
  warn ""
  warn "IMPORTANT POST-INSTALLATION STEPS:"
  warn "1. Change PostgreSQL password for 'cs' user"
  warn "2. Change Redis password in /etc/redis/redis.conf"
  warn "3. Reboot or log out and log back in to apply docker group membership"
  warn "4. Secure PostgreSQL pg_hba.conf for production"
  warn ""
  warn "After reboot, verify installations:"
  warn "  - docker run --rm hello-world"
  warn "  - docker compose version"
  warn "  - sudo systemctl status postgresql"
  warn "  - sudo systemctl status redis-server"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
