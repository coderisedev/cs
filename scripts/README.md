# Development Scripts

Collection of utility scripts for managing the development environment.

## Available Scripts

### 🔄 restart-dev.sh

Intelligently restarts the development environment by:
1. Checking if Medusa and Next.js are currently running
2. Gracefully stopping them if they are
3. Ensuring Docker infrastructure (PostgreSQL, Redis) is running
4. Starting Medusa backend and Next.js storefront
5. Waiting for services to be ready
6. Logging all output to files

**Usage:**
```bash
./scripts/restart-dev.sh
```

**Features:**
- ✅ Automatic process detection and cleanup
- ✅ Health checks for all services
- ✅ Colored output for easy reading
- ✅ Logs saved to `logs/` directory
- ✅ PID files for easy management
- ✅ Waits for services to be ready before completing

**Output:**
- Medusa logs: `logs/medusa-dev.log`
- Next.js logs: `logs/next-dev.log`
- PIDs saved to: `logs/medusa.pid` and `logs/next.pid`

---

### 🛑 stop-dev.sh

Gracefully stops the development environment:
1. Stops Next.js storefront
2. Stops Medusa backend
3. Cleans up PID files
4. Leaves Docker infrastructure running

**Usage:**
```bash
./scripts/stop-dev.sh
```

**Features:**
- ✅ Graceful shutdown with SIGTERM
- ✅ Force kill if process doesn't stop
- ✅ Works with or without PID files
- ✅ Cleans up PID files automatically

**Note:** Docker infrastructure (PostgreSQL, Redis) continues running. To stop them:
```bash
docker compose -f docker-compose.local.yml down
```

---

### 📊 status-dev.sh

Shows the current status of all development services:
1. Infrastructure services (Docker)
2. Application services (Medusa, Next.js)
3. Health check results
4. Log file locations

**Usage:**
```bash
./scripts/status-dev.sh
```

**Output includes:**
- ✅ PostgreSQL status and container info
- ✅ Redis status and container info
- ✅ Medusa backend status, PID, and health
- ✅ Next.js storefront status, PID, and health
- ✅ Log file locations and sizes
- ✅ Quick action commands

---

## Quick Reference

```bash
# Check status of all services
./scripts/status-dev.sh

# Restart development environment
./scripts/restart-dev.sh

# Stop development environment
./scripts/stop-dev.sh

# View Medusa logs
tail -f logs/medusa-dev.log

# View Next.js logs
tail -f logs/next-dev.log

# Stop infrastructure (PostgreSQL, Redis)
docker compose -f docker-compose.local.yml down
```

---

## Service URLs

After starting with `restart-dev.sh`:

| Service | URL | Description |
|---------|-----|-------------|
| Storefront | http://localhost:8000 | Customer-facing store |
| Medusa API | http://localhost:9000 | Backend API |
| Medusa Admin | http://localhost:9000/app | Admin dashboard |
| PostgreSQL | localhost:5432 | Database (cs/cs) |
| Redis | localhost:6379 | Cache |

---

## Troubleshooting

### Script won't execute
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

### Port already in use
The script will automatically detect and stop existing processes on ports 9000 and 8000.

### Services won't start
```bash
# Check logs
tail -f logs/medusa-dev.log
tail -f logs/next-dev.log

# Ensure infrastructure is running
docker compose -f docker-compose.local.yml up -d

# Check Docker status
docker ps | grep cs
```

### Manual cleanup
```bash
# Find and kill processes manually
lsof -i :9000
lsof -i :8000

# Kill specific PID
kill -9 <PID>

# Clean up log and PID files
rm -rf logs/*.log logs/*.pid
```

---

## Advanced Usage

### Run in detached mode (default)

The `restart-dev.sh` script runs services in the background with output logged to files:

```bash
./scripts/restart-dev.sh
# Services run in background, you can close the terminal
```

### Monitor logs in real-time

```bash
# In separate terminals
tail -f logs/medusa-dev.log
tail -f logs/next-dev.log

# Or use tmux/screen to split panes
```

### Integration with other tools

```bash
# Use with watch for continuous monitoring
watch -n 5 './scripts/status-dev.sh'

# Chain with other commands
./scripts/restart-dev.sh && sleep 5 && curl http://localhost:8000
```

---

## Files Created

When you run `restart-dev.sh`:

```
logs/
├── medusa-dev.log    # Medusa backend output
├── next-dev.log      # Next.js storefront output
├── medusa.pid        # Medusa process ID
└── next.pid          # Next.js process ID
```

---

## Related Documentation

- [Development Service Management Guide](../docs/basic/development-service-management-guide.md)
- [Product Page Errors Fix](../docs/fix/product-page-errors-fix-retrospective.md)
- [Image Display Fix](../docs/fix/image-display-fix-retrospective.md)
