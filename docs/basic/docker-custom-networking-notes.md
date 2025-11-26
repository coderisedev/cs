---
last_updated: 2025-02-16
status: ⚠ Needs Test
---

# Docker Custom Networks (Semantic Tree)
- **目標**：同機運行多套容器（dev/prod）時，用可控網段避免衝突，穩定訪問宿主。
- **核心概念**：自定義 bridge 網絡 = 指定 `subnet` 和 `gateway`。`extra_hosts` 把 `host.docker.internal` 指向該網關，容器靠它訪問宿主。
- **創建/查看**：`docker network create --driver bridge --subnet 172.30.0.0/16 --gateway 172.30.0.1 cs-prod-net`；`docker network inspect cs-prod-net | jq '.[0].IPAM.Config'`。
- **為何自定義**：隔離（dev 172.31.x, prod 172.30.x）、穩定（固定網關）、控制（防火牆/路由規則可預期）。
- **選網段/網關**：挑未被宿主/VPN 占用的私網段（10/8、172.16-31/12、192.168/16），網關常用首個 IP（x.x.x.1）。
- **compose 用法**：`ipam` 配 subnet/gateway，服務內 `extra_hosts: ["host.docker.internal:172.30.0.1"]`，容器內 `ping host.docker.internal` 應指向 172.30.0.1。
- **驗證**：容器內 `ip route | grep default` 看網關；`docker inspect <container> | grep Gateway`；避免宿主已有同網段。

# Docker 自定義網段（費曼法講解）
- 自定義網段 = 你決定容器的 IP 範圍和默認網關，不靠 Docker 隨機的 172.17/18。
- 需求：同機跑 dev/prod。若用默認網段，IP 可能撞、`host.docker.internal` 解析不穩。自定義後 prod 用 172.30.0.0/16、dev 用 172.31.0.0/16，彼此獨立。
- 原理：容器出網靠默認網關；你把網關設 172.30.0.1，再用 `extra_hosts` 把 `host.docker.internal` 指到 172.30.0.1，容器訪問宿主變得固定。
- 驗證自測：`docker network inspect` 看 subnet/gateway；容器內 `ip route` 看到 `default via 172.30.0.1`；`ping host.docker.internal` 應指向 172.30.0.1。
- 容易踩坑：不知道網關作用 → 看 `ip route`；不了解 `extra_hosts` → 它只是 DNS 映射；選了衝突網段 → 用 `ip addr`/`ip route` 先檢查宿主網段。
