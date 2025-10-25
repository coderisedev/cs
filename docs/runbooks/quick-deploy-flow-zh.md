# Quick Deploy 流程梳理

整理快速部署脚本与凭据准备之间的关联，帮助运维团队更好理解执行流程。

## 流程概览
- `scripts/gce/setup-backend.sh` 脚本会初始化 `/srv/cs`，复制 Compose 模板并安装依赖；首次建议使用 `--dry-run`，随后需要手动在 `.env`、`env/medusa.env`、`env/strapi.env` 中填入真实值。
- 手动清单与脚本步骤一致：建立目录、校对环境文件、配置 Cloudflare Tunnel，然后推送到 `staging` 分支，触发 GitHub Actions 执行 `scripts/gce/deploy.sh`。
- `deploy.sh` 读取 `/srv/cs/.env` 的 `MEDUSA_IMAGE`、`STRAPI_IMAGE`、`TAG`，通过仓库机密（`GCE_*`，可选 `GHCR_WRITE_TOKEN`）进行 SSH 部署，更新镜像并重启 Compose 服务。

## 凭据映射
- `/srv/cs/.env` 必须写入 GHCR 镜像前缀；Actions 会注入 `TAG`。缺失值会导致 `docker compose pull` 失败。
- `/srv/cs/env/medusa.env` 需要提供 Medusa 的数据库/Redis 连接、认证密钥、CORS 域名以及支付、监控等第三方变量，否则容器无法通过健康检查。
- `/srv/cs/env/strapi.env` 需包含数据库凭据、安全密钥、Cloudflare R2 参数和 SendGrid/Discord/Slack 集成密钥，以支撑 CMS 登录与媒体上传。
- Cloudflare API Token 与隧道凭据用于 `cloudflared` 发布 `api.*`、`content.*` 域名；缺少这些权限将无法写入 DNS 和建立隧道。
- 所有密钥应存放在 1Password 或 GCP Secret Manager，并在触发自动化前同步到 `/srv/cs`，确保部署端到端成功。

## 建议步骤
1. 按 `docs/runbooks/quick-deploy-credential-checklist.md` 核对密钥仓库中的条目。
2. 使用 `--dry-run` 运行初始化脚本，填充环境文件后去掉该参数重新执行部署。
