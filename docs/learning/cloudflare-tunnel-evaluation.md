# 生产级部署评估：GCE + PM2 + Cloudflare Tunnel

**最后更新**: 2026-01-13
**背景**: 当前架构采用 GCE 服务器，使用 PM2 管理应用进程，并通过 Cloudflare Tunnel (cloudflared) 暴露服务，未使用 Nginx。

---

## 1. 架构解析 (Zero Trust 模式)

在这种架构中，服务器不开放任何入站端口（80/443），而是由内部的 `cloudflared` 守护进程主动向 Cloudflare 边缘节点发起加密出站连接。

```mermaid
graph LR
    User[用户] -->|HTTPS| CF[Cloudflare Edge]
    CF -->|加密隧道 (Tunnel)| GCE[GCE 服务器]
    
    subgraph GCE_Internal [GCE 内部网络]
        Daemon[cloudflared 守护进程]
        Medusa[PM2: Medusa (9000)]
        Strapi[PM2: Strapi (1337)]
    end
    
    Daemon -->|localhost:9000| Medusa
    Daemon -->|localhost:1337| Strapi
```

---

## 2. 安全性评估：极高 (S级)

这是该方案最大的亮点，安全性显著优于传统的 Nginx 反向代理。

1.  **隐藏真实 IP**: 攻击者无法获取 GCE 的真实 IP，DDoS 攻击被 Cloudflare 边缘完全吸收。
2.  **防火墙全闭**: VPC 防火墙可以配置为 `Deny All Inbound`（拒绝所有入站），彻底杜绝端口扫描和暴力破解。
3.  **无需 SSL 管理**: 服务器内部仅需处理 HTTP 明文流量，SSL 证书由 Cloudflare 边缘自动管理和轮转，杜绝证书过期事故。

---

## 3. 稳定性评估：良 (A-级)

虽然稳定，但存在“单点依赖”风险。

1.  **cloudflared 进程**: 它是流量的唯一入口。如果该进程崩溃或 OOM，服务将全线中断。
    *   *对策*: 必须通过 `systemd` 托管，并配置自动重启。
2.  **Cloudflare 依赖**: 强依赖 CF 边缘节点的可用性（通常 SLA 很高）。
3.  **长连接限制**: 对于超大文件上传（如 Strapi 上传 1GB 视频），Tunnel 偶发连接重置。建议大文件直接传 S3/R2 预签名 URL。

---

## 4. 生产级检查清单 (Checklist)

要确保此方案达到生产标准，必须满足以下条件：

### A. 守护进程化 (Systemd)
严禁在 SSH 会话、`screen` 或 `tmux` 中运行 `cloudflared`。必须注册为系统服务：
```bash
sudo systemctl status cloudflared
# 期望输出: Active: active (running)
```

### B. PM2 健壮性
应用进程必须具备崩溃自动重启能力，且配置了日志轮转防止磁盘写满。
*   检查 `ecosystem.config.cjs` 是否配置了 `max_memory_restart`。
*   检查是否安装了 `pm2-logrotate`。

### C. 副本冗余 (可选高阶)
Cloudflare Tunnel 支持多副本 (Replica)。可以在两台不同的 GCE 上运行同一个 Tunnel Token，Cloudflare 会自动实现负载均衡和故障转移。

---

## 5. 结论

**这是一个完全合格且优秀的生产级方案，特别适合 DTC 品牌。**

它以极低的运维成本换取了企业级的安全性（Zero Trust）。只要确保 `cloudflared` 和 `PM2` 的配置得当，它比自建 Nginx 更安全、更省心。
