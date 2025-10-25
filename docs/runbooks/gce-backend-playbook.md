# GCE Backend Deployment Playbook

This checklist distills the operations needed to run Medusa and Strapi on the GCE Ubuntu host introduced in Story 1.6.

## 1. Prepare Directories & Templates
1. `sudo mkdir -p /srv/cs/{env,bin,logs}`
2. Copy templates from the repo checkout (adjust path as needed):
   ```bash
   sudo cp infra/gcp/.env.example /srv/cs/.env
   sudo cp infra/gcp/env/medusa.env.example /srv/cs/env/medusa.env
   sudo cp infra/gcp/env/strapi.env.example /srv/cs/env/strapi.env
   sudo cp infra/gcp/docker-compose.yml /srv/cs/docker-compose.yml
   sudo cp infra/gcp/bin/collect-health.sh /srv/cs/bin/collect-health.sh
   sudo chmod 640 /srv/cs/.env /srv/cs/env/*.env
   sudo chmod 750 /srv/cs/bin/collect-health.sh
   sudo chown <deploy-user>:<deploy-group> -R /srv/cs
   ```

## 2. Install System Dependencies
- Docker Engine + Compose plugin (ensure `docker compose version` works).
- PostgreSQL 15 + Redis 7 on the host (bind to `127.0.0.1`; secure `pg_hba.conf` and Redis password as needed).
- Add the deployment user to the `docker` group: `sudo usermod -aG docker <deploy-user>`.
- Optional: `sudo apt-get install cloudflared` if not already installed.

## 3. Populate Secrets & Config
- `/srv/cs/.env`: set `MEDUSA_IMAGE=ghcr.io/<org>/cs-medusa`, `STRAPI_IMAGE=ghcr.io/<org>/cs-strapi`, `TAG=latest` (workflow overwrites).
- `/srv/cs/env/medusa.env` & `/srv/cs/env/strapi.env`: replace placeholders with production DB/Redis URLs, JWT/APP keys, provider credentials, and CORS domains.
- Store real values in the team vault (GCP Secret Manager / 1Password) for rotation.

## 4. Configure Cloudflare Tunnel
1. 在 Cloudflare Zero Trust → Access → Tunnels 中创建或选择隧道。
2. 复制“Install connector”提供的命令，执行：`sudo cloudflared service install --token <connector-token>`
3. 在控制台的 **Public Hostnames** 中新增：
   - `api.example.com` → `http://127.0.0.1:9000`
   - `content.example.com` → `http://127.0.0.1:1337`
4. 如果需要本地配置（非必需），可改用：
   ```bash
   cloudflared tunnel login          # 下载 cert.pem
   cloudflared tunnel create cs-tunnel
   sudo tee /etc/cloudflared/config.yml <<'YAML'
   tunnel: cs-tunnel
   credentials-file: /etc/cloudflared/cs-tunnel.json
   ingress:
     - hostname: api.example.com
       service: http://127.0.0.1:9000
     - hostname: content.example.com
       service: http://127.0.0.1:1337
     - service: http_status:404
   YAML
   cloudflared tunnel route dns cs-tunnel api.example.com
   cloudflared tunnel route dns cs-tunnel content.example.com
   sudo systemctl enable --now cloudflared
   ```
   根据团队流程任选其一，并确认 `sudo systemctl status cloudflared` 为 active。

## 5. Configure GitHub Secrets
- In repository settings → **Secrets and variables / Actions**, add:
  - `GCE_HOST` – host/IP of the VM
  - `GCE_USER` – SSH user (must own `/srv/cs` and belong to `docker`)
  - `GCE_SSH_KEY` – private key with access to the VM
  - Optional: `GHCR_WRITE_TOKEN` if `GITHUB_TOKEN` cannot push to GHCR

## 6. Dry-Run the Deployment Workflow
1. Push to `staging` (or trigger `Deploy Services` manually).
2. Workflow runs `apps/*/Dockerfile` builds, pushes GHCR tags, copies `scripts/gce/deploy.sh` + `collect-health.sh`, executes `/srv/cs/bin/deploy.sh --tag <sha>`.
3. Verify `/srv/cs/logs/deploy-*.log` and `/srv/cs/logs/health-*.log` were generated.

## 7. Verify and Log Evidence
- External checks:
  ```bash
  curl -I https://api.<domain>/store/health
  curl -I https://content.<domain>/health
  ```
- Append summaries, tunnel IPs, and GH Actions link to `docs/runbooks/status-log.md`.
- Capture `[deploy-log]` tail from the workflow summary for audit.

## 8. Security & Backups
- Restrict firewall to 22/80/443; keep backend services bound to localhost.
- Schedule PostgreSQL/Redis backups (logical dumps or snapshots).
- Document any manual rollbacks (see `infra/gcp/README.md` for commands) and notify incident channels if triggered.

## 9. Promote to Production
- Repeat the workflow on `main` once staging verification is complete.
- Confirm Cloudflare tunnel endpoints return HTTP 200, and update the status log with production evidence.
